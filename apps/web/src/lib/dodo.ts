/**
 * Dodo Payments billing config: live product IDs verified via connector
 * (see .opencode-loops/hosted-e2e/PLAN.md), webhook signature verification,
 * and entitlement mapping. No live cutover in this PR — checkout requires
 * DODO_DESIGNPROOF_{LIVE,TEST}_API_KEY; absent env yields honest 503s, never invented URLs.
 */
import { timingSafeEqual, createHmac } from "node:crypto";
import type { HostedPlan } from "@/lib/entitlements";

export const DODO_PRODUCT_IDS = {
  makerMonthly: "pdt_0NqZOdQEPoUYY52egd9hw", // $7
  makerYearly: "pdt_0NqZOdTt2kKHyB0skOhXw", // $69
  studioMonthly: "pdt_0NqZOdYgjIamyGVjhJH6t", // $15
  studioYearly: "pdt_0NqZOdcjXJYfPL2o9V8Rs", // $129
} as const;

export const DODO_PRODUCT_IDS_TEST = {
  makerMonthly: "pdt_0NqZTGWaRlbfCbvCVWDlU",
  makerYearly: "pdt_0NqZTGcX6azPETLjN69zj",
  studioMonthly: "pdt_0NqZTGgoHwGbvwR1MfR4J",
  studioYearly: "pdt_0NqZTGkycZ8wq9qqlJG3X",
} as const;

/** Tip $5 LIVE on DesignProof brand. TEST twin: pdt_0NqZTWiGZkR5T3hw1gBsk */
export const DODO_PRODUCT_TIP_LIVE = "pdt_0NqZTUk7iWWdTlUtajVSP";
export const DODO_PRODUCT_TIP_TEST = "pdt_0NqZTWiGZkR5T3hw1gBsk";
export function tipProductId(env: Record<string, string | undefined> = process.env): string {
  const override = env.DODO_PRODUCT_TIP?.trim();
  if (override) return override;
  const mode = (env.DODO_ENVIRONMENT?.trim() || "test").toLowerCase();
  const live = mode === "live" || mode === "production";
  return live ? DODO_PRODUCT_TIP_LIVE : DODO_PRODUCT_TIP_TEST;
}
export const DODO_PRODUCT_TIP = tipProductId();

export type BillingCycle = "monthly" | "yearly";

/**
 * Billing mode from DODO_ENVIRONMENT. Anything other than live/production is
 * test — the defensive default the checkout and webhook routes already use, so
 * a missing env can never silently charge real cards or grant from test events.
 */
export function billingMode(
  env: Record<string, string | undefined> = process.env,
): "test" | "live" {
  const mode = (env.DODO_ENVIRONMENT?.trim() || "test").toLowerCase();
  return mode === "live" || mode === "production" ? "live" : "test";
}

/**
 * Dodo API host for the current mode. Dodo serves exactly two hosts —
 * live.dodopayments.com and test.dodopayments.com. The retired
 * api.dodopayments.com default no longer resolves, so it must never come back.
 * DODO_API_BASE_URL still wins when set.
 */
export function dodoApiBaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const override = env.DODO_API_BASE_URL?.trim();
  if (override) return override.replace(/\/+$/, "");
  return billingMode(env) === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

/**
 * Map a Dodo webhook event to an entitlement update. Only subscription
 * activation/renewal events grant a plan; cancellations and expirations
 * downgrade to Free. Unrecognized payloads are ignored (undefined).
 */
export interface DodoEventEntitlement {
  userId?: string;
  plan: HostedPlan;
  action: "upsert" | "downgrade";
}

const ACTIVE_EVENTS = new Set([
  "subscription.active",
  "subscription.activated",
  "subscription.renewed",
  "subscription.resumed",
]);
const DOWN_EVENTS = new Set(["subscription.expired", "subscription.cancelled", "subscription.failed"]);

export function entitlementFromWebhookEvent(
  event: {
    type?: string;
    data?: {
      object?: { metadata?: Record<string, unknown>; product_id?: unknown } | null;
      metadata?: Record<string, unknown>;
      product_id?: unknown;
    } | null;
  },
): DodoEventEntitlement | undefined {
  const type = event.type ?? "";
  // Real Dodo payloads carry the subscription directly on `data`
  // ({ business_id, type, data: { product_id, metadata, ... } }). The nested
  // `data.object` shape is accepted as a fallback for older hermetic fixtures.
  const obj = event.data?.object ?? event.data;
  if (!obj || typeof obj !== "object") return undefined;
  const productId = typeof obj.product_id === "string" ? obj.product_id : "";
  const userId =
    typeof obj.metadata?.user_id === "string" && obj.metadata.user_id
      ? obj.metadata.user_id
      : undefined;

  if (ACTIVE_EVENTS.has(type)) {
    const plan = productId ? planFromProductId(productId) : undefined;
    if (!plan || plan === "free") return undefined;
    return { userId, plan, action: "upsert" };
  }
  if (DOWN_EVENTS.has(type)) {
    return { userId, plan: "free", action: "downgrade" };
  }
  return undefined;
}

export interface DodoProductMapEntry {
  plan: HostedPlan;
  cycle: BillingCycle;
  productId: string;
}

