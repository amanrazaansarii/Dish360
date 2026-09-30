import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * A quick gate in front of the dashboard.
 *
 * This only checks that a session cookie is *there*, which is enough to avoid
 * drawing the dashboard for someone who is signed out. The signature and the
 * session itself are checked on the server in `lib/auth/session.ts`, on every
 * request that reads anything — that is the real boundary, not this.
 */

const SESSION_COOKIE = "d360_session";

export function middleware(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  const signIn = new URL("/signin", request.url);
  // Remember where they were going so signing in can finish the journey.
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
