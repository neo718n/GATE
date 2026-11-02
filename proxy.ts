import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { PENDING_PROGRAM_COOKIE, PENDING_PROGRAM_COOKIE_MAX_AGE_SEC } from "@/lib/program-cta";
import { LOCALE_COOKIE, LOCALE_HEADER, PATH_HEADER, localizePath, splitLocale, type Locale } from "@/lib/i18n/config";

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

// Subdomain → internal route segment. apply.* serves the application form,
// partners.* the representative portal (internal segment "rep" so it never
// collides with the /partners/* logo files in public/).
const SUBDOMAIN_ROUTES: Record<string, string> = {
  apply: "/apply",
  partners: "/rep",
};

function subdomainOf(host: string | null): string | null {
  if (!host) return null;
  const name = host.split(":")[0].toLowerCase();
  const first = name.split(".")[0];
  return first in SUBDOMAIN_ROUTES && name.includes(".") ? first : null;
}

const startsWithSegment = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(prefix + "/");

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

// Pages that are never localized or auto-redirected to /ru.
const NON_LOCALIZED_PREFIXES = [...PROTECTED_PREFIXES, ...AUTH_ROUTES, "/verify-email", "/api", "/staff", "/qp", "/exam", "/examPartner", "/brochure"];

/**
 * Forward with the locale and the visible path as request headers, after
 * stripping /ru and mapping subdomains to their internal route segment.
 */
function forward(request: NextRequest, targetPath: string, locale: Locale, visiblePath: string) {
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  headers.set(PATH_HEADER, visiblePath);
  if (targetPath === request.nextUrl.pathname) {
    return NextResponse.next({ request: { headers } });
  }
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  return NextResponse.rewrite(url, { request: { headers } });
}

/**
 * First visit from Russia (no saved choice) → /ru. An explicit choice in the
 * gate_locale cookie always wins. Only plain page loads are redirected.
 */
function preferredLocaleRedirect(request: NextRequest, path: string, prefixed: Locale): NextResponse | null {
  if (prefixed === "ru" || request.method !== "GET") return null;
  if (request.headers.get("rsc") || request.headers.get("next-action") || request.headers.get("next-router-prefetch")) return null;
  if (!(request.headers.get("accept") ?? "").includes("text/html")) return null;
  if (NON_LOCALIZED_PREFIXES.some((p) => startsWithSegment(path, p))) return null;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const wantsRu = saved ? saved === "ru" : request.headers.get("x-vercel-ip-country") === "RU";
  if (!wantsRu) return null;
  const url = request.nextUrl.clone();
  url.pathname = localizePath(path, "ru");
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { locale, path: pathname } = splitLocale(request.nextUrl.pathname);

  const redirect = preferredLocaleRedirect(request, pathname, locale);
  if (redirect) return redirect;

  const sub = subdomainOf(request.headers.get("host"));
  if (sub) {
    if (pathname.startsWith("/api/")) return forward(request, pathname, locale, pathname);
    const base = SUBDOMAIN_ROUTES[sub];
    if (startsWithSegment(pathname, base)) return forward(request, pathname, locale, pathname.slice(base.length) || "/");
    return forward(request, pathname === "/" ? base : base + pathname, locale, pathname);
  }

  const sessionCookie = getSessionCookie(request);

  if (AUTH_ROUTES.includes(pathname) && sessionCookie) {
    return NextResponse.redirect(new URL("/participant", request.url));
  }

  if (PROTECTED_PREFIXES.some((p) => startsWithSegment(pathname, p))) {
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return applyPendingProgramCookie(request, forward(request, pathname, locale, pathname));
}

export const config = {
  // Every page request (subdomain routing needs them all); static files and
  // Next internals are skipped.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
