import { AlertTriangle, FileText, MapPin } from "lucide-react";
import type { PublicEventBadgeResult } from "@/lib/badges/results";
import {
  computeMathDiagnostics,
  computeEnglishDiagnostics,
  type QuestionStatus,
} from "@/lib/badges/results";
import { AWARD_LABELS, AWARD_CLASSES } from "@/lib/awards";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { PrintButton } from "./print-button";
import { DownloadReportButton } from "./download-report-button";
import { getLocale } from "@/lib/i18n/server";

const T = {
  en: {
    performance: "Contest Performance",
    official: "Official Diagnostic Report",
    officialLead: "A personal PDF with your skill profile, every question reviewed, a 4-week study plan and hand-picked learning resources.",
    correctOf: (c: number, n: number) => `${c}/${n} correct`,
    math: "Mathematics",
    english: "English",
    allQuestions: (n: number) => `All ${n} Questions`,
    byDifficulty: "By Difficulty",
    bySkill: "By Skill Area",
    bySection: "By Section",
    pts: "pts",
    review: "Questions To Review",
    picked: (g: string, c: string) => `picked ${g} · correct ${c}`,
  },
  ru: {
    performance: "Результаты диагностики",
    official: "Официальный диагностический отчёт",
    officialLead: "Персональный PDF: профиль навыков, разбор каждого вопроса, план занятий на 4 недели и подобранные материалы для подготовки (на английском языке).",
    correctOf: (c: number, n: number) => `Верно: ${c} из ${n}`,
    math: "Математика",
    english: "Английский язык",
    allQuestions: (n: number) => `Все вопросы (${n})`,
    byDifficulty: "По сложности",
    bySkill: "По темам",
    bySection: "По разделам",
    pts: "б.",
    review: "Вопросы для разбора",
    picked: (g: string, c: string) => `ответ ${g} · верно ${c}`,
  },
};

type Dict = (typeof T)["en"];

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

export async function PerformanceReport({ fullName, country, cardNo, results }: Props) {
  const t = T[await getLocale()];
  return (
    <article className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
            {t.performance}
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

      <div className="rounded-2xl border border-gate-gold/30 bg-gradient-to-br from-gate-gold/[0.07] via-transparent to-transparent p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between print:hidden">
        <div className="flex items-start gap-3.5">
          <div
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gate-gold/15 text-gate-gold"
          >
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-foreground leading-tight">
              {t.official}
            </p>
            <p className="mt-1 text-sm text-foreground/60 max-w-md">
              {t.officialLead}
            </p>
          </div>
        </div>
        <DownloadReportButton cardNo={cardNo} />
      </div>

      {results.map((r) =>
        r.subject === "math" ? (
          <MathSection key={r.subject} result={r} t={t} />
        ) : (
          <EnglishSection key={r.subject} result={r} t={t} />
        ),
      )}

      <div className="flex items-center justify-center gap-5 pt-4 border-t border-border">
        <ThemeAwareLogo size="xs" showTagline={false} />
      </div>
    </article>
  );
}

function ScoreBadge({ result, t }: { result: PublicEventBadgeResult; t: Dict }) {
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
          {t.correctOf(result.correctCount, result.totalQuestions)}
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

function MathSection({ result, t }: { result: PublicEventBadgeResult; t: Dict }) {
  const diag = computeMathDiagnostics(result);
  if (!diag) return null;
  const misses = diag.perQuestion.filter((q) => q.status !== "correct");

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 py-5 border-b border-border bg-foreground/[0.015] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gate-gold">
            {t.math}
          </p>
          <p className="mt-0.5 text-sm text-foreground/60">{diag.categoryLabel}</p>
        </div>
        <ScoreBadge result={result} t={t} />
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            {t.allQuestions(25)}
          </p>
          <QuestionGrid statuses={diag.perQuestion.map((q) => q.status)} />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            {t.byDifficulty}
          </p>
          <div className="space-y-3">
            {diag.difficultyBreakdown.map((d) => (
              <Bar key={d.difficulty} label={d.difficulty} correct={d.correct} total={d.total} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            {t.bySkill}
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
              {t.review}
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
                      {t.picked(q.given || "—", String(q.correct))}
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

function EnglishSection({ result, t }: { result: PublicEventBadgeResult; t: Dict }) {
  const diag = computeEnglishDiagnostics(result);
  if (!diag) return null;
  const misses = diag.perQuestion.filter((q) => q.status !== "correct");

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 py-5 border-b border-border bg-foreground/[0.015] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gate-gold">
            {t.english}
          </p>
          <p className="mt-0.5 text-sm text-foreground/60">{diag.paperLabel}</p>
        </div>
        <ScoreBadge result={result} t={t} />
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            {t.allQuestions(diag.perQuestion.length)}
          </p>
          <QuestionGrid statuses={diag.perQuestion.map((q) => q.status)} />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
            {t.bySection}
          </p>
          <div className="space-y-3">
            {diag.sectionBreakdown.map((s) => (
              <Bar
                key={s.section}
                label={`${s.skillLabel} (${s.pointsEarned}/${s.pointsMax} ${t.pts})`}
                correct={s.correct}
                total={s.total}
              />
            ))}
          </div>
        </div>

        {misses.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 mb-3">
              {t.review}
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
                      {t.picked(q.given || "—", String(q.correct))}
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
