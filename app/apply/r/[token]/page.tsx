import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { Link2Off } from "lucide-react";
import { db } from "@/lib/db";
import { repInviteLinks } from "@/lib/db/schema";
import { ApplicationForm } from "@/components/apply/application-form";
import { submitLinkApplication } from "@/lib/actions/applications";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { detectCountryName } from "@/lib/applications/detect-country";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const ru = (await getLocale()) === "ru";
  return { title: ru ? "Регистрация" : "Registration", robots: { index: false } };
}

const T = {
  en: {
    inactive: "This link is no longer active",
    inactiveLead: "Please ask the person who shared it for a new registration link.",
    via: (p: string) => `via ${p}`,
    title: "Student registration",
    lead: (p: string) => `Fill in the participant's details exactly as in the passport. Fees are arranged with ${p}.`,
  },
  ru: {
    inactive: "Эта ссылка больше не действует",
    inactiveLead: "Попросите у того, кто её прислал, новую ссылку для регистрации.",
    via: (p: string) => `через ${p}`,
    title: "Регистрация ученика",
    lead: (p: string) => `Заполните данные участника точно как в загранпаспорте. Оплата участия — через ${p}.`,
  },
};

// Form shared by a country representative. Same form as individuals, but
// no online payment — the representative handles fees directly.
export default async function InviteLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const locale = await getLocale();
  const t = T[locale];
  const link = await db.query.repInviteLinks.findFirst({
    where: and(eq(repInviteLinks.token, token), eq(repInviteLinks.active, true)),
    with: { representative: true },
  });
  const edition = localizeEdition(getCurrentEdition(), locale);
  const partner = link?.representative.active ? link.representative : null;

  return (
    <div className="relative overflow-hidden">
      <div className="gold-aura pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 md:pt-16">
        {!partner ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory-2 text-ink-3">
              <Link2Off className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-4xl font-medium text-ink">{t.inactive}</h1>
            <p className="text-ink-2">{t.inactiveLead}</p>
          </div>
        ) : (
          <>
            <div className="mb-10 flex max-w-3xl flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gate-gold">
                {edition.name} · {t.via(partner.organization ?? partner.name)}
              </span>
              <h1 className="font-serif text-4xl font-medium leading-[1.02] text-ink md:text-6xl">{t.title}</h1>
              <p className="text-[15px] leading-relaxed text-ink-2">{t.lead(partner.organization ?? partner.name)}</p>
            </div>
            <ApplicationForm
              mode="link"
              partnerName={partner.organization ?? partner.name}
              submit={submitLinkApplication.bind(null, token)}
              detectedCountry={await detectCountryName()}
            />
          </>
        )}
      </div>
    </div>
  );
}
