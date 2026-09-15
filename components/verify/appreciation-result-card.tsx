import Link from "next/link";
import {
  ShieldCheck,
  ShieldX,
  ShieldOff,
  ArrowLeft,
  MapPin,
  CalendarDays,
  Hash,
  BadgeCheck,
  Building2,
} from "lucide-react";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { PrintButton } from "./print-button";

// Sibling to certificate-result-card.tsx for the non-contestant case — a
// badge holder honored for a role (Country Representative, Staff, ...)
// rather than an exam award. No score/subject fields since none exist.
const COUNTRY_ISO: Record<string, string> = {
  Uzbekistan: "uz",
  Tajikistan: "tj",
  Russia: "ru",
  China: "cn",
};

const EVENT_LINE = "GATE China 2026 · Hangzhou";
const EVENT_DATES = "18–24 August 2026";
const VENUE_LINE = "Hangzhou Institute of Technology · Building B1";

export type AppreciationVerifyStatus = "verified" | "not_found" | "disabled";

export interface PublicAppreciationBadge {
  cardNo: string;
  fullName: string;
  country: string;
}

interface Props {
  status: AppreciationVerifyStatus;
  badge?: PublicAppreciationBadge;
  roleLabel?: string;
  serial?: string;
  attemptedCode: string;
}

export function AppreciationResultCard({ status, badge, roleLabel, serial, attemptedCode }: Props) {
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Unavailable
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
              Verification Temporarily Disabled
            </h1>
          </div>
        </header>
        <p className="mt-5 text-sm text-foreground/70 leading-relaxed">
          Certificate verification is currently offline. Please check back
          shortly, or contact event staff for assistance.
        </p>
      </div>
    );
  }

  if (status === "not_found" || !badge || !roleLabel || !serial) {
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive">
              Not Found
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
              Certificate Not Found
            </h1>
          </div>
        </header>
        <p className="mt-5 text-sm text-foreground/70 leading-relaxed">
          <span className="font-mono text-foreground bg-foreground/5 px-1.5 py-0.5 rounded break-all">
            {attemptedCode}
          </span>{" "}
          doesn&apos;t match a certificate in the {EVENT_LINE} registry.
          Double-check the code — or treat the certificate as unverified.
        </p>
        <Link
          href="/verify"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gate-gold hover:text-gate-gold-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Try another code
        </Link>
      </div>
    );
  }

  const iso = COUNTRY_ISO[badge.country];

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden print:border-none print:shadow-none">
      <div aria-hidden className="h-1.5 w-full bg-gate-gold" />

      <div className="px-6 sm:px-10 py-5 flex items-center justify-center gap-5 sm:gap-7 border-b border-border/60 bg-foreground/[0.015]">
        <ThemeAwareLogo size="xs" showTagline={false} />
        <span aria-hidden className="h-6 w-px bg-border" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/partners/xidian-university.png"
          alt="Xidian University"
          className="h-8 sm:h-9 w-auto object-contain"
        />
        <span aria-hidden className="h-6 w-px bg-border" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/partners/edsquare.jpg"
          alt="EdSquare"
          className="h-4 sm:h-[18px] w-auto object-contain"
        />
      </div>

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
        <h1
          className="mt-4 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-500"
          role="status"
        >
          Verified
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-foreground/60">
          Confirmed against the official G.A.T.E. certificate registry
        </p>
      </header>

      <div className="px-6 sm:px-10 py-8 sm:py-10 border-t border-border text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
          {EVENT_LINE}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm text-foreground/60">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {EVENT_DATES}
        </p>

        <h2 className="mt-5 font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-foreground break-words">
          {badge.fullName}
        </h2>

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gate-gold/40 bg-gate-gold/10 text-gate-gold-2 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.1em]">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          Certificate of Appreciation &middot; {roleLabel}
        </span>

        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm text-left max-w-md mx-auto">
          <Field
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Country"
            value={
              <span className="inline-flex items-center gap-1.5">
                {iso && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://flagcdn.com/w20/${iso}.png`}
                    alt=""
                    width={20}
                    height={15}
                    className="shrink-0 rounded-[2px]"
                  />
                )}
                {badge.country}
              </span>
            }
          />
          <Field
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Certificate Serial"
            value={<span className="font-mono text-foreground tracking-wider">{serial}</span>}
          />
          <Field
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Badge Code"
            value={<span className="font-mono text-foreground tracking-wider">{badge.cardNo}</span>}
          />
        </dl>
      </div>

      <footer className="px-6 sm:px-10 py-5 border-t border-border bg-background/40 text-xs text-foreground/55">
        <p className="flex items-start gap-1.5">
          <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground/40" aria-hidden />
          <span>
            <span className="font-semibold text-foreground/70">Questions about this certificate?</span>{" "}
            Contact us at {VENUE_LINE}.
          </span>
        </p>
      </footer>
    </article>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
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
