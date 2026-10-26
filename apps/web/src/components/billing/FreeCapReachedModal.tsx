"use client";

import Link from "next/link";
import { useEffect, useTransition, useState } from "react";
import { X } from "lucide-react";
import {
  FREE_CAPS,
  PLAN_CTA_LABELS,
  productIdFor,
  type Cadence,
} from "@/lib/billing/plans";
import { startCheckout } from "@/lib/billing/start-checkout";
import "./billing.css";

/**
 * Free exhausted modal — lock §4 S2 / §5. FE mounts this when the entitlement
 * meter reports the daily cap hit. CTAs start checkout via startCheckout();
 * "Compare plans" routes to /pricing. Dismiss label is locked: "Not now".
 */
export function FreeCapReachedModal({
  open,
  onClose,
  cadence = "monthly",
  onWired,
}: {
  open: boolean;
  onClose: () => void;
  /** Checkout cadence to use for the upgrade CTAs. FE may pin a default. */
  cadence?: Cadence;
  /** Called after a checkout attempt resolves (ok or not) — FE hook for telemetry/refresh. */
  onWired?: () => void;
}) {
  const [busy, setBusy] = useState<"maker" | "studio" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const upgrade = (plan: "maker" | "studio") => {
    const productId = productIdFor(plan, cadence);
    if (!productId) return;
    setStatus(null);
    setBusy(plan);
    startTransition(async () => {
      const result = await startCheckout(productId);
      if (!result.ok) setStatus(result.message);
      setBusy(null);
      onWired?.();
    });
  };

  return (
    <div
      className="billing-modal-backdrop"
      role="presentation"
      onClick={onClose}
      data-testid="free-cap-modal"
    >
      <div
        className="billing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-cap-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="billing-modal__head">
          <h2 id="free-cap-modal-title" className="billing-modal__title">
            Free daily cap reached
          </h2>
          <button
            type="button"
            className="billing-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="billing-modal__body">
          You’ve used {FREE_CAPS.generationsPerUserPerDay} hosted flash generations today. Cap
          resets at {FREE_CAPS.resetLabel}. Continue with Maker or Studio for a higher pool and
          stronger models.
        </p>
        <div className="billing-modal__actions">
          <button
            type="button"
            className="billing-btn billing-btn--primary"
            data-testid="free-cap-cta-maker"
            disabled={busy !== null}
            onClick={() => upgrade("maker")}
          >
            {busy === "maker" ? "Opening…" : PLAN_CTA_LABELS.maker}
          </button>
          <button
            type="button"
            className="billing-btn billing-btn--secondary"
            data-testid="free-cap-cta-studio"
            disabled={busy !== null}
            onClick={() => upgrade("studio")}
          >
            {busy === "studio" ? "Opening…" : PLAN_CTA_LABELS.studio}
          </button>
          <Link className="billing-btn billing-btn--ghost" href="/pricing">
            Compare plans
          </Link>
          <button
            type="button"
            className="billing-btn billing-btn--plain"
            onClick={onClose}
            data-testid="free-cap-dismiss"
          >
            Not now
          </button>
        </div>
        {status ? (
          <p className="billing-status" role="status">
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
