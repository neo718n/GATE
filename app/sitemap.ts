import type { MetadataRoute } from "next";
import { getCurrentEdition, getEditions } from "@/lib/editions";
import { localizePath } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.9 },
  { path: "/prepare", priority: 0.8 },
  { path: "/subjects", priority: 0.7 },
  { path: "/awards", priority: 0.6 },
  { path: "/verify", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/partnerships", priority: 0.5 },
  { path: "/careers", priority: 0.4 },
  { path: "/rules", priority: 0.3 },
  { path: "/academic-integrity", priority: 0.3 },
  { path: "/educational-framework", priority: 0.3 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

const url = (path: string, locale: "en" | "ru") => {
  const p = localizePath(path, locale);
  return `${SITE_URL}${p === "/" ? "" : p}`;
};

// Every page is listed in English and Russian, each pointing at the other.
function entries(path: string, priority: number, lastModified: Date): MetadataRoute.Sitemap {
  const languages = { en: url(path, "en"), ru: url(path, "ru") };
  return (["en", "ru"] as const).map((locale) => ({
    url: url(path, locale),
    lastModified,
    priority: locale === "en" ? priority : Math.round(priority * 90) / 100,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const current = getCurrentEdition(now);

  return [
    ...STATIC_PAGES.flatMap(({ path, priority }) => entries(path, priority, now)),
    ...getEditions().flatMap((e) => entries(`/${e.slug}`, e.slug === current.slug ? 0.95 : 0.6, now)),
  ];
}
