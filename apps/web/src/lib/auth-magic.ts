"use client";

/**
 * Magic-link sign-in against the Neon Auth managed backend (Better Auth
 * magicLink). Kept separate from auth-client.ts so the existing session
 * surface stays untouched; same structural-typing discipline (TS2742).
 *
 * Honest degradation: when the managed backend has no magicLink plugin or
 * Neon Auth env is absent, requestMagicLink returns a reason string and the
 * UI renders it verbatim — never an invented success.
 */

export type MagicLinkResult = { ok: true } | { ok: false; message: string };

interface MagicLinkClient {
  signIn?: {
    magicLink?: (opts: { email: string; callbackURL?: string }) => Promise<{
      data?: unknown;
      error?: { message?: string; status?: number } | null;
    }>;
  };
}

/** The email verification link returns the user to /studio after sign-in. */
export const MAGIC_LINK_CALLBACK_URL = "/studio";

/** Pure, testable email gate. No network, no imports. */
export function validateEmail(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export async function requestMagicLink(email: string): Promise<MagicLinkResult> {
  const trimmed = validateEmail(email);
  if (!trimmed) {
    return { ok: false, message: "Enter a valid email address." };
  }
  const client = (await import("@/lib/auth-client")).authClient as unknown as MagicLinkClient;
  const send = client.signIn?.magicLink;
  if (typeof send !== "function") {
    return { ok: false, message: "Email sign-in isn't available yet — Neon Auth isn't configured." };
  }
  try {
    const res = await send.call(client.signIn, { email: trimmed, callbackURL: MAGIC_LINK_CALLBACK_URL });
    if (res?.error) {
      const status = typeof res.error.status === "number" ? res.error.status : 0;
      if (status === 501 || status === 503 || status === 404) {
        return { ok: false, message: "Email sign-in isn't available yet — Neon Auth isn't configured." };
      }
      return { ok: false, message: res.error.message?.trim() || `Sign-in failed (HTTP ${status || "unknown"}).` };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Sign-in request failed — network unreachable." };
  }
}
