import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditionPage, editionFaqs } from "@/components/site/editions";
import { StructuredData, editionJsonLd, faqJsonLd } from "@/components/seo/json-ld";
import { EDITIONS, getEdition, isPast } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { getLocale, localeAlternates } from "@/lib/i18n/server";

// Only slugs from lib/editions.ts exist; anything else under / is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return EDITIONS.map((e) => ({ edition: e.slug }));
}

type Props = { params: Promise<{ edition: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getEdition((await params).edition);
  if (!found) return {};
  const locale = await getLocale();
  const edition = localizeEdition(found, locale);

  const title = `${edition.name} — ${edition.city}, ${edition.dateLabel}`;
  const lookBack = locale === "ru" ? `Вспоминаем, как прошла программа ${edition.name}.` : `A look back at ${edition.name}.`;
  const description = isPast(edition) ? `${edition.summary} ${lookBack}` : edition.summary;

  return {
    title,
    description,
    alternates: localeAlternates(`/${edition.slug}`, locale),
    openGraph: {
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      title: `G.A.T.E. · ${title}`,
      description,
      images: [{ url: edition.heroImage.src, alt: edition.heroImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `G.A.T.E. · ${title}`,
      description,
      images: [edition.heroImage.src],
    },
  };
}

export default async function EditionRoute({ params }: Props) {
  const edition = getEdition((await params).edition);
  if (!edition) notFound();

  const faqs = editionFaqs(edition, await getLocale());

  return (
    <>
      <StructuredData items={[editionJsonLd(edition), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <EditionPage edition={edition} />
    </>
  );
}
