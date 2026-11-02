import {
  ShieldCheck,
  ShieldX,
  ShieldOff,
  ArrowLeft,
  ArrowRight,
  Hash,
  MapPin,
  CalendarDays,
  Building2,
  Trophy,
} from "lucide-react";
import type {
  BadgeVerifyStatus,
  PublicEventBadge,
} from "@/lib/badges/lookup";
import type { PublicEventBadgeResult } from "@/lib/badges/results";
import { AWARD_LABELS, AWARD_CLASSES } from "@/lib/awards";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { Link } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { PrintButton } from "./print-button";

// Regional-indicator flag emoji (🇺🇿) don't render on every platform — Windows
// in particular shows the raw two-letter fallback ("uz") instead of a flag.
// flagcdn.com + a plain <img> is the same pattern already used for country
// flags elsewhere in this app (see phone-code-select.tsx) — reused here for
// consistent cross-device rendering instead of relying on emoji font support.
const COUNTRY_ISO: Record<string, string> = {
  Uzbekistan: "uz",
  Tajikistan: "tj",
  Russia: "ru",
  China: "cn",
};

const T = {
  en: {
    subjects: { math: "Mathematics", english: "English" } as Record<PublicEventBadgeResult["subject"], string>,
    roles: {
      CONTESTANT: "Contestant",
      TEAM_LEADER: "Team Leader",
      PARENT: "Parent",
      COUNTRY_REP: "Country Representative",
      MEDIA: "Media",
      STAFF: "Staff",
    } as Record<PublicEventBadge["roleBadge"], string>,
    eventLine: "GATE China 2026 · Hangzhou",
    eventDates: "18–24 August 2026",
    venueLine: "Hangzhou Institute of Technology · Building B1",
    unavailable: "Unavailable",
    disabledTitle: "Verification Temporarily Disabled",
    disabledLead: "Badge verification is currently offline. Please check back shortly, or contact event staff for assistance.",
    notFound: "Not Found",
    notFoundTitle: "Badge Not Found",
    notInRegistry: (event: string) => `isn't in the ${event} registry. Double-check the code — or treat the badge as unverified.`,
    tryAnother: "Try another code",
    verified: "Verified",
    confirmed: "Confirmed against the official G.A.T.E. event registry",
    country: "Country",
    badgeCode: "Badge Code",
    performance: "Contest Performance",
    score: (c: number, tq: number, p: number, pm: number) => `${c}/${tq} correct · ${p}/${pm} points`,
    viewFull: "View Full Performance",
    comingSoon: "View Full Performance · Coming Soon",
    lost: "Lost this badge?",
    reportAt: (venue: string) => `Report it at ${venue}.`,
  },
  ru: {
    subjects: { math: "Математика", english: "Английский язык" } as Record<PublicEventBadgeResult["subject"], string>,
    roles: {
      CONTESTANT: "Участник",
      TEAM_LEADER: "Руководитель команды",
      PARENT: "Родитель",
      COUNTRY_REP: "Представитель страны",
      MEDIA: "Пресса",
      STAFF: "Организатор",
    } as Record<PublicEventBadge["roleBadge"], string>,
    eventLine: "GATE China 2026 · Ханчжоу",
    eventDates: "18–24 августа 2026",
    venueLine: "Ханчжоуский технологический институт · корпус B1",
    unavailable: "Недоступно",
    disabledTitle: "Проверка временно отключена",
    disabledLead: "Проверка бейджей сейчас недоступна. Загляните чуть позже или обратитесь к организаторам.",
    notFound: "Не найден",
    notFoundTitle: "Бейдж не найден",
    notInRegistry: (event: string) => `нет в реестре ${event}. Проверьте код ещё раз — или считайте бейдж неподтверждённым.`,
    tryAnother: "Проверить другой код",
    verified: "Подтверждено",
    confirmed: "Сверено с официальным реестром мероприятия G.A.T.E.",
    country: "Страна",
    badgeCode: "Код бейджа",
    performance: "Результаты диагностики",
    score: (c: number, tq: number, p: number, pm: number) => `Верно: ${c} из ${tq} · баллы: ${p} из ${pm}`,
    viewFull: "Подробные результаты",
    comingSoon: "Подробные результаты · скоро",
    lost: "Нашли этот бейдж?",
    reportAt: (venue: string) => `Передайте его организаторам: ${venue}.`,
  },
};

interface Props {
  status: BadgeVerifyStatus;
  badge?: PublicEventBadge;
  results?: PublicEventBadgeResult[];
  attemptedCode: string;
}

