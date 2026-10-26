"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  HONESTY_LINE,
  PLAN_CTA_LABELS,
  PLAN_LADDER,
  TIP_AMOUNT_USD,
  TIP_CTA_LABEL,
  TIP_FOOTNOTE_LABEL,
  TIP_PRODUCT_ID,
  productIdFor,
  yearlySavingsUsd,
  type PlanConfig,
} from "@/lib/billing/plans";
import { startCheckout } from "@/lib/billing/start-checkout";

const PRICE_NOTE = "USD, taxes computed at checkout by the payment provider.";

/**
 * Pricing ladder UI against the Design Expert plan UX lock (§5).
 * Three plan cards; the $5 tip is a footnote, never a fourth column.
 * Free never checks out — its CTA opens Studio with sign-in intent.
 * Paid tiers and the tip go through /api/billing/checkout via
 * startCheckout(productId) only — no invented checkout URLs.
 */
export function PricingBoard() {
  const [cadence, setCadence] = useState<"monthly" | "yearly">("monthly");
  const [status, setStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function beginCheckout(id: string, productId?: string) {
    if (!productId) return;
    setStatus(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await startCheckout(productId);
      if (!result.ok) setStatus(result.message);
      setBusyId(null);
    });
  }

  return (
    <div data-testid="pricing-board">
      <div className="pr-cadence" role="group" aria-label="Billing cadence">
        <button
          type="button"
          className="pr-cadence__btn"
          data-testid="pricing-toggle-monthly"
          data-active={cadence === "monthly" ? "true" : "false"}
          aria-pressed={cadence === "monthly"}
          onClick={() => setCadence("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className="pr-cadence__btn"
          data-testid="pricing-toggle-yearly"
          data-active={cadence === "yearly" ? "true" : "false"}
          aria-pressed={cadence === "yearly"}
          onClick={() => setCadence("yearly")}
        >
          Yearly
        </button>
      </div>

      <p className="pr-cadence-note">{PRICE_NOTE}</p>

      <ol className="pr-cards">
        {PLAN_LADDER.map((plan: PlanConfig) => {
          const price = cadence === "yearly" ? plan.prices.yearly : plan.prices.monthly;
          const savings = cadence === "yearly" ? yearlySavingsUsd(plan) : null;
          const productId = plan.purchasable ? productIdFor(plan.id, cadence) : undefined;
          const busy = busyId === plan.id;

          return (
            <li
              key={plan.id}
              className={`pr-card${plan.id === "studio" ? " pr-card--featured" : ""}`}
              data-testid={`pricing-card-${plan.id}`}
            >
              <header className="pr-card__head">
                <h2 className="pr-card__name">{plan.name}</h2>
                <p className="pr-card__price">
                  <span className="pr-card__amount">${price}</span>
                  <span className="pr-card__per">
                    {plan.id === "free" ? "always" : cadence === "yearly" ? "/ year" : "/ month"}
                  </span>
                </p>
                {savings ? <p className="pr-card__save">Save ${savings} a year</p> : null}
              </header>
              <p className="pr-card__blurb">{plan.blurb}</p>
              {plan.id === "free" ? (
                <Link
                  className="pr-btn pr-btn--ghost"
                  href="/studio"
                  data-testid="pricing-cta-free"
                >
                  {PLAN_CTA_LABELS.free}
                </Link>
              ) : (
                <button
                  type="button"
                  className="pr-btn pr-btn--primary"
                  data-testid={`pricing-cta-${plan.id}`}
                  disabled={busy || !productId}
                  onClick={() => beginCheckout(plan.id, productId)}
                >
                  {busy ? "Opening…" : PLAN_CTA_LABELS[plan.id]}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <section className="pr-tip" aria-labelledby="pr-tip-title" data-testid="pricing-tip">
        <div className="pr-tip__copy">
          <h2 id="pr-tip-title" className="pr-tip__title">
            {TIP_FOOTNOTE_LABEL}{" "}
            <span className="pr-tip__blurb-inline">(one-time; no plan benefits)</span>
          </h2>
          <p className="pr-tip__blurb">
            A ${TIP_AMOUNT_USD} thank-you. No tier, no entitlement, no extra generations.
          </p>
        </div>
        <button
          type="button"
          className="pr-btn pr-btn--ghost"
          data-testid="pricing-cta-tip"
          disabled={busyId === "tip"}
          onClick={() => beginCheckout("tip", TIP_PRODUCT_ID)}
        >
          {busyId === "tip" ? "Opening…" : TIP_CTA_LABEL}
        </button>
      </section>

      <p className="pr-honesty">{HONESTY_LINE}</p>

      <p data-testid="pricing-status" role="status" className="pr-status">
        {status}
      </p>
    </div>
  );
}
