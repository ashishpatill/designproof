"use client";

import Link from "next/link";
import { FREE_CAPS } from "@/lib/billing/plans";
import "./billing.css";

/**
 * Inline Free-exhausted banner — lock §4 S2 ("if remaining was already 0 when
 * page loaded, show inline banner above Generate, same copy, shorter").
 * FE mounts it above the generate control; no checkout from the banner —
 * it routes to /pricing where the plan CTAs live.
 */
export function FreeCapBanner({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <aside
      className="billing-banner"
      role="status"
      data-testid="free-cap-banner"
      aria-label="Free daily cap reached"
    >
      <p className="billing-banner__text">
        <strong>Free daily cap reached.</strong> You’ve used{" "}
        {FREE_CAPS.generationsPerUserPerDay} hosted flash generations today — the cap resets at{" "}
        {FREE_CAPS.resetLabel}.{" "}
        <Link href="/pricing" className="billing-banner__link">
          Compare plans
        </Link>{" "}
        for a higher pool and stronger models.
      </p>
      {onDismiss ? (
        <button type="button" className="billing-banner__dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      ) : null}
    </aside>
  );
}
