"use client";

import { X } from "lucide-react";
import "./billing.css";

/**
 * Checkout return strip — lock §4 S5. Shown after Dodo redirects back
 * (e.g. `/studio?checkout=success&plan=maker`). FE owns wiring the query →
 * entitlement refresh; this component only renders the locked success copy.
 * Never render this from client-only payment state — entitlement is truth.
 */
export function CheckoutSuccessStrip({
  plan,
  onDismiss,
}: {
  plan: "maker" | "studio";
  onDismiss?: () => void;
}) {
  return (
    <aside
      className="billing-strip"
      role="status"
      data-testid={`checkout-success-${plan}`}
      aria-label={`Checkout success — ${plan}`}
    >
      <p className="billing-strip__text">
        {plan === "maker" ? (
          <>
            <strong>You’re on Maker.</strong> Your plan’s pool is active — generate when ready.
          </>
        ) : (
          <>
            <strong>You’re on Studio.</strong> Priority pool is active — generate when ready.
          </>
        )}
      </p>
      {onDismiss ? (
        <button
          type="button"
          className="billing-strip__dismiss"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </aside>
  );
}
