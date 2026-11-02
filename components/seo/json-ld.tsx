import { BRAND, BRAND_ALIASES, SITE_URL } from "@/lib/site";
import { isPast, type Edition } from "@/lib/editions";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a string can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const ORG_ID = `${SITE_URL}/#organization`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: BRAND.name,
    alternateName: [...BRAND_ALIASES],
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}${BRAND.logo}`,
    description: BRAND.shortDescription,
    email: BRAND.email,
    foundingDate: BRAND.founded,
    sameAs: [...BRAND.sameAs],
    parentOrganization: { "@type": "Organization", name: BRAND.operator },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND.name,
    alternateName: ["GATE", "G.A.T.E", "GATE Assessment"],
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
  };
}

export function editionJsonLd(edition: Edition) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: edition.name,
    description: edition.summary,
    url: `${SITE_URL}/${edition.slug}`,
    startDate: edition.startDate,
    endDate: edition.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    educationalLevel: `Grades ${edition.grades[0]}–${edition.grades[1]}`,
    about: edition.subjects.map((s) => s.name),
    image: edition.heroImage.src.startsWith("http")
      ? edition.heroImage.src
      : `${SITE_URL}${edition.heroImage.src}`,
    location: {
      "@type": "Place",
      name: edition.host,
      address: {
        "@type": "PostalAddress",
        addressLocality: edition.city,
        addressCountry: edition.country,
      },
    },
    organizer: { "@id": ORG_ID },
    ...(isPast(edition)
      ? {}
      : {
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/${edition.slug}`,
            availability: "https://schema.org/InStock",
            ...(edition.price ? { price: String(edition.price.amount), priceCurrency: edition.price.currency } : {}),
          },
        }),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function StructuredData({ items }: { items: Record<string, unknown>[] }) {
  return (
    <>
      {items.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
    </>
  );
}
