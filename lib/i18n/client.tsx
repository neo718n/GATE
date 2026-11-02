"use client";

import NextLink from "next/link";
import { createContext, forwardRef, useContext } from "react";
import { LOCALE_COOKIE, localizePath, localizeUrl, type Locale } from "./config";

const LocaleCtx = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleCtx.Provider value={locale}>{children}</LocaleCtx.Provider>;
}

export const useLocale = () => useContext(LocaleCtx);

/** next/link that keeps the visitor in their language (adds /ru when needed). */
export const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof NextLink>>(function LocaleLink(
  { href, ...rest },
  ref,
) {
  const locale = useLocale();
  const target =
    typeof href === "string"
      ? /^https?:\/\//.test(href)
        ? localizeUrlIfPortal(href, locale)
        : localizePath(href, locale)
      : href;
  return <NextLink ref={ref} href={target} {...rest} />;
});

// Only our own portals understand the /ru prefix; leave other sites alone.
function localizeUrlIfPortal(url: string, locale: Locale) {
  return /gate-assessment\.org|localhost/.test(url) ? localizeUrl(url, locale) : url;
}

/** Remembers the visitor's explicit choice for every subdomain. */
export function rememberLocale(locale: Locale) {
  const host = window.location.hostname;
  const domain = host.endsWith("gate-assessment.org") ? "; domain=.gate-assessment.org" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax${domain}`;
}
