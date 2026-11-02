import "server-only";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_HEADER, PATH_HEADER, isLocale, localizePath, type Locale } from "./config";

/** Locale of the current request, as resolved by proxy.ts. */
export async function getLocale(): Promise<Locale> {
  const v = (await headers()).get(LOCALE_HEADER);
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

/** Visible pathname without the locale prefix (e.g. "/about"). */
export async function getPath(): Promise<string> {
  return (await headers()).get(PATH_HEADER) ?? "/";
}

type PageMeta = { title: string; description: string };

/** Locale-aware metadata for a static page: title, description, canonical and hreflang. */
export async function pageMetadata(path: string, copy: { en: PageMeta; ru: PageMeta }): Promise<Metadata> {
  const locale = await getLocale();
  const { title, description } = copy[locale];
  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
  };
}

/** Metadata `alternates` for a page: canonical in the current locale plus hreflang links. */
export function localeAlternates(path: string, locale: Locale) {
  return {
    canonical: localizePath(path, locale),
    languages: {
      en: localizePath(path, "en"),
      ru: localizePath(path, "ru"),
      "x-default": localizePath(path, "en"),
    },
  };
}
