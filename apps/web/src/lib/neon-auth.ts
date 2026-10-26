/**
 * Neon Managed Auth (Better Auth) — session helpers.
 *
 * The auth API route (`/api/auth/[...all]`) proxies requests to Neon's managed
 * Better Auth backend via createNeonAuth (kept in the route/middleware files so
 * this module stays testable without next/headers). API route handlers resolve
 * sessions from incoming cookies via getSessionFromRequest below.
 *
 * Trusted domain note: designproof.site must be registered as the callback /
 * trust domain in the Neon Auth console — configured live, NOT here. Only env
 * is read (NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET).
 */

export function neonAuthConfigured(): boolean {
  return Boolean(
    process.env.NEON_AUTH_BASE_URL?.trim() && process.env.NEON_AUTH_COOKIE_SECRET?.trim(),
  );
}

export interface HostedSession {
  userId: string;
  email?: string;
  name?: string;
}

/**
 * Resolve the signed-in user from an API request's cookies by forwarding them
 * to Neon Auth's managed /get-session endpoint. Returns null when unauthenticated
 * or when Neon Auth is not configured (callers must then answer 401 honestly).
 */
export async function getSessionFromRequest(request: Request): Promise<HostedSession | null> {
  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim();
  if (!baseUrl) return null;

  const cookie = request.headers.get("cookie")?.trim();
  if (!cookie) return null;

  try {
    const res = await fetch(`${baseUrl}/get-session`, {
      headers: { cookie, accept: "application/json" },
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (!body || typeof body !== "object") return null;
    const user = (body as { user?: { id?: unknown; email?: unknown; name?: unknown } | null }).user;
    if (!user || typeof user.id !== "string" || !user.id) return null;
    return {
      userId: user.id,
      email: typeof user.email === "string" ? user.email : undefined,
      name: typeof user.name === "string" ? user.name : undefined,
    };
  } catch {
    return null;
  }
}
