"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  FREE_CAPS,
  PLAN_CTA_LABELS,
  TIP_AMOUNT_USD,
  TIP_CTA_LABEL,
  TIP_PRODUCT_ID,
  productIdFor,
  type Cadence,
} from "@/lib/billing/plans";
import { startCheckout } from "@/lib/billing/start-checkout";
import { PlanChip, type PlanChipState } from "./PlanChip";
import "./billing.css";

/**
 * Settings → Plan section — lock §5. Renders ABOVE the BYOK ("Keys &
 * integrations") block. Upgrade CTAs go through startCheckout(productId);
 * "Compare plans" routes to /pricing; the tip row is gratitude only.
 * `planState` comes from the entitlement API once FE ships it — until then
 * the honest placeholder renders ("Free · capped hosted flash").
 */
export function SettingsPlanSection({
  planState,
  cadence = "monthly",
}: {
  planState: PlanChipState | null;
  cadence?: Cadence;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const begin = (id: string, productId?: string) => {
    if (!productId) return;
    setStatus(null);
    setBusy(id);
    startTransition(async () => {
      const result = await startCheckout(productId);
      if (!result.ok) setStatus(result.message);
      setBusy(null);
    });
  };

  const plan = planState?.plan ?? "free";

  return (
    <section className="billing-plan" aria-labelledby="billing-plan-title" data-testid="settings-plan">
      <div className="billing-plan__head">
        <h3 id="billing-plan-title" className="billing-plan__title">
          Plan
        </h3>
        {planState ? <PlanChip state={planState} /> : null}
      </div>

      <p className="billing-plan__body">
        {plan === "free"
          ? `Hosted flash · ${FREE_CAPS.generationsPerUserPerDay} generations/day · resets ${FREE_CAPS.resetLabel}`
          : plan === "maker"
            ? "Maker · higher daily pool · mid open-weights"
            : "Studio · priority pool · best open-weights we can afford"}
      </p>

      <div className="billing-plan__actions">
        <button
          type="button"
          className="billing-btn billing-btn--primary"
          data-testid="settings-plan-cta-maker"
          disabled={busy !== null}
          onClick={() => begin("maker", productIdFor("maker", cadence))}
        >
          {busy === "maker" ? "Opening…" : PLAN_CTA_LABELS.maker}
        </button>
        <button
          type="button"
          className="billing-btn billing-btn--secondary"
          data-testid="settings-plan-cta-studio"
          disabled={busy !== null}
          onClick={() => begin("studio", productIdFor("studio", cadence))}
        >
          {busy === "studio" ? "Opening…" : PLAN_CTA_LABELS.studio}
        </button>
        <Link className="billing-btn billing-btn--ghost" href="/pricing">
          Compare plans
        </Link>
      </div>

      <div className="billing-plan__tip">
        <p className="billing-plan__tip-copy">
          Tip ${TIP_AMOUNT_USD} — gratitude only, no extra capacity.
        </p>
        <button
          type="button"
          className="billing-btn billing-btn--ghost"
          data-testid="settings-plan-cta-tip"
          disabled={busy === "tip"}
          onClick={() => begin("tip", TIP_PRODUCT_ID)}
        >
          {busy === "tip" ? "Opening…" : TIP_CTA_LABEL}
        </button>
      </div>

      {status ? (
        <p className="billing-status" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}
