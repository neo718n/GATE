import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventBadgeResults, type EventBadgeResult } from "@/lib/db/schema";
import {
  MATH_ANSWER_KEYS,
  MATH_CATEGORY_LABEL,
  ENGLISH_ANSWER_KEYS,
  ENGLISH_PAPER_LABEL,
  type MathQuestionKey,
  type EnglishQuestionKey,
} from "@/lib/badges/answer-keys";

export interface PublicEventBadgeResult {
  subject: EventBadgeResult["subject"];
  category: number;
  answers: string[];
  correctCount: number;
  totalQuestions: number;
  pointsEarned: number;
  pointsMax: number;
  award: EventBadgeResult["award"];
  notes: string | null;
}

export function sanitizeResult(row: EventBadgeResult): PublicEventBadgeResult {
  return {
    subject: row.subject,
    category: row.category,
    answers: row.answers,
    correctCount: row.correctCount,
    totalQuestions: row.totalQuestions,
    pointsEarned: row.pointsEarned,
    pointsMax: row.pointsMax,
    award: row.award,
    notes: row.notes,
  };
}

export async function lookupExamResultsForBadge(
  eventBadgeId: number,
): Promise<EventBadgeResult[]> {
  return db
    .select()
    .from(eventBadgeResults)
    .where(eq(eventBadgeResults.eventBadgeId, eventBadgeId));
}

// ────────────────────────────────────────────────────────────────────────────
// Diagnostics — computed at read time by joining a student's given answers
// against the matching static answer key. Nothing here is stored per-student.
// ────────────────────────────────────────────────────────────────────────────

export type QuestionStatus = "correct" | "wrong" | "blank" | "ambiguous";

function classify(given: string, correct: string): QuestionStatus {
  const g = (given || "").trim();
  if (!g) return "blank";
  if (g.includes("/") || g.includes("?")) return "ambiguous";
  return g.toUpperCase() === correct.toUpperCase() ? "correct" : "wrong";
}

export interface MathPerQuestion extends MathQuestionKey {
  given: string;
  status: QuestionStatus;
}

export interface MathDiagnostics {
  subjectLabel: "Mathematics";
  categoryLabel: string;
  perQuestion: MathPerQuestion[];
  domainBreakdown: Array<{
    domain: string;
    domainName: string;
    correct: number;
    total: number;
  }>;
  difficultyBreakdown: Array<{
    difficulty: "Easy" | "Medium" | "Hard";
    correct: number;
    total: number;
  }>;
}

export function computeMathDiagnostics(
  result: PublicEventBadgeResult,
): MathDiagnostics | null {
  const key = MATH_ANSWER_KEYS[result.category as 1 | 2 | 3 | 4 | 5];
  if (!key) return null;

  const perQuestion: MathPerQuestion[] = key.map((k, i) => ({
    ...k,
    given: result.answers[i] ?? "",
    status: classify(result.answers[i] ?? "", k.correct),
  }));

  const domainOrder: string[] = [];
  const domainTally: Record<string, { name: string; correct: number; total: number }> = {};
  for (const pq of perQuestion) {
    if (!domainTally[pq.domain]) {
      domainTally[pq.domain] = { name: pq.domainName, correct: 0, total: 0 };
      domainOrder.push(pq.domain);
    }
    domainTally[pq.domain].total++;
    if (pq.status === "correct") domainTally[pq.domain].correct++;
  }

  const difficultyOrder: Array<"Easy" | "Medium" | "Hard"> = ["Easy", "Medium", "Hard"];
  const difficultyTally: Record<string, { correct: number; total: number }> = {};
  for (const pq of perQuestion) {
    if (!difficultyTally[pq.difficulty]) difficultyTally[pq.difficulty] = { correct: 0, total: 0 };
    difficultyTally[pq.difficulty].total++;
    if (pq.status === "correct") difficultyTally[pq.difficulty].correct++;
  }

  return {
    subjectLabel: "Mathematics",
    categoryLabel: MATH_CATEGORY_LABEL[result.category as 1 | 2 | 3 | 4 | 5] ?? `Category ${result.category}`,
    perQuestion,
    domainBreakdown: domainOrder.map((d) => ({
      domain: d,
      domainName: domainTally[d].name,
      correct: domainTally[d].correct,
      total: domainTally[d].total,
    })),
    difficultyBreakdown: difficultyOrder
      .filter((d) => difficultyTally[d])
      .map((d) => ({ difficulty: d, correct: difficultyTally[d].correct, total: difficultyTally[d].total })),
  };
}

export interface EnglishPerQuestion extends EnglishQuestionKey {
  given: string;
  status: QuestionStatus;
  pointsAwarded: number;
}

export interface EnglishDiagnostics {
  subjectLabel: "English";
  paperLabel: string;
  perQuestion: EnglishPerQuestion[];
  sectionBreakdown: Array<{
    section: "A" | "B" | "C";
    skillLabel: string;
    correct: number;
    total: number;
    pointsEarned: number;
    pointsMax: number;
  }>;
}

const ENGLISH_SECTION_LABEL: Record<"A" | "B" | "C", string> = {
  A: "Grammar",
  B: "Vocabulary",
  C: "Reading",
};

export function computeEnglishDiagnostics(
  result: PublicEventBadgeResult,
): EnglishDiagnostics | null {
  const paperKey = result.category >= 5 ? "cat5" : "cat4";
  const key = ENGLISH_ANSWER_KEYS[paperKey];
  if (!key) return null;

  const perQuestion: EnglishPerQuestion[] = key.map((k, i) => {
    const given = result.answers[i] ?? "";
    const status = classify(given, k.correct);
    return { ...k, given, status, pointsAwarded: status === "correct" ? k.points : 0 };
  });

  const sectionOrder: Array<"A" | "B" | "C"> = ["A", "B", "C"];
  const tally: Record<string, { correct: number; total: number; pointsEarned: number; pointsMax: number }> = {};
  for (const pq of perQuestion) {
    if (!tally[pq.section]) tally[pq.section] = { correct: 0, total: 0, pointsEarned: 0, pointsMax: 0 };
    tally[pq.section].total++;
    tally[pq.section].pointsMax += pq.points;
    if (pq.status === "correct") {
      tally[pq.section].correct++;
      tally[pq.section].pointsEarned += pq.points;
    }
  }

  return {
    subjectLabel: "English",
    paperLabel: ENGLISH_PAPER_LABEL[paperKey],
    perQuestion,
    sectionBreakdown: sectionOrder
      .filter((s) => tally[s])
      .map((s) => ({ section: s, skillLabel: ENGLISH_SECTION_LABEL[s], ...tally[s] })),
  };
}
