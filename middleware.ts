import { NextResponse, type NextRequest } from "next/server";
import { PENDING_PROGRAM_COOKIE, PENDING_PROGRAM_COOKIE_MAX_AGE_SEC } from "@/lib/program-cta";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function middleware(req: NextRequest) {
  const program = req.nextUrl.searchParams.get("program");
  if (!program) return NextResponse.next();
  if (!SLUG_PATTERN.test(program)) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set({
    name: PENDING_PROGRAM_COOKIE,
    value: program,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_PROGRAM_COOKIE_MAX_AGE_SEC,
  });
  return res;
}

export const config = {
  matcher: ["/register", "/login", "/verify-email"],
};
