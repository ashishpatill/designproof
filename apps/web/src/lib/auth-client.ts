"use client";

/**
 * Neon Auth client instance for browser-side session checks (Better Auth pattern).
 * Used by Studio generation CTAs to show honest signed-out states; full ladder
 * UX is owned by Design Expert — keep this minimal.
 */
import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Minimal structural surface we consume. Avoided annotating with the SDK's
 * full ReactAuthClient type: its inference references pnpm-internal
 * @better-fetch/better-auth paths that TS cannot serialize (TS2742).
 */
interface NeonSessionClient {
  getSession: (opts?: { throw?: boolean }) => Promise<{
    data: { user?: { id: string; email?: string; name?: string } } | null;
    error?: unknown;
  }>;
}

export const authClient = createAuthClient() as unknown as NeonSessionClient;
