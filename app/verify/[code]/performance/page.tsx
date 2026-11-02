import type { Metadata } from "next";
import { Link } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { formatBadgeCode, lookupRawBadgeByCode } from "@/lib/badges/lookup";
import { lookupExamResultsForBadge, sanitizeResult } from "@/lib/badges/results";
import { isBadgeVerifyEnabled } from "@/lib/badges/verify-flow";
import { PerformanceReport } from "@/components/verify/performance-report";

export async function generateMetadata(): Promise<Metadata> {
  const ru = (await getLocale()) === "ru";
  return {
    title: ru ? "Результаты диагностики · G.A.T.E." : "Contest Performance · G.A.T.E.",
    robots: { index: false, follow: false },
  };
}


export default async function BadgePerformancePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const canonical = formatBadgeCode(decodeURIComponent(code));
  const ru = (await getLocale()) === "ru";
  const badge = await lookupRawBadgeByCode(canonical);

  const backLink = (
    <Link
      href={`/verify/${canonical}`}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50 hover:text-gate-gold transition-colors mb-6 print:hidden"
    >
      <ArrowLeft className="h-3 w-3" aria-hidden />
      {ru ? "К бейджу" : "Back to badge"}
    </Link>
  );

  if (!(await isBadgeVerifyEnabled())) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <EmptyState
          title={ru ? "Проверка временно отключена" : "Verification Temporarily Disabled"}
          message={ru ? "Проверка бейджей сейчас недоступна. Загляните чуть позже." : "Badge verification is currently offline. Please check back shortly."}
        />
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <EmptyState
          title={ru ? "Бейдж не найден" : "Badge Not Found"}
          message={ru ? `«${canonical}» нет в реестре мероприятия.` : `"${canonical}" isn't in the event registry.`}
        />
      </div>
    );
  }

  const allResults = (await lookupExamResultsForBadge(badge.id)).map(sanitizeResult);

  if (allResults.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <EmptyState
          title={ru ? "Результатов пока нет" : "No Performance Data Yet"}
          message={ru ? `Результат участника ${badge.fullName} ещё не внесён — загляните после проверки работ.` : `${badge.fullName}'s contest result hasn't been recorded yet — check back after grading is complete.`}
        />
      </div>
    );
  }

  // Results re-graded after a scoring mistake was found have their corrected
  // score/medal live everywhere already (badge card, certificate) but the
  // per-question breakdown here isn't individually re-verified yet — see
  // eventBadgeResults.performanceReady in lib/db/schema.ts.
  const results = allResults.filter((r) => r.performanceReady);

  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
        {backLink}
        <EmptyState
          title={ru ? "Скоро" : "Coming Soon"}
          message={ru ? `Баллы и медаль участника ${badge.fullName} подтверждены — подробный разбор по вопросам ещё готовится.` : `${badge.fullName}'s score and medal are confirmed — the full question-by-question report is still being finalized.`}
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
