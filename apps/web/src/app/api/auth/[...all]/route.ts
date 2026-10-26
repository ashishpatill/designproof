import { createNeonAuth } from "@neondatabase/auth/next/server";
import { neonAuthConfigured } from "@/lib/neon-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Neon Managed Auth catch-all (Better Auth pattern): GET/POST `/api/auth/*`
 * is proxied to the Neon Auth backend. When Neon Auth env is absent the route
 * answers honestly instead of pretending auth exists.
 */
export function GET(request: Request, ctx: { params: { all: string[] } }) {
  if (!neonAuthConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "auth_not_configured: set NEON_AUTH_BASE_URL + NEON_AUTH_COOKIE_SECRET" },
      { status: 401 },
    );
  }
  const handler = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!.trim(),
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!.trim() },
  }).handler();
  return handler.GET(request, { params: Promise.resolve({ path: ctx.params.all }) });
}

export function POST(request: Request, ctx: { params: { all: string[] } }) {
  if (!neonAuthConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "auth_not_configured: set NEON_AUTH_BASE_URL + NEON_AUTH_COOKIE_SECRET" },
      { status: 401 },
    );
  }
  const handler = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!.trim(),
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!.trim() },
  }).handler();
  return handler.POST(request, { params: Promise.resolve({ path: ctx.params.all }) });
}