/**
 * product_id → plan/cycle, honoring env overrides (documented in .env.example).
 * Defaults follow the billing mode: test mode resolves the TEST product IDs,
 * live mode the LIVE ones — a test product does not exist in live mode and
 * vice versa, so mixing them makes checkout and webhook mapping both fail.
 */
export function productMap(
  env: Record<string, string | undefined> = process.env,
): DodoProductMapEntry[] {
  const defaults = billingMode(env) === "live" ? DODO_PRODUCT_IDS : DODO_PRODUCT_IDS_TEST;
  return [
    {
      plan: "maker",
      cycle: "monthly",
      productId: env.DODO_PRODUCT_MAKER_MONTHLY?.trim() || defaults.makerMonthly,
    },
    {
      plan: "maker",
      cycle: "yearly",
      productId: env.DODO_PRODUCT_MAKER_YEARLY?.trim() || defaults.makerYearly,
    },
    {
      plan: "studio",
      cycle: "monthly",
      productId: env.DODO_PRODUCT_STUDIO_MONTHLY?.trim() || defaults.studioMonthly,
    },
    {
      plan: "studio",
      cycle: "yearly",
      productId: env.DODO_PRODUCT_STUDIO_YEARLY?.trim() || defaults.studioYearly,
    },
  ];
}

/** Resolve a Dodo product_id to an entitlement plan (undefined = unrecognized). */
export function planFromProductId(
  productId: string,
  env: Record<string, string | undefined> = process.env,
): HostedPlan | undefined {
  return productMap(env).find((entry) => entry.productId === productId)?.plan;
}

export function productForCheckout(
  plan: HostedPlan,
  cycle: BillingCycle,
  env: Record<string, string | undefined> = process.env,
): DodoProductMapEntry | undefined {
  return productMap(env).find((e) => e.plan === plan && e.cycle === cycle);
}

/** The three Standard Webhooks headers Dodo sends with every delivery. */
export interface DodoWebhookHeaders {
  webhookId?: string | null;
  webhookTimestamp?: string | null;
  webhookSignature?: string | null;
}

/**
 * Candidate HMAC keys for a webhook secret. Standard Webhooks secrets are
 * `whsec_` + base64(key bytes); Dodo dashboard secrets follow that format.
 * Accept the decoded key bytes, and also the raw secret text so hermetic and
 * legacy plain-text secrets keep verifying. Secrets never appear in logs.
 */
function signingKeyCandidates(secret: string): Buffer[] {
  const keys: Buffer[] = [Buffer.from(secret, "utf8")];
  const stripped = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  if (stripped !== secret || /^[A-Za-z0-9+/]+={0,2}$/.test(stripped)) {
    try {
      const decoded = Buffer.from(stripped, "base64");
      const roundTrip = decoded.toString("base64").replace(/=+$/, "");
      if (decoded.length > 0 && roundTrip === stripped.replace(/=+$/, "")) {
        keys.push(decoded);
      }
    } catch {
      // Raw candidate already present; a non-base64 secret is not an error.
    }
  }
  return keys;
}

/** Extract signature values from a `webhook-signature` header (`v1,<sig>` entries). */
function signaturesFromHeader(header: string): string[] {
  const out: string[] = [];
  for (const raw of header.split(/[\s,]+/)) {
    const token = raw.trim();
    if (!token) continue;
    const match = /^v\d+[,.=](.+)$/.exec(token);
    const value = match?.[1] ?? token;
    if (value) out.push(value);
  }
  return out;
}

/**
 * Verify a Dodo webhook signature. Dodo follows the Standard Webhooks spec:
 * HMAC-SHA256 over `${webhook-id}.${webhook-timestamp}.${rawBody}`, delivered
 * in the `webhook-signature` header as `v1,<base64>` entries alongside the
 * `webhook-id` and `webhook-timestamp` headers. Comparison is constant time
 * and the timestamp is held to a five minute tolerance against replay.
 */
export function verifyDodoSignature(
  rawBody: string,
  headers: DodoWebhookHeaders,
  secret: string,
  { toleranceSec = 5 * 60, now = Date.now() }: { toleranceSec?: number; now?: number } = {},
): boolean {
  const id = headers.webhookId?.trim();
  const timestamp = headers.webhookTimestamp?.trim();
  const signatureHeader = headers.webhookSignature?.trim();
  if (!id || !timestamp || !signatureHeader || !secret) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  // Timestamp is unix seconds; accept milliseconds defensively.
  const tsSec = Math.abs(ts) > 1e12 ? Math.floor(ts / 1000) : ts;
  if (Math.abs(Math.floor(now / 1000) - tsSec) > toleranceSec) return false;

  const signatures = signaturesFromHeader(signatureHeader);
  if (signatures.length === 0) return false;

  const signedContent = `${id}.${timestamp}.${rawBody}`;
  for (const key of signingKeyCandidates(secret)) {
    const digest = createHmac("sha256", key).update(signedContent).digest();
    const base64 = digest.toString("base64");
    const hex = digest.toString("hex");
    if (signatures.some((sig) => safeCompare(sig, base64) || safeCompare(sig, hex))) {
      return true;
    }
  }
  return false;
}

/** Constant-time string compare; unequal length never returns true. */
function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
