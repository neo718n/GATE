import type { Edition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import type { Locale } from "@/lib/i18n/config";
import { EditionView } from "./edition-view";
import { Summer2026View, summer2026Faqs } from "./summer-2026";

// Years with bespoke extras. Every other year renders the generic,
// config-driven EditionView.
const CUSTOM_VIEWS: Record<
  string,
  {
    View: (p: { headingLevel?: "h1" | "h2" }) => React.ReactNode;
    faqs: (locale: Locale) => { q: string; a: string }[];
  }
> = {
  "2026-summer": { View: Summer2026View, faqs: summer2026Faqs },
};

export function EditionPage({ edition, headingLevel }: { edition: Edition; headingLevel?: "h1" | "h2" }) {
  const custom = CUSTOM_VIEWS[edition.slug];
  if (custom) return <custom.View headingLevel={headingLevel} />;
  return <EditionView edition={edition} headingLevel={headingLevel} />;
}

export function editionFaqs(edition: Edition, locale: Locale = "en") {
  return CUSTOM_VIEWS[edition.slug]?.faqs(locale) ?? localizeEdition(edition, locale).faqs;
}