export async function BadgeResultCard({ status, badge, results = [], attemptedCode }: Props) {
  const t = T[await getLocale()];

  if (status === "disabled") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <header className="flex items-start gap-4">
          <div
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground/40"
          >
            <ShieldOff className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">{t.unavailable}</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">{t.disabledTitle}</h1>
          </div>
        </header>
        <p className="mt-5 text-sm text-foreground/70 leading-relaxed">{t.disabledLead}</p>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-card p-6 sm:p-8 shadow-sm">
        <header className="flex items-start gap-4">
          <div
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
          >
            <ShieldX className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive">{t.notFound}</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">{t.notFoundTitle}</h1>
          </div>
        </header>
        <p className="mt-5 text-sm text-foreground/70 leading-relaxed">
          <span className="font-mono text-foreground bg-foreground/5 px-1.5 py-0.5 rounded break-all">{attemptedCode}</span>{" "}
          {t.notInRegistry(t.eventLine)}
        </p>
        <Link
          href="/verify"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gate-gold hover:text-gate-gold-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.tryAnother}
        </Link>
      </div>
    );
  }

  if (!badge) return null;

  const iso = COUNTRY_ISO[badge.country];

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden print:border-none print:shadow-none">
      {/* Role-color accent bar — echoes the strip on the physical badge */}
      <div aria-hidden className="h-1.5 w-full" style={{ backgroundColor: badge.badgeColorHex }} />

      {/* Partnership lockup — same institutions as the logo band on the
          physical badge, so the digital and printed credential visibly match */}
      <div className="px-6 sm:px-10 py-5 flex items-center justify-center gap-5 sm:gap-7 border-b border-border/60 bg-foreground/[0.015]">
        <ThemeAwareLogo size="xs" showTagline={false} />
        <span aria-hidden className="h-6 w-px bg-border" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/partners/xidian-university.png" alt="Xidian University" className="h-8 sm:h-9 w-auto object-contain" />
        <span aria-hidden className="h-6 w-px bg-border" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/partners/edsquare.jpg" alt="EdSquare" className="h-4 sm:h-[18px] w-auto object-contain" />
      </div>

      {/* Hero: verification status is the primary focus of the page */}
      <header className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center bg-emerald-500/[0.04]">
        <div className="flex justify-end print:hidden">
          <PrintButton />
        </div>
        <div
          aria-hidden
          className="mx-auto -mt-2 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-500"
        >
          <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2} />
        </div>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-500" role="status">
          {t.verified}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-foreground/60">{t.confirmed}</p>
      </header>

      <div className="px-6 sm:px-10 py-8 sm:py-10 border-t border-border text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">{t.eventLine}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm text-foreground/60">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.eventDates}
        </p>

        <h2 className="mt-5 font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-foreground break-words">{badge.fullName}</h2>

        <span
          className="mt-4 inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white"
          style={{ backgroundColor: badge.badgeColorHex }}
        >
          {t.roles[badge.roleBadge]}
        </span>

        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm text-left max-w-md mx-auto">
          <Field
            icon={<MapPin className="h-3.5 w-3.5" />}
            label={t.country}
            value={
              <span className="inline-flex items-center gap-1.5">
                {iso && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://flagcdn.com/w20/${iso}.png`} alt="" width={20} height={15} className="shrink-0 rounded-[2px]" />
                )}
                {badge.country}
              </span>
            }
          />
          <Field
            icon={<Hash className="h-3.5 w-3.5" />}
            label={t.badgeCode}
            value={<span className="font-mono text-foreground tracking-wider">{badge.cardNo}</span>}
          />
        </dl>
      </div>

      {results.length > 0 && (
        <div className="px-6 sm:px-10 py-8 sm:py-10 border-t border-border">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50 text-center">{t.performance}</p>
          <div className="mt-5 space-y-4 max-w-md mx-auto">
            {results.map((r) => (
              <div key={r.subject} className="rounded-xl border border-border bg-foreground/[0.015] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{t.subjects[r.subject]}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${AWARD_CLASSES[r.award]}`}
                  >
                    <Trophy className="h-3 w-3" aria-hidden />
                    {AWARD_LABELS[r.award]}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-foreground/60">{t.score(r.correctCount, r.totalQuestions, r.pointsEarned, r.pointsMax)}</p>
                {r.performanceReady ? (
                  <Link
                    href={`/verify/${badge.cardNo}/performance`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gate-gold hover:text-gate-gold-2 transition-colors"
                  >
                    {t.viewFull}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                ) : (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/40">{t.comingSoon}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="px-6 sm:px-10 py-5 border-t border-border bg-background/40 text-xs text-foreground/55">
        <p className="flex items-start gap-1.5">
          <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground/40" aria-hidden />
          <span>
            <span className="font-semibold text-foreground/70">{t.lost}</span> {t.reportAt(t.venueLine)}
          </span>
        </p>
      </footer>
    </article>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
        <span className="text-foreground/40" aria-hidden>
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-1 text-base text-foreground break-words">{value}</dd>
    </div>
  );
}
