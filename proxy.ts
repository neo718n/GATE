import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/coordinator",
  "/participant",
  "/partner",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/coordinator/:path*",
    "/participant/:path*",
    "/partner/:path*",
  ],
};
