import { NextResponse } from "next/server";
import { getEntitlementExecutor, setUserPlan } from "@/lib/entitlements";
import { entitlementFromWebhookEvent, verifyDodoSignature } from "@/lib/dodo";

export const runtime = "nodejs";

/**
 * Dodo Payments webhook → user_entitlements.
 * Verifies the `webhook-signature` header against DODO_WEBHOOK_SECRET and maps
 * subscription events to maker/studio entitlements (product IDs in lib/dodo.ts).
 * Hermetic by design: no live Neon call happens without DATABASE_URL.
 */
export async function POST(request: Request) {
  // GTM CUTOVER-ENV-MAP: DODO_DESIGNPROOF_{LIVE,TEST}_WEBHOOK_SECRET (ask GTM after endpoint exists).
  // Fallback DODO_WEBHOOK_SECRET for local hermetic tests only.
  const mode = (process.env.DODO_ENVIRONMENT?.trim() || "test").toLowerCase();
  const live = mode === "live" || mode === "production";
  const secret =
    (live
      ? process.env.DODO_DESIGNPROOF_LIVE_WEBHOOK_SECRET?.trim()
      : process.env.DODO_DESIGNPROOF_TEST_WEBHOOK_SECRET?.trim()) ||
    process.env.DODO_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        reason:
          "webhook_secret_not_configured: set DODO_DESIGNPROOF_TEST_WEBHOOK_SECRET or DODO_DESIGNPROOF_LIVE_WEBHOOK_SECRET (ask GTM)",
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("webhook-signature");
  if (!verifyDodoSignature(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false, reason: "invalid webhook signature" }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid JSON body" }, { status: 400 });
  }

  const mapping = entitlementFromWebhookEvent(event as never);
  if (!mapping) {
    // Unrecognized / informational events — accepted, no entitlement change.
    return NextResponse.json({ ok: true, applied: false, reason: "event not mapped to entitlement" });
  }

  const executor = getEntitlementExecutor();
  if (!executor) {
    return NextResponse.json(
      { ok: false, reason: "entitlements_unavailable: set DATABASE_URL (Neon)" },
      { status: 503 },
    );
  }

  if (!mapping.userId) {
    return NextResponse.json(
      {
        ok: false,
        reason:
          "missing user_id: checkout must carry metadata.user_id so the entitlement attaches to a Neon Auth user",
      },
      { status: 422 },
    );
  }

  try {
    const row = await setUserPlan(executor, mapping.userId, mapping.plan, "dodo");
    return NextResponse.json({ ok: true, applied: true, entitlement: row });
  } catch (error) {
    // Stripe-style hygiene: never leak connection strings to callers.
    const raw = error instanceof Error ? error.message : String(error);
    const reason = raw.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://***").slice(0, 200);
    return NextResponse.json({ ok: false, reason }, { status: 500 });
  }
}
