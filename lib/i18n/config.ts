// Site languages. English is the default and lives at the root; Russian is
// served under the /ru prefix on every host (main site, apply.*, partners.*).

export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that remembers an explicit language choice. */
export const LOCALE_COOKIE = "gate_locale";
/** Request header the proxy sets after stripping the /ru prefix. */
export const LOCALE_HEADER = "x-gate-locale";
/** Request header with the visible (pre-rewrite, un-prefixed) pathname. */
export const PATH_HEADER = "x-gate-path";

export const isLocale = (v: unknown): v is Locale => v === "en" || v === "ru";

/** Splits "/ru/about" into { locale: "ru", path: "/about" }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  if (pathname === "/ru" || pathname.startsWith("/ru/")) {
    return { locale: "ru", path: pathname.slice(3) || "/" };
  }
  return { locale: "en", path: pathname };
}

/** Adds the locale prefix to an internal path ("/about" → "/ru/about"). */
export function localizePath(path: string, locale: Locale): string {
  if (locale === "en" || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === "/ru" || path.startsWith("/ru/") || path.startsWith("/api/")) return path;
  if (path.startsWith("/#")) return `/ru${path.slice(1)}`;
  return path === "/" ? "/ru" : `/ru${path}`;
}

/** Adds the locale prefix to an absolute portal URL (https://apply… → https://apply…/ru). */
export function localizeUrl(url: string, locale: Locale): string {
  if (locale === "en") return url;
  try {
    const u = new URL(url);
    u.pathname = localizePath(u.pathname, locale);
    return u.toString().replace(/\/$/, "");
  } catch {
    return localizePath(url, locale);
  }
}
