import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/coordinator",
  "/participant",
  "/partner",
];

const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (AUTH_ROUTES.includes(pathname) && sessionCookie) {
    return NextResponse.redirect(new URL("/participant", request.url));
  }

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
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
    "/login",
    "/register",
    "/dashboard/:path*",
    "/admin/:path*",
    "/coordinator/:path*",
    "/participant/:path*",
    "/partner/:path*",
  ],
};
