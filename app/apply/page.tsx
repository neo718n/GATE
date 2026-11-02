import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { ApplicationForm } from "@/components/apply/application-form";
import { submitIndividualApplication } from "@/lib/actions/applications";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { detectCountryName } from "@/lib/applications/detect-country";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const edition = localizeEdition(getCurrentEdition(), locale);
  return locale === "ru"
    ? {
        title: `Заявка на ${edition.name}`,
        description: `Заявка на программу ${edition.name}: ${edition.host}, ${edition.city} — ${edition.dateLabel}.`,
      }
    : {
        title: `Apply for ${edition.name}`,
        description: `Apply for ${edition.name} at ${edition.host}, ${edition.city} — ${edition.dateLabel}.`,
      };
}

const T = {
  en: {
    title: "Apply in three short steps",
    lead: "Takes about five minutes. Have the participant's passport nearby — the name must match it exactly.",
    cancelled: "Payment wasn't completed, so no charge was made. You can submit the form again whenever you're ready.",
  },
  ru: {
    title: "Заявка в три коротких шага",
    lead: "Займёт около пяти минут. Держите под рукой загранпаспорт участника — имя должно совпадать с ним до буквы.",
    cancelled: "Оплата не завершена, деньги не списаны. Вы можете отправить форму снова, когда будете готовы.",
  },
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ cancelled?: string }> }) {
  const { cancelled } = await searchParams;
  const locale = await getLocale();
  const t = T[locale];
  const edition = localizeEdition(getCurrentEdition(), locale);

  return (
    <div className="relative overflow-hidden">
      <div className="gold-aura pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="tech-grid pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 md:pt-16">
        <div className="mb-10 flex max-w-3xl flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gate-gold">
            {edition.name} · {edition.shortDateLabel}
          </span>
          <h1 className="font-serif text-4xl font-medium leading-[1.02] text-ink md:text-6xl">{t.title}</h1>
          <p className="text-[15px] leading-relaxed text-ink-2 md:text-base">{t.lead}</p>
        </div>
        {cancelled && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gate-gold/40 bg-gate-gold/10 px-5 py-4 text-[14px] text-ink">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gate-gold" />
            {t.cancelled}
          </div>
        )}
        <ApplicationForm mode="individual" submit={submitIndividualApplication} detectedCountry={await detectCountryName()} />
      </div>
    </div>
  );
}
