import { AlertTriangle, MapPin } from "lucide-react";
import type { PublicEventBadgeResult } from "@/lib/badges/results";
import {
  computeMathDiagnostics,
  computeEnglishDiagnostics,
  type QuestionStatus,
} from "@/lib/badges/results";
import { AWARD_LABELS, AWARD_CLASSES } from "@/lib/awards";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { PrintButton } from "./print-button";

const STATUS_DOT: Record<QuestionStatus, string> = {
  correct: "bg-emerald-500",
  wrong: "bg-destructive",
  blank: "bg-foreground/25",
  ambiguous: "bg-amber-500",
};

const STATUS_BAR: Record<string, string> = {
  ok: "bg-emerald-500",
  mid: "bg-gate-gold",
  low: "bg-destructive",
};

interface Props {
  fullName: string;
  country: string;
  cardNo: string;
  results: PublicEventBadgeResult[];
}

export function PerformanceReport({ fullName, country, cardNo, results }: Props) {
  return (
    <article className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
            Contest Performance
          </p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {fullName}
          </h1>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-foreground/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {country} &middot; <span className="font-mono">{cardNo}</span>
          </p>
        </div>
        <div className="print:hidden">
          <PrintButton />
        </div>
      </header>

      {results.map((r) =>
        r.subject === "math" ? (
          <MathSection key={r.subject} result={r} />
        ) : (
          <EnglishSection key={r.subject} result={r} />
        ),
      )}

      <div className="flex items-center justify-center gap-5 pt-4 border-t border-border">
        <ThemeAwareLogo size="xs" showTagline={false} />
      </div>
    </article>
  );
}

function ScoreBadge({ result }: { result: PublicEventBadgeResult }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="font-serif text-3xl font-semibold text-foreground leading-none">
          {result.pointsEarned}
          <span className="text-base text-foreground/40 font-sans font-normal">
            {" "}
            / {result.pointsMax}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-foreground/50">
          {result.correctCount}/{result.totalQuestions} correct
        </p>
      </div>
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${AWARD_CLASSES[result.award]}`}
      >
        {AWARD_LABELS[result.award]}
      </span>
    </div>
  );
}

function Bar({ label, correct, total }: { label: string; correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const tone = pct >= 70 ? "ok" : pct >= 40 ? "mid" : "low";
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
      <div>
        <div className="flex items-center justify-between text-xs text-foreground/70 mb-1">
          <span className="font-medium">{label}</span>
          <span className="text-foreground/40">
            {correct}/{total}
          </span>
        </div>
        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${STATUS_BAR[tone]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function QuestionGrid({ statuses }: { statuses: QuestionStatus[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((s, i) => (
        <div
          key={i}
          title={`Q${i + 1}: ${s}`}
          className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ${STATUS_DOT[s]}`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

function MathSection({ result }: { result: PublicEventBadgeResult }) {
  const diag = computeMathDiagnostics(result);
  if (!diag) return null;
  const misses = diag.perQuestion.filter((q) => q.status !== "correct");

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 py-5 border-b border-border bg-foreground/[0.015] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gate-gold">
            Mathematics
          </p>
          <p className="mt-0.5 text-sm text-foreground/60">{diag.categoryLabel}</p>
        </div>
        <ScoreBadge result={result} />
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            All 25 Questions
          </p>
          <QuestionGrid statuses={diag.perQuestion.map((q) => q.status)} />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            By Difficulty
          </p>
          <div className="space-y-3">
            {diag.difficultyBreakdown.map((d) => (
              <Bar key={d.difficulty} label={d.difficulty} correct={d.correct} total={d.total} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            By Skill Area
          </p>
          <div className="space-y-3">
            {diag.domainBreakdown.map((d) => (
              <Bar key={d.domain} label={d.domainName} correct={d.correct} total={d.total} />
            ))}
          </div>
        </div>

        {misses.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
              Questions To Review
            </p>
            <div className="space-y-2">
              {misses.map((q) => (
                <div
                  key={q.q}
                  className="rounded-lg border border-destructive/20 bg-destructive/[0.03] p-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-foreground/70">Q{q.q}</span>
                    <span className="text-foreground/40">{q.domainName}</span>
                    <span className="ml-auto font-mono text-foreground/50">
                      picked {q.given || "—"} &middot; correct {q.correct}
                    </span>
                  </div>
                  <p className="mt-1.5 text-foreground/70">{q.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.notes && <NotesCallout notes={result.notes} />}
      </div>
    </section>
  );
}

function EnglishSection({ result }: { result: PublicEventBadgeResult }) {
  const diag = computeEnglishDiagnostics(result);
  if (!diag) return null;
  const misses = diag.perQuestion.filter((q) => q.status !== "correct");

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 py-5 border-b border-border bg-foreground/[0.015] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gate-gold">
            English
          </p>
          <p className="mt-0.5 text-sm text-foreground/60">{diag.paperLabel}</p>
        </div>
        <ScoreBadge result={result} />
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            All {diag.perQuestion.length} Questions
          </p>
          <QuestionGrid statuses={diag.perQuestion.map((q) => q.status)} />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            By Section
          </p>
          <div className="space-y-3">
            {diag.sectionBreakdown.map((s) => (
              <Bar
                key={s.section}
                label={`${s.skillLabel} (${s.pointsEarned}/${s.pointsMax} pts)`}
                correct={s.correct}
                total={s.total}
              />
            ))}
          </div>
        </div>

        {misses.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
              Questions To Review
            </p>
            <div className="space-y-2">
              {misses.map((q) => (
                <div
                  key={q.q}
                  className="rounded-lg border border-destructive/20 bg-destructive/[0.03] p-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-mono font-semibold text-foreground/70">Q{q.q}</span>
                    <span className="text-foreground/40">{q.subskill}</span>
                    <span className="ml-auto font-mono text-foreground/50">
                      picked {q.given || "—"} &middot; correct {q.correct}
                    </span>
                  </div>
                  <p className="mt-1.5 text-foreground/70">{q.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.notes && <NotesCallout notes={result.notes} />}
      </div>
    </section>
  );
}

function NotesCallout({ notes }: { notes: string }) {
  return (
    <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.05] p-3.5 text-sm flex items-start gap-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" aria-hidden />
      <p className="text-foreground/70">{notes}</p>
    </div>
  );
}
