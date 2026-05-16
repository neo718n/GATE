import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CalendarDays,
  Award as AwardIcon,
  Hash,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import type { LookupStatus, PublicCertificate } from "@/lib/certificates/types";
import { PrintButton } from "./print-button";

const TIER_LABELS: Record<string, string> = {
  gold: "Gold Medal",
  silver: "Silver Medal",
  bronze: "Bronze Medal",
  honorable_mention: "Honorable Mention",
  participation: "Participation",
};

const TIER_CLASSES: Record<string, string> = {
  gold: "bg-gate-gold/15 text-gate-gold border-gate-gold/30",
  silver: "bg-foreground/10 text-foreground border-foreground/20",
  bronze: "bg-amber-700/10 text-amber-700 dark:text-amber-500 border-amber-700/30",
  honorable_mention:
    "bg-gate-700/10 text-gate-700 dark:text-gate-600 border-gate-700/30",
  participation: "bg-foreground/5 text-foreground/70 border-border",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  status: LookupStatus;
  certificate?: PublicCertificate;
  attemptedCode: string;
}

export function ResultCard({ status, certificate, attemptedCode }: Props) {
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
              Certificate Not Found
            </h1>
          </div>
        </header>
        <p className="mt-5 text-sm text-foreground/70 leading-relaxed">
          The code{" "}
          <span className="font-mono text-foreground bg-foreground/5 px-1.5 py-0.5 rounded">
            {attemptedCode}
          </span>{" "}
          does not match any G.A.T.E. certificate. It may have been mistyped, or
          the certificate may be fraudulent.
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

  if (!certificate) return null;

  const isRevoked = status === "revoked";
  const tierClass =
    TIER_CLASSES[certificate.award] ?? TIER_CLASSES.participation;

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden print:border-none print:shadow-none">
      <header
        className={`px-6 sm:px-8 py-5 border-b ${
          isRevoked
            ? "bg-amber-500/5 border-amber-500/20"
            : "bg-emerald-500/5 border-emerald-500/20"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isRevoked
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-500"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-500"
            }`}
          >
            {isRevoked ? (
              <ShieldAlert className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                isRevoked
                  ? "text-amber-700 dark:text-amber-500"
                  : "text-emerald-700 dark:text-emerald-500"
              }`}
              role="status"
            >
              {isRevoked ? "Certificate Revoked" : "Verified Certificate"}
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              {isRevoked
                ? `Revoked on ${formatDate(certificate.revokedAt!)}`
                : "Confirmed against the official G.A.T.E. registry"}
            </p>
          </div>
          <PrintButton />
        </div>
      </header>

      <div className="px-6 sm:px-8 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
          Awarded to
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {certificate.participantName}
        </h1>

        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
          <Field
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Subject"
            value={certificate.subjectName}
          />
          <Field
            icon={<AwardIcon className="h-3.5 w-3.5" />}
            label="Award Tier"
            value={
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tierClass}`}
              >
                {TIER_LABELS[certificate.award] ?? certificate.award}
              </span>
            }
          />
          {certificate.scorePercentile != null && (
            <Field
              icon={<AwardIcon className="h-3.5 w-3.5" />}
              label="Score Percentile"
              value={`${certificate.scorePercentile}th`}
            />
          )}
          <Field
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Assessment Cycle"
            value={`${certificate.cycleYear}`}
          />
          <Field
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Issued"
            value={formatDate(certificate.issuedAt)}
          />
          <Field
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Verification Code"
            value={
              <span className="font-mono text-foreground tracking-wider">
                {certificate.verificationCode}
              </span>
            }
          />
        </dl>
      </div>

      <footer className="px-6 sm:px-8 py-5 border-t border-border bg-background/40 text-xs text-foreground/55 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p>
          Issued by the G.A.T.E. Assessment Authority. This page was generated
          by the registry, not by the certificate holder.
        </p>
        <a
          href={`mailto:integrity@gate-assessment.org?subject=Report%20certificate%20${encodeURIComponent(certificate.verificationCode)}`}
          className="text-foreground/60 hover:text-destructive transition-colors print:hidden"
        >
          Report this certificate
        </a>
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
