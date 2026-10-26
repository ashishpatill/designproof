/**
 * requireHostedGenerationAccess — the single gate for hosted LLM generation
 * (/api/restyle, /api/redesign, /api/voice, /api/design).
 *
 * Rules (see .opencode-loops/hosted-e2e/PLAN.md):
 * - Neon Auth session required; unauthenticated → 401 JSON.
 * - Entitlements resolve from Neon user_entitlements; first session → Free.
 * - Free: server uses its own hosted key only — client BYOK headers are
 *   ignored, never accepted as a Free substitute for a paid plan.
 * - Maker/Studio: higher caps; BYOK headers may override the hosted key.
 * - Rate limits are per-IP + per-user daily caps + per-user in-flight
 *   concurrency (Neon generation_inflight); over-quota or over-concurrency →
 *   429 with Retry-After. Routes release the slot via context.releaseInflight
 *   in a finally block.
 *
 * Pure decision logic lives here and is unit-tested without Neon/Dodo by
 * injecting a SqlExecutor + session resolver.
 */
import { NextResponse } from "next/server";
import {
  bumpUsage,
  getEntitlementExecutor,
  hashIp,
  inflightBucketFor,
  isHostedPlan,
  readUsage,
  releaseInflight,
  resolveUserPlan,
  tryAcquireInflight,
  usageWindowStart,
  type SqlExecutor,
} from "@/lib/entitlements";
import { getSessionFromRequest, type HostedSession } from "@/lib/neon-auth";
import { GEMINI_KEY_HEADER, CURSOR_KEY_HEADER } from "@/lib/byok";
import type { HostedPlan } from "@/lib/entitlements";

export type { HostedPlan };

export interface PlanCaps {
  /** Per-user generations / UTC day. */
  userDailyCap: number;
  /** Per-IP generations / UTC day (anti-farming). */
  ipDailyCap: number;
  /** Max in-flight hosted generations for this plan. */
  concurrency: number;
  byokAllowed: boolean;
  /** @deprecated use userDailyCap — kept for older call sites/tests */
  dailyCap: number;
}

/**
 * CEO interim Free caps (2026-10-26): flash-only, 10/user/day, 20/IP/day, concurrency 1.
 * Maker/Studio numeric caps wait GTM plan-of-record — defaults are intentionally huge
 * placeholders and MUST be overridden via HOSTED_*_DAILY_LIMIT before claiming product numbers.
 */
export const DEFAULT_PLAN_CAPS: Record<HostedPlan, PlanCaps> = {
  free: { userDailyCap: 10, ipDailyCap: 20, concurrency: 1, byokAllowed: false, dailyCap: 10 },
  maker: { userDailyCap: 1_000_000, ipDailyCap: 1_000_000, concurrency: 4, byokAllowed: true, dailyCap: 1_000_000 },
  studio: { userDailyCap: 1_000_000, ipDailyCap: 1_000_000, concurrency: 8, byokAllowed: true, dailyCap: 1_000_000 },
};

export function planCaps(plan: HostedPlan, env: Record<string, string | undefined> = process.env): PlanCaps {
  const base = DEFAULT_PLAN_CAPS[plan];
  const envKey = { free: "HOSTED_FREE_DAILY_LIMIT", maker: "HOSTED_MAKER_DAILY_LIMIT", studio: "HOSTED_STUDIO_DAILY_LIMIT" }[plan];
  const ipKey = { free: "HOSTED_FREE_IP_DAILY_LIMIT", maker: "HOSTED_MAKER_IP_DAILY_LIMIT", studio: "HOSTED_STUDIO_IP_DAILY_LIMIT" }[plan];
  const concKey = { free: "HOSTED_FREE_CONCURRENCY", maker: "HOSTED_MAKER_CONCURRENCY", studio: "HOSTED_STUDIO_CONCURRENCY" }[plan];
  const userRaw = env[envKey]?.trim();
  const ipRaw = env[ipKey]?.trim();
  const concRaw = env[concKey]?.trim();
  const userN = userRaw ? Number(userRaw) : NaN;
  const ipN = ipRaw ? Number(ipRaw) : NaN;
  const concN = concRaw ? Number(concRaw) : NaN;
  const userDailyCap = Number.isFinite(userN) && userN >= 1 ? Math.floor(userN) : base.userDailyCap;
  const ipDailyCap = Number.isFinite(ipN) && ipN >= 1 ? Math.floor(ipN) : (plan === "free" ? base.ipDailyCap : userDailyCap);
  const concurrency = Number.isFinite(concN) && concN >= 1 ? Math.floor(concN) : base.concurrency;
  return { ...base, userDailyCap, ipDailyCap, concurrency, dailyCap: userDailyCap };
}


