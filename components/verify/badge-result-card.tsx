import Link from "next/link";
import { ShieldCheck, ShieldX, ArrowLeft, Hash, MapPin } from "lucide-react";
import type {
  BadgeVerifyStatus,
  PublicEventBadge,
} from "@/lib/badges/lookup";
import { PrintButton } from "./print-button";

const ROLE_LABELS: Record<PublicEventBadge["roleBadge"], string> = {
  CONTESTANT: "Contestant",
  TEAM_LEADER: "Team Leader",
  PARENT: "Parent",
  COUNTRY_REP: "Country Representative",
  MEDIA: "Media",
  STAFF: "Staff",
};

const COUNTRY_FLAGS: Record<string, string> = {
  Uzbekistan: "🇺🇿",
  Tajikistan: "🇹🇯",
  Russia: "🇷🇺",
  China: "🇨🇳",
};

const EVENT_LINE = "GATE China Camp 2026 · Hangzhou";

interface Props {
  status: BadgeVerifyStatus;
  badge?: PublicEventBadge;
  attemptedCode: string;
}

export function BadgeResultCard({ status, badge, attemptedCode }: Props) {
  if (status === "not_found") {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-card p-6 sm:p-8 shadow-sm">
        <header className="flex items-start gap-4">
          <div
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
          >
            <ShieldX className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive">
              Not Found
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
              Badge Not Found
            </h1>
          </div>
        </header>
        <p className="mt-5 text-sm text-foreground/70 leading-relaxed">
          The code{" "}
          <span className="font-mono text-foreground bg-foreground/5 px-1.5 py-0.5 rounded">
            {attemptedCode}
          </span>{" "}
          does not match any registered {EVENT_LINE} badge. It may have been
          mistyped, or the badge may not be genuine.
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

  if (!badge) return null;

  const flag = COUNTRY_FLAGS[badge.country] ?? "🌐";

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden print:border-none print:shadow-none">
      <header className="px-6 sm:px-8 py-5 border-b bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-500"
          >
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-500"
              role="status"
            >
              Verified Badge
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              Confirmed against the official G.A.T.E. event registry
            </p>
          </div>
          <PrintButton />
        </div>
      </header>

      <div className="px-6 sm:px-8 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
          {EVENT_LINE}
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {badge.fullName}
        </h1>

        <span
          className="mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white"
          style={{ backgroundColor: badge.badgeColorHex }}
        >
          {ROLE_LABELS[badge.roleBadge]}
        </span>

        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
          <Field
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Country"
            value={
              <span>
                <span aria-hidden className="mr-1.5">
                  {flag}
                </span>
                {badge.country}
              </span>
            }
          />
          <Field
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Badge Code"
            value={
              <span className="font-mono text-foreground tracking-wider">
                {badge.cardNo}
              </span>
            }
          />
        </dl>
      </div>

      <footer className="px-6 sm:px-8 py-5 border-t border-border bg-background/40 text-xs text-foreground/55">
        <p>
          Issued by the G.A.T.E. Assessment Authority. This page was generated
          by the registry, not by the badge holder.
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
      <dd className="mt-1 text-base text-foreground">{value}</dd>
    </div>
  );
}
