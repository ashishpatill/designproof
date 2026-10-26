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
export const DODO_PRODUCT_TIP = process.env.DODO_PRODUCT_TIP?.trim() || undefined;

export type BillingCycle = "monthly" | "yearly";

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
  event: { type?: string; data?: { object?: { metadata?: Record<string, unknown>; product_id?: unknown } | null } },
): DodoEventEntitlement | undefined {
  const type = event.type ?? "";
  const obj = event.data?.object;
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

/** product_id → plan/cycle, honoring env overrides (documented in .env.example). */
export function productMap(): DodoProductMapEntry[] {
  return [
    {
      plan: "maker",
      cycle: "monthly",
      productId: process.env.DODO_PRODUCT_MAKER_MONTHLY?.trim() || DODO_PRODUCT_IDS.makerMonthly,
    },
    {
      plan: "maker",
      cycle: "yearly",
      productId: process.env.DODO_PRODUCT_MAKER_YEARLY?.trim() || DODO_PRODUCT_IDS.makerYearly,
    },
    {
      plan: "studio",
      cycle: "monthly",
      productId: process.env.DODO_PRODUCT_STUDIO_MONTHLY?.trim() || DODO_PRODUCT_IDS.studioMonthly,
    },
    {
      plan: "studio",
      cycle: "yearly",
      productId: process.env.DODO_PRODUCT_STUDIO_YEARLY?.trim() || DODO_PRODUCT_IDS.studioYearly,
    },
  ];
}

/** Resolve a Dodo product_id to an entitlement plan (undefined = unrecognized). */
export function planFromProductId(productId: string): HostedPlan | undefined {
  return productMap().find((entry) => entry.productId === productId)?.plan;
}

export function productForCheckout(
  plan: HostedPlan,
  cycle: BillingCycle,
): DodoProductMapEntry | undefined {
  return productMap().find((e) => e.plan === plan && e.cycle === cycle);
}

/**
 * Verify a Dodo webhook signature. Dodo signs HMAC-SHA256 over
 * `${timestamp}.${rawBody}` and sends comma-separated `t=…,v1=…` parts in the
 * `webhook-signature` header (v1 values may be hex or base64). Secrets never
 * appear in logs; comparison is constant time.
 */
export function verifyDodoSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  { toleranceMs = 5 * 60_000, now = Date.now() }: { toleranceMs?: number; now?: number } = {},
): boolean {
  if (!signatureHeader || !secret) return false;
  const parts = new Map<string, string>();
  for (const part of signatureHeader.split(",")) {
    const eq = part.indexOf("=");
    if (eq > 0) parts.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
  const timestamp = parts.get("t") ?? "";
  const signatures = (parts.get("v1") ?? "").split("&").filter(Boolean);
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  // Timestamp may be seconds or milliseconds — accept either, enforce tolerance.
  const tsMs = Math.abs(ts) < 1e11 ? ts * 1000 : ts;
  if (Math.abs(now - tsMs) > toleranceMs) return false;

  const hex = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const base64 = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("base64");
  return signatures.some(
    (sig) =>
      safeCompare(sig, hex) ||
      safeCompare(sig, base64) ||
      safeCompare(sig, hex.toUpperCase()),
  );
}

/** Constant-time string compare; unequal length never returns true. */
function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