export interface HostedKeys {
  gemini?: string;
  cursor?: string;
  source: "hosted-open-weights" | "byok";
}

/**
 * Key policy per plan. Free reads env-only ("cheap open-weights" hosted key);
 * paid tiers may override with their own BYOK headers.
 */
export function resolveHostedKeys(
  request: Request,
  plan: HostedPlan,
  env: Record<string, string | undefined> = process.env,
): HostedKeys {
  const geminiEnv = env.GEMINI_API_KEY?.trim() || env.HOSTED_OPENWEIGHTS_API_KEY?.trim() || undefined;
  const cursorEnv = env.CURSOR_API_KEY?.trim() || undefined;
  if (plan === "free" || !planCaps(plan).byokAllowed) {
    // Free never sees client keys — hosted key (cheap open-weights) only.
    return { gemini: geminiEnv, cursor: cursorEnv, source: "hosted-open-weights" };
  }
  const fromHeader = (name: string) => request.headers.get(name)?.trim() || undefined;
  return {
    gemini: fromHeader(GEMINI_KEY_HEADER) || geminiEnv,
    cursor: fromHeader(CURSOR_KEY_HEADER) || cursorEnv,
    source: request.headers.get(GEMINI_KEY_HEADER) || request.headers.get(CURSOR_KEY_HEADER) ? "byok" : "hosted-open-weights",
  };
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
  counts: { user: number; ip: number; cap: number };
}

/** Pure limit check: user and IP caps are independent (CEO Free = 10/user + 20/IP). */
export function decideRateLimit(
  userCount: number,
  ipCount: number,
  userCap: number,
  ipCap: number = userCap,
  windowResetSeconds = secondsUntilWindowReset(),
): RateLimitDecision {
  const userOk = userCount < userCap;
  const ipOk = ipCount < ipCap;
  if (userOk && ipOk) {
    return { allowed: true, retryAfterSeconds: 0, counts: { user: userCount, ip: ipCount, cap: userCap } };
  }
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.min(86400, windowResetSeconds)),
    counts: { user: userCount, ip: ipCount, cap: userOk ? ipCap : userCap },
  };
}

export function secondsUntilWindowReset(now: Date = new Date()): number {
  const start = usageWindowStart(now);
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.round((next - now.getTime()) / 1000));
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const first = fwd?.split(",")[0]?.trim();
  return first || "unknown-ip";
}

export interface HostedAccessContext {
  session: HostedSession;
  plan: HostedPlan;
  caps: PlanCaps;
  keys: HostedKeys;
  entitlementSource: string;
  /**
   * Release the in-flight slot this request holds. Idempotent; routes MUST
   * call it in a finally block covering the whole generation path, including
   * early returns after the gate.
   */
  releaseInflight?: () => Promise<void>;
}

export interface HostedDeps {
  executor?: SqlExecutor | null;
  getSession?: (request: Request) => Promise<HostedSession | null>;
  now?: Date;
}

function response401(reason: string): NextResponse {
  return NextResponse.json(
    { ok: false, error: "auth_required: sign in to use hosted generation", reason },
    { status: 401 },
  );
}

export interface HostedAccessResult {
  ok: boolean;
  context?: HostedAccessContext;
  error?: NextResponse;
}

/**
 * Resolve session → entitlement → caps → rate limit, then report which keys
 * the route may use. Routes must pass the *context.keys* onward instead of
 * calling byok.ts resolvers directly.
 */
