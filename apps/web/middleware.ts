import { NextResponse, type NextRequest } from "next/server";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { neonAuthConfigured } from "@/lib/neon-auth";

/**
 * Neon Auth middleware for Next.js 14. Hosted generation endpoints themselves
 * gate hard in-route (see lib/hosted-access.ts); this only refreshes sessions
 * on protected paths. We deliberately do NOT redirect the whole app behind
 * sign-in: BYOK capture flows must stay usable signed-out.
 */
export function middleware(request: NextRequest) {
  if (neonAuthConfigured()) {
    return createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!.trim(),
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!.trim() },
    }).middleware({})(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/showcase/:path*"],
};
