"use client";

import {
  FREE_CAPS,
  type PlanId,
} from "@/lib/billing/plans";
import "./billing.css";

export type PlanChipState = {
  /** Current plan; null when signed out. */
  plan: PlanId | null;
  /**
   * Generations left today, when the entitlement API knows it.
   * Null/undefined → honest placeholder, never an invented count.
   */
  remainingToday?: number | null;
  /** Daily cap for the plan, when published. Free locks at 10. */
  capToday?: number | null;
  /** Billing period for paid plans, when known ("Maker · yearly"). */
  period?: "monthly" | "yearly" | null;
};

/**
 * Plan chip for the sidebar foot / Settings head (lock §2 surface C, §5).
 * - Free under cap:        `Free · n/10 today`
 * - Free exhausted:        `Free · cap reached`
 * - Free, no meter yet:    `Free · capped hosted flash` (honest placeholder)
 * - Maker / Studio:        `Maker` (+ ` · yearly` when known)
 * - Signed out:            `Sign in` — or render nothing (parent hides)
 */
export function PlanChip({ state, signedOut }: { state: PlanChipState; signedOut?: boolean }) {
  if (!state.plan) {
    if (signedOut) {
      return (
        <span className="billing-chip billing-chip--muted" data-testid="plan-chip">
          Sign in
        </span>
      );
    }
    return null;
  }

  let label: string;
  if (state.plan === "free") {
    const cap = state.capToday ?? FREE_CAPS.generationsPerUserPerDay;
    if (typeof state.remainingToday === "number") {
      label =
        state.remainingToday <= 0
          ? "Free · cap reached"
          : `Free · ${state.remainingToday}/${cap} today`;
    } else {
      label = "Free · capped hosted flash";
    }
  } else {
    const name = state.plan === "maker" ? "Maker" : "Studio";
    label = state.period === "yearly" ? `${name} · yearly` : name;
  }

  const exhausted = state.plan === "free" && typeof state.remainingToday === "number" && state.remainingToday <= 0;

  return (
    <span
      className={`billing-chip${exhausted ? " billing-chip--warn" : ""}`}
      data-testid="plan-chip"
      data-plan={state.plan}
    >
      {label}
    </span>
  );
}
