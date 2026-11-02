import type { Metadata } from "next";
import { EditionPage, editionFaqs } from "@/components/site/editions";
import { BrandIntro } from "@/components/site/landing/brand-intro";
import {
  StructuredData,
  editionJsonLd,
  faqJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/components/seo/json-ld";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { getLocale, localeAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const current = localizeEdition(getCurrentEdition(), locale);
  const title =
    locale === "ru"
      ? `G.A.T.E. (GATE) — международные академические программы · ${current.name}, ${current.city}`
      : `G.A.T.E. (GATE) — International Academic Programs · ${current.name}, ${current.city}`;
  const description =
    locale === "ru"
      ? `G.A.T.E. (GATE Assessment) — международная академическая программа для школьников 1–12 классов. Ближайшая: ${current.name}, ${current.host}, ${current.dateLabel}.`
      : `G.A.T.E. (GATE Assessment) is an international academic program for students in Grades 1–12. Next: ${current.name} at ${current.host}, ${current.dateLabel}.`;

  return {
    title: { absolute: title },
    description,
    alternates: localeAlternates("/", locale),
    openGraph: {
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      title,
      description,
      images: [{ url: current.heroImage.src, alt: current.heroImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [current.heroImage.src],
    },
  };
}

// The homepage always features the soonest upcoming year (or the latest one
// once all have ended); see getCurrentEdition in lib/editions.ts.
export default async function HomePage() {
  const locale = await getLocale();
  const current = getCurrentEdition();
  const faqs = editionFaqs(current, locale);

  return (
    <>
      <StructuredData
        items={[
          organizationJsonLd(),
          websiteJsonLd(),
          editionJsonLd(current),
          ...(faqs.length ? [faqJsonLd(faqs)] : []),
        ]}
      />
      <EditionPage edition={current} />
      <BrandIntro />
    </>
  );
}
