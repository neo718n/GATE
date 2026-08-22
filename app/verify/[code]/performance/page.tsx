import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { formatBadgeCode, lookupRawBadgeByCode } from "@/lib/badges/lookup";
import { lookupExamResultsForBadge, sanitizeResult } from "@/lib/badges/results";
import { PerformanceReport } from "@/components/verify/performance-report";

export const metadata: Metadata = {
  title: "Contest Performance · G.A.T.E.",
  robots: { index: false, follow: false },
};

export default async function BadgePerformancePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const canonical = formatBadgeCode(decodeURIComponent(code));
  const badge = await lookupRawBadgeByCode(canonical);

  const backLink = (
    <Link
      href={`/verify/${canonical}`}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50 hover:text-gate-gold transition-colors mb-6 print:hidden"
    >
      <ArrowLeft className="h-3 w-3" aria-hidden />
      Back to badge
    </Link>
  );

  if (!badge) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <EmptyState
          title="Badge Not Found"
          message={`"${canonical}" isn't in the event registry.`}
        />
      </div>
    );
  }

  const results = (await lookupExamResultsForBadge(badge.id)).map(sanitizeResult);

  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <EmptyState
          title="No Performance Data Yet"
          message={`${badge.fullName}'s contest result hasn't been recorded yet — check back after grading is complete.`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      {backLink}
      <PerformanceReport
        fullName={badge.fullName}
        country={badge.country}
        cardNo={badge.cardNo}
        results={results}
      />
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm text-center">
      <div
        aria-hidden
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 text-foreground/40"
      >
        <FileQuestion className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-foreground/60">{message}</p>
    </div>
  );
}