export async function requireHostedGenerationAccess(
  request: Request,
  deps: HostedDeps = {},
): Promise<HostedAccessResult> {
  const session = await (deps.getSession ?? getSessionFromRequest)(request);
  if (!session) {
    return {
      ok: false,
      error: response401(
        "No Neon Auth session. Configure NEON_AUTH_BASE_URL + NEON_AUTH_COOKIE_SECRET, sign in, or bring a capability license.",
      ),
    };
  }

  const executor = deps.executor ?? getEntitlementExecutor();
  if (!executor) {
    return {
      ok: false,
      error: NextResponse.json(
        { ok: false, error: "entitlements_unavailable: set DATABASE_URL (Neon) for hosted generation" },
        { status: 401 },
      ),
    };
  }

  let plan: HostedPlan = "free";
  let source = "default";
  try {
    const row = await resolveUserPlan(executor, session.userId);
    plan = isHostedPlan(row.plan) ? row.plan : "free";
    source = row.source;
  } catch {
    // Entitlement lookup failed — degrade to Free caps rather than allowing paid tiers unverified.
    plan = "free";
    source = "default";
  }

  const caps = planCaps(plan);
  const windowStart = usageWindowStart(deps.now ?? new Date()).toISOString();
  const userBucket = `user:${session.userId}:daily`;
  const ipBucket = `ip:${hashIp(clientIp(request))}:daily`;
  const counts = { user: 0, ip: 0, cap: caps.userDailyCap,
          userCap: caps.userDailyCap,
          ipCap: caps.ipDailyCap, windowStart };
  try {
    counts.user = await readUsage(executor, userBucket, new Date(windowStart));
    counts.ip = await readUsage(executor, ipBucket, new Date(windowStart));
  } catch {
    /* missing table race — counts stay 0 without blocking the request */
  }
  const decision = decideRateLimit(counts.user, counts.ip, caps.userDailyCap, caps.ipDailyCap);
  if (!decision.allowed) {
    return {
      ok: false,
      error: NextResponse.json(
        {
          ok: false,
          error: `rate_limited: ${plan} allows ${caps.userDailyCap}/user/day and ${caps.ipDailyCap}/IP/day`,
          plan,
          userCount: counts.user,
          ipCount: counts.ip,
          cap: caps.userDailyCap,
          userCap: caps.userDailyCap,
          ipCap: caps.ipDailyCap,
        },
        { status: 429, headers: { "Retry-After": String(decision.retryAfterSeconds) } },
      ),
    };
  }

  // Concurrency: take an in-flight slot before counting the request, so a
  // concurrency-deny never burns one of the user's daily generations.
  const inflightBucket = inflightBucketFor(session.userId);
  let inflightAcquired = false;
  try {
    inflightAcquired = await tryAcquireInflight(executor, inflightBucket, caps.concurrency);
  } catch {
    /* Neon hiccup: fail open like daily caps; the stale clamp self-heals a leaked slot */
  }
  if (!inflightAcquired) {
    return {
      ok: false,
      error: NextResponse.json(
        {
          ok: false,
          error: `concurrency_limited: ${plan} allows ${caps.concurrency} in-flight generation${caps.concurrency === 1 ? "" : "s"} — wait for your current one to finish`,
          plan,
          maxInflight: caps.concurrency,
        },
        { status: 429, headers: { "Retry-After": "5" } },
      ),
    };
  }
  let inflightReleased = false;
  const releaseInflightOnce = async (): Promise<void> => {
    if (!inflightAcquired || inflightReleased) return;
    inflightReleased = true;
    try {
      await releaseInflight(executor, inflightBucket);
    } catch {
      /* best-effort; the 120s stale clamp recovers a leaked slot */
    }
  };

  try {
    await bumpUsage(executor, userBucket, new Date(windowStart));
    await bumpUsage(executor, ipBucket, new Date(windowStart));
  } catch {
    /* usage write is best-effort; read-then-bump race self-heals next window */
  }

  return {
    ok: true,
    context: {
      session,
      plan,
      caps,
      keys: resolveHostedKeys(request, plan),
      entitlementSource: source,
      releaseInflight: releaseInflightOnce,
    },
  };
}
