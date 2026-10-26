/**
 * Single source of truth for the DesignProof plan ladder and the $5 tip.
 *
 * Product IDs are LIVE Dodo identifiers (brand brnd_0NqZOdGANKGcFKfrwbmI7).
 * Secrets never live here — the server checkout route reads the API key from
 * `DODO_DESIGNPROOF_LIVE_API_KEY`; the client only ever posts a product id.
 *
 * Copy is locked against the Design Expert plan UX lock (26 Oct 2026):
 * Free numbers are hard-locked; Maker/Studio show price + qualitative
 * contrast only — numeric caps WAIT for the GTM plan of record. Never
 * invent stage-turn, token, or generation numbers for paid tiers here.
 */

export type PlanId = "free" | "maker" | "studio";
export type Cadence = "monthly" | "yearly";

export type PlanConfig = {
  id: PlanId;
  name: string;
  /** Monthly price in USD. Yearly entry for paid plans = 12x discounted. */
  prices: Partial<Record<Cadence, number>>;
  /** One honest sentence about what this tier is. No invented feature lists. */
  blurb: string;
  /** True only for plans that can start a checkout. */
  purchasable: boolean;
};

export const PLAN_LADDER: readonly PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    prices: { monthly: 0 },
    blurb:
      "10 flash generations / day · concurrency 1 · design engine + skills on cheap open-weights",
    purchasable: false,
  },
  {
    id: "maker",
    name: "Maker",
    prices: { monthly: 7, yearly: 69 },
    blurb: "Mid open-weights · faster loops · higher daily pool · deeper MCP",
    purchasable: true,
  },
  {
    id: "studio",
    name: "Studio",
    prices: { monthly: 15, yearly: 129 },
    blurb: "Best open-weights we can afford · priority · full MCP · highest caps",
    purchasable: true,
  },
] as const;

/** Locked CTA labels — keep verbatim across /pricing, Settings, and modals. */
export const PLAN_CTA_LABELS: Record<PlanId, string> = {
  free: "Start free",
  maker: "Continue with Maker",
  studio: "Continue with Studio",
};

/**
 * $5 gratitude, not a plan. No tier, no entitlement, no extra generations.
 * Dodo may still call it a donation product — never render it as a tier.
 *
 * LIVE tip (brand brnd_0NqZOdGANKGcFKfrwbmI7). The TEST twin lives on the
 * TEST brand (brnd_0NqZT56wT3RtB2an1WBPg) for sandbox checkout runs.
 */
export const TIP_AMOUNT_USD = 5;
export const TIP_PRODUCT_ID = "pdt_0NqZTUk7iWWdTlUtajVSP"; // LIVE DesignProof Tip $5
export const TIP_PRODUCT_ID_TEST = "pdt_0NqZTWiGZkR5T3hw1gBsk"; // TEST twin, brand brnd_0NqZT56wT3RtB2an1WBPg
export const TIP_FOOTNOTE_LABEL = "Support the work — $5 tip";
export const TIP_CTA_LABEL = "Send a $5 tip";

/** Pricing page honesty line — locked. */
export const HONESTY_LINE =
  "No credit buckets. Caps are hard. Local / open-source plugin path stays documented separately — this page is the hosted product.";

/** Free daily caps — CEO-locked 26 Oct 2026. Copy may restate these; nothing else may. */
export const FREE_CAPS = {
  generationsPerUserPerDay: 10,
  generationsPerIpPerDay: 20,
  concurrency: 1,
  resetLabel: "00:00 UTC",
} as const;

/** Yearly savings, derived from monthly x 12, so copy never lies. */
export function yearlySavingsUsd(plan: PlanConfig): number | null {
  const monthly = plan.prices.monthly;
  const yearly = plan.prices.yearly;
  if (typeof monthly !== "number" || typeof yearly !== "number") return null;
  return monthly * 12 - yearly;
}

/** Exact LIVE product id for a plan+cadence, or undefined when no checkout exists. */
export function productIdFor(plan: PlanId, cadence: Cadence): string | undefined {
  switch (plan) {
    case "maker":
      return cadence === "yearly" ? "pdt_0NqZOdTt2kKHyB0skOhXw" : "pdt_0NqZOdQEPoUYY52egd9hw";
    case "studio":
      return cadence === "yearly" ? "pdt_0NqZOdcjXJYfPL2o9V8Rs" : "pdt_0NqZOdYgjIamyGVjhJH6t";
    case "free":
      return undefined;
  }
}
