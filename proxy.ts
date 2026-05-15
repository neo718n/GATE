import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { PENDING_PROGRAM_COOKIE, PENDING_PROGRAM_COOKIE_MAX_AGE_SEC } from "@/lib/program-cta";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/coordinator",
  "/participant",
  "/partner",
];

const AUTH_ROUTES = ["/login", "/register"];
const PROGRAM_CAPTURE_ROUTES = ["/login", "/register", "/verify-email"];
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function applyPendingProgramCookie(request: NextRequest, response: NextResponse): NextResponse {
  if (!PROGRAM_CAPTURE_ROUTES.includes(request.nextUrl.pathname)) return response;
  const program = request.nextUrl.searchParams.get("program");
  if (!program || !SLUG_PATTERN.test(program)) return response;
  response.cookies.set({
    name: PENDING_PROGRAM_COOKIE,
    value: program,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_PROGRAM_COOKIE_MAX_AGE_SEC,
  });
  return response;
}

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

  return applyPendingProgramCookie(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verify-email",
    "/dashboard/:path*",
    "/admin/:path*",
    "/coordinator/:path*",
    "/participant/:path*",
    "/partner/:path*",
  ],
};
