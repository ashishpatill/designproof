import { NextResponse } from "next/server";
import {
  getEntitlementExecutor,
  resolveUserPlan,
  usageWindowStart,
  readUsage,
  type HostedPlan,
} from "@/lib/entitlements";
import { getSessionFromRequest } from "@/lib/neon-auth";
import { productForCheckout, type BillingCycle } from "@/lib/dodo";

export const runtime = "nodejs";

const DODO_API_BASE_URL = process.env.DODO_API_BASE_URL?.trim() || "https://api.dodopayments.com";

/**
 * POST /api/billing/checkout { plan: "maker"|"studio", cycle: "monthly"|"yearly" }
 * Creates a Dodo checkout session using the live product IDs in lib/dodo.ts.
 * Signed-in only; plan upgrade checkout — the webhook grants entitlements.
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "auth_required: sign in before checking out" },
      { status: 401 },
    );
  }

  // GTM: never use SuperLearn's Dodo key. LIVE vs TEST by DODO_ENVIRONMENT.
  const mode = (process.env.DODO_ENVIRONMENT?.trim() || "test").toLowerCase();
  const live = mode === "live" || mode === "production";
  const apiKey = (
    live
      ? process.env.DODO_DESIGNPROOF_LIVE_API_KEY
      : process.env.DODO_DESIGNPROOF_TEST_API_KEY
  )?.trim() || process.env.DODO_API_KEY?.trim(); // DODO_API_KEY = local alias only
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "billing_not_configured: set DODO_DESIGNPROOF_TEST_API_KEY or DODO_DESIGNPROOF_LIVE_API_KEY",
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    plan?: string;
    cycle?: string;
  };
  const plan = body.plan === "maker" || body.plan === "studio" ? body.plan : undefined;
  const cycle = body.cycle === "yearly" ? ("yearly" as BillingCycle) : body.cycle === "monthly" ? ("monthly" as BillingCycle) : undefined;
  if (!plan || !cycle) {
    return NextResponse.json(
      { ok: false, error: 'invalid body: plan must be "maker"|"studio" and cycle "monthly"|"yearly"' },
      { status: 400 },
    );
  }

  const product = productForCheckout(plan, cycle);
  if (!product) {
    return NextResponse.json(
      { ok: false, error: `no Dodo product configured for ${plan}/${cycle}` },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${DODO_API_BASE_URL}/checkouts`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        product_id: product.productId,
        quantity: 1,
        metadata: { user_id: session.userId },
      }),
    });
    const payload = (await res.json().catch(() => null)) as { checkout_url?: string } | null;
    if (!res.ok || !payload?.checkout_url) {
      return NextResponse.json(
        { ok: false, error: `Dodo checkout failed (HTTP ${res.status})` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, checkoutUrl: payload.checkout_url, plan, cycle });
  } catch (error) {
    const message = error instanceof Error ? error.message : "checkout failed";
    return NextResponse.json({ ok: false, error: `checkout error: ${message}` }, { status: 502 });
  }
}

/**
 * GET /api/billing/checkout — current entitlement + remaining hosted quota.
 * Honest readout for UI: signed-out → 401, otherwise plan + usage.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "auth_required: not signed in" }, { status: 401 });
  }
  const executor = getEntitlementExecutor();
  if (!executor) {
    return NextResponse.json(
      { ok: false, error: "entitlements_unavailable: set DATABASE_URL (Neon)" },
      { status: 503 },
    );
  }
  try {
    const { plan } = await resolveUserPlan(executor, session.userId);
    const caps = { free: 25, maker: 500, studio: 5000 }[plan as HostedPlan] ?? 25;
    const windowStart = usageWindowStart().toISOString();
    const used = await readUsage(executor, `user:${session.userId}:daily`, new Date(windowStart));
    return NextResponse.json({
      ok: true,
      plan,
      usedToday: used,
      dailyCap: caps,
      remaining: Math.max(0, caps - used),
      windowStart,
    });
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const message = raw.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://***").slice(0, 200);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
