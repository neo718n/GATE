import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (sessionToken) {
    return NextResponse.redirect(new URL("/participant", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register"],
};
