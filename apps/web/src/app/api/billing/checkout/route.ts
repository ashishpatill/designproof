import { NextResponse } from "next/server";
import {
  getEntitlementExecutor,
  resolveUserPlan,
  usageWindowStart,
  readUsage,
} from "@/lib/entitlements";
import { getSessionFromRequest } from "@/lib/neon-auth";
import {
  productForCheckout,
  planFromProductId,
  productMap,
  tipProductId,
  DODO_PRODUCT_TIP_LIVE,
  DODO_PRODUCT_TIP_TEST,
  type BillingCycle,
} from "@/lib/dodo";
import { planCaps } from "@/lib/hosted-access";

export const runtime = "nodejs";

const DODO_API_BASE_URL = process.env.DODO_API_BASE_URL?.trim() || "https://api.dodopayments.com";

function knownProductIds(): Set<string> {
  const ids = new Set(productMap().map((e) => e.productId));
  ids.add(DODO_PRODUCT_TIP_LIVE);
  ids.add(DODO_PRODUCT_TIP_TEST);
  ids.add(tipProductId());
  return ids;
}

/**
 * POST /api/billing/checkout
 *
 * Dodo-native contract (Web Designer client):
 *   body: { productId: string }
 *   -> 200 { url: string }  (+ checkoutUrl alias)
 *
 * Legacy alias still accepted: { plan: "maker"|"studio", cycle: "monthly"|"yearly" }.
 * Signed-in only; webhook grants entitlements for subscription products.
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "auth_required: sign in before checking out" },
      { status: 401 },
    );
  }

  const mode = (process.env.DODO_ENVIRONMENT?.trim() || "test").toLowerCase();
  const live = mode === "live" || mode === "production";
  const apiKey = (
    live
      ? process.env.DODO_DESIGNPROOF_LIVE_API_KEY
      : process.env.DODO_DESIGNPROOF_TEST_API_KEY
  )?.trim() || process.env.DODO_API_KEY?.trim();
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
    productId?: string;
    plan?: string;
    cycle?: string;
  };

  let productId = typeof body.productId === "string" ? body.productId.trim() : "";
  let plan: "maker" | "studio" | undefined;
  let cycle: BillingCycle | undefined;

  if (!productId) {
    plan = body.plan === "maker" || body.plan === "studio" ? body.plan : undefined;
    cycle =
      body.cycle === "yearly"
        ? "yearly"
        : body.cycle === "monthly"
          ? "monthly"
          : undefined;
    if (!plan || !cycle) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid body: provide productId, or plan ("maker"|"studio") + cycle ("monthly"|"yearly")',
        },
        { status: 400 },
      );
    }
    const mapped = productForCheckout(plan, cycle);
    if (!mapped) {
      return NextResponse.json(
        { ok: false, error: `no Dodo product configured for ${plan}/${cycle}` },
        { status: 500 },
      );
    }
    productId = mapped.productId;
  } else {
    if (!knownProductIds().has(productId)) {
      return NextResponse.json(
        { ok: false, error: "unknown productId — use a DesignProof LIVE/TEST Maker, Studio, or Tip id" },
        { status: 400 },
      );
    }
    const resolved = planFromProductId(productId);
    if (resolved === "maker" || resolved === "studio") plan = resolved;
    const entry = productMap().find((e) => e.productId === productId);
    cycle = entry?.cycle;
  }

  try {
    const res = await fetch(`${DODO_API_BASE_URL}/checkouts`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        metadata: { user_id: session.userId },
      }),
    });
    const payload = (await res.json().catch(() => null)) as
      | { checkout_url?: string; url?: string }
      | null;
    const url = payload?.checkout_url || payload?.url;
    if (!res.ok || !url) {
      return NextResponse.json(
        { ok: false, error: `Dodo checkout failed (HTTP ${res.status})` },
        { status: 502 },
      );
    }
    // Dodo-native `url`; `checkoutUrl` kept as alias for any older readers.
    return NextResponse.json({
      ok: true,
      url,
      checkoutUrl: url,
      productId,
      ...(plan ? { plan } : {}),
      ...(cycle ? { cycle } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "checkout failed";
    return NextResponse.json({ ok: false, error: `checkout error: ${message}` }, { status: 502 });
  }
}

/**
 * GET /api/billing/checkout — current entitlement + remaining hosted quota.
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
    const caps = planCaps(plan);
    const windowStart = usageWindowStart().toISOString();
    const used = await readUsage(executor, `user:${session.userId}:daily`, new Date(windowStart));
    return NextResponse.json({
      ok: true,
      plan,
      usedToday: used,
      dailyCap: caps.userDailyCap,
      ipDailyCap: caps.ipDailyCap,
      remaining: Math.max(0, caps.userDailyCap - used),
      windowStart,
    });
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const message = raw.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://***").slice(0, 200);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
