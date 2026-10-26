"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/**
 * Honest signed-out state for Studio generation CTAs (minimal — Design Expert
 * owns the full plan-ladder UX). While the Neon Auth session resolves or when
 * the user is signed out, the CTA is not hidden but replaced with a truthful
 * sign-in notice instead of silently failing on a 401.
 */
export function HostedGenerateGate({
  fallback,
}: {
  fallback?: (status: "signed-out" | "loading") => ReactNode;
}) {
  const [state, setState] = useState<"loading" | "signed-in" | "signed-out">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!cancelled) setState(session ? "signed-in" : "signed-out");
      } catch {
        // Auth not configured / network — sign-in is honestly unavailable here.
        if (!cancelled) setState("signed-out");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "signed-in") return null;
  if (fallback) return <>{fallback(state === "loading" ? "loading" : "signed-out")}</>;
  return (
    <p className="rounded border border-amber-600/40 bg-amber-950/30 p-3 text-sm text-amber-200">
      Hosted generation needs an account.{" "}
      <Link href="/auth/sign-in" className="underline">
        Sign in
      </Link>{" "}
      (Free includes a daily hosted quota) — or run the capture tool locally with your own key.
    </p>
  );
}
