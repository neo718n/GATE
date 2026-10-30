// Turns one contestant's graded answers into the content of the downloadable
// Diagnostic Report PDF: skill profile, strengths / growth areas, plain-English
// insights, a question-by-question review, and a 4-week study plan with
// curated resources. Pure functions only — rendering lives in
// components/verify/diagnostic-report-pdf.tsx.

import { AWARD_LABELS } from "@/lib/awards";
import {
  computeEnglishDiagnostics,
  computeMathDiagnostics,
  type PublicEventBadgeResult,
  type QuestionStatus,
} from "@/lib/badges/results";
import {
  ENGLISH_GENERAL_PRACTICE,
  ENGLISH_RESOURCES,
  MATH_CONTEST_PRACTICE,
  MATH_RESOURCES,
  mathBandFor,
  type EnglishPaper,
  type MathDomain,
  type StudyResource,
} from "@/lib/badges/study-resources";

const STRONG_PCT = 70;
const GROWTH_PCT = 60;
const MAX_GROWTH_AREAS = 3;
const CEFR_ORDER = ["A2", "A2+", "B1", "B2", "C1", "C2"] as const;

export interface SkillRow {
  key: string;
  label: string;
  correct: number;
  total: number;
  pct: number;
}

export interface GrowthArea extends SkillRow {
  missedQuestions: number[];
  resources: StudyResource[];
}

export interface ReviewRow {
  q: number;
  topic: string;
  level: string;
  given: string;
  correct: string;
  status: QuestionStatus;
  note: string;
}

export interface PlanWeek {
  week: number;
  focus: string;
  tasks: string[];
}

export interface SubjectReport {
  subject: "math" | "english";
  subjectLabel: string;
  paperLabel: string;
  pointsEarned: number;
  pointsMax: number;
  correctCount: number;
  totalQuestions: number;
  pct: number;
  awardLabel: string;
  skills: SkillRow[];
  skillsTitle: string;
  levels: SkillRow[];
  levelsTitle: string;
  strengths: SkillRow[];
  growth: GrowthArea[];
  insights: string[];
  cefrSecure: string | null;
  review: ReviewRow[];
  plan: PlanWeek[];
  extraResources: StudyResource[];
  notes: string | null;
}

function pct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function row(key: string, label: string, correct: number, total: number): SkillRow {
  return { key, label, correct, total, pct: pct(correct, total) };
}

// Answer-key notes were written for the web page and carry a few characters
// the PDF's built-in (WinAnsi) fonts can't draw.
export function pdfText(s: string): string {
  return s
    .replace(/^CEILING ITEM:\s*/i, "")
    .replace(/&times;/g, "×")
    .replace(/→/g, "–")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

// Growth areas are picked first; an area is never listed as both a strength
// and a focus area (possible when every area clears the bar and the lowest
// one is kept as the "next stretch").
function pickStrengths(skills: SkillRow[], growth: SkillRow[]): SkillRow[] {
  const pool = skills.filter((s) => !growth.some((g) => g.key === s.key));
  const strong = pool.filter((s) => s.total >= 2 && s.pct >= STRONG_PCT).sort((a, b) => b.pct - a.pct);
  if (strong.length > 0) return strong.slice(0, 3);
  const best = [...pool].sort((a, b) => b.pct - a.pct)[0];
  return best && best.correct > 0 ? [best] : [];
}

function pickGrowth(skills: SkillRow[]): SkillRow[] {
  const weak = skills.filter((s) => s.pct < GROWTH_PCT).sort((a, b) => a.pct - b.pct || b.total - a.total);
  if (weak.length > 0) return weak.slice(0, MAX_GROWTH_AREAS);
  // Everything is above the bar — still name the lowest area as the next stretch.
  const lowest = [...skills].sort((a, b) => a.pct - b.pct)[0];
  return lowest ? [lowest] : [];
}

function answerHabitInsights(statuses: QuestionStatus[]): string[] {
  const out: string[] = [];
  const blank = statuses.filter((s) => s === "blank").length;
  const ambiguous = statuses.filter((s) => s === "ambiguous").length;
  if (blank > 0) {
    out.push(
      `${blank} question${blank > 1 ? "s were" : " was"} left blank. Practise full papers against the clock so every question gets at least a reasoned attempt.`,
    );
  }
  if (ambiguous > 0) {
    out.push(
      `${ambiguous} answer${ambiguous > 1 ? "s were" : " was"} marked unclearly (more than one option or a question mark) and could not be credited. Always mark one clear final answer.`,
    );
  }
  return out;
}

function uniqueResources(list: StudyResource[]): StudyResource[] {
  const seen = new Set<string>();
  return list.filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)));
}

function buildPlan(growth: GrowthArea[], subject: "math" | "english", finalResources: StudyResource[]): PlanWeek[] {
  const weeks: PlanWeek[] = [];
  const areas = growth.length > 0 ? growth : [];

  for (let i = 0; i < 2; i++) {
    const area = areas[i] ?? areas[0];
    if (!area) break;
    const [primary, secondary] = area.resources;
    weeks.push({
      week: i + 1,
      focus: area.label,
      tasks: [
        `Re-attempt question${area.missedQuestions.length > 1 ? "s" : ""} ${area.missedQuestions.map((q) => `Q${q}`).join(", ")} without looking at the answer, then compare with the review table.`,
        primary ? `Work through "${primary.title}" (${primary.provider}) — 20-30 minutes a day, 5 days.` : "",
        secondary ? `Consolidate with "${secondary.title}" (${secondary.provider}) at the end of the week.` : "",
      ].filter(Boolean),
    });
  }

  const third = areas[2];
  weeks.push(
    third
      ? {
          week: 3,
          focus: third.label,
          tasks: [
            `Re-attempt ${third.missedQuestions.map((q) => `Q${q}`).join(", ")} and write down the step you got stuck on.`,
            third.resources[0] ? `Practise with "${third.resources[0].title}" (${third.resources[0].provider}).` : "",
            "Revisit the Week 1 topic for 15 minutes to keep it fresh.",
          ].filter(Boolean),
        }
      : {
          week: 3,
          focus: subject === "math" ? "Harder problems" : "Stretch level",
          tasks: [
            subject === "math"
              ? "Pick 3 problems a day one level above your comfort zone; spend at least 10 minutes on each before checking."
              : "Read one text a day at the next CEFR level and note 5 new words or structures.",
            "Revisit Weeks 1-2 topics for 15 minutes each.",
          ],
        },
  );

  weeks.push({
    week: 4,
    focus: "Timed practice & review",
    tasks: [
      finalResources[0]
        ? `Sit one full timed paper from "${finalResources[0].title}" (${finalResources[0].provider}).`
        : "Sit one full timed practice paper.",
      "Mark it, then sort every mistake: concept gap, careless slip, or ran out of time.",
      "Redo the whole GATE paper section you found hardest and compare with this report.",
    ],
  });

  return weeks;
}

function buildMathReport(result: PublicEventBadgeResult): SubjectReport | null {
  const diag = computeMathDiagnostics(result);
  if (!diag) return null;
  const band = mathBandFor(result.category);

  const skills = diag.domainBreakdown.map((d) => row(d.domain, d.domainName, d.correct, d.total));
  const levels = diag.difficultyBreakdown.map((d) => row(d.difficulty, d.difficulty, d.correct, d.total));
  const growth: GrowthArea[] = pickGrowth(skills).map((s) => ({
    ...s,
    missedQuestions: diag.perQuestion.filter((q) => q.domain === s.key && q.status !== "correct").map((q) => q.q),
    resources: MATH_RESOURCES[s.key as MathDomain]?.[band] ?? [],
  }));

  const insights: string[] = [];
  const byDiff = Object.fromEntries(levels.map((l) => [l.key, l]));
  const easy = byDiff.Easy;
  const medium = byDiff.Medium;
  const hard = byDiff.Hard;
  if (easy && easy.pct < 80) {
    insights.push(
      `Easy questions scored ${easy.pct}%. These are the cheapest marks on the paper — slow down and double-check them before moving on.`,
    );
  }
  if (medium && hard) {
    if (medium.pct >= 60 && hard.pct < 40) {
      insights.push(
        `Medium questions are solid (${medium.pct}%) but Hard ones drop to ${hard.pct}%. The next step is multi-step problems — practise writing out each step instead of solving in your head.`,
      );
    } else if (hard.pct >= 50) {
      insights.push(
        `${hard.pct}% on Hard questions is a strong result — you are ready for regular olympiad-level practice.`,
      );
    } else if (medium.pct < 50) {
      insights.push(
        `Medium questions scored ${medium.pct}%. Strengthen the core methods in your growth areas before moving on to the hardest problems.`,
      );
    }
  }
  insights.push(...answerHabitInsights(diag.perQuestion.map((q) => q.status)));

  const extraResources = MATH_CONTEST_PRACTICE[band];
  return {
    subject: "math",
    subjectLabel: "Mathematics",
    paperLabel: diag.categoryLabel,
    pointsEarned: result.pointsEarned,
    pointsMax: result.pointsMax,
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    pct: pct(result.pointsEarned, result.pointsMax),
    awardLabel: AWARD_LABELS[result.award],
    skills,
    skillsTitle: "By Skill Area",
    levels,
    levelsTitle: "By Difficulty",
    strengths: pickStrengths(skills, growth),
    growth,
    insights,
    cefrSecure: null,
    review: diag.perQuestion.map((q) => ({
      q: q.q,
      topic: q.domainName,
      level: q.difficulty,
      given: q.given,
      correct: q.correct,
      status: q.status,
      note: pdfText(q.note),
    })),
    plan: buildPlan(growth, "math", extraResources),
    extraResources,
    notes: result.notes,
  };
}

// "Reading — Main Idea" → "Main Idea"; strips the internal "— CEILING ITEM" tag.
function cleanSubskill(s: string): string {
  return pdfText(s.replace(/\s*—\s*CEILING ITEM/i, "").replace(/^Reading\s*—\s*/, ""));
}

function buildEnglishReport(result: PublicEventBadgeResult): SubjectReport | null {
  const diag = computeEnglishDiagnostics(result);
  if (!diag) return null;
  const paper: EnglishPaper = result.category >= 5 ? "cat5" : "cat4";

  const skills = diag.sectionBreakdown.map((s) => row(s.section, s.skillLabel, s.correct, s.total));

  const levelTally = new Map<string, { correct: number; total: number }>();
  for (const q of diag.perQuestion) {
    const t = levelTally.get(q.level) ?? { correct: 0, total: 0 };
    t.total++;
    if (q.status === "correct") t.correct++;
    levelTally.set(q.level, t);
  }
  const levels = CEFR_ORDER.filter((l) => levelTally.has(l)).map((l) =>
    row(l, `CEFR ${l}`, levelTally.get(l)!.correct, levelTally.get(l)!.total),
  );

  // Highest CEFR level reached with every level up to it at ≥60%.
  let cefrSecure: string | null = null;
  for (const l of levels) {
    if (l.pct >= GROWTH_PCT) cefrSecure = l.key;
    else break;
  }

  const growth: GrowthArea[] = pickGrowth(skills).map((s) => ({
    ...s,
    missedQuestions: diag.perQuestion.filter((q) => q.section === s.key && q.status !== "correct").map((q) => q.q),
    resources: ENGLISH_RESOURCES[s.key as "A" | "B" | "C"][paper],
  }));

  const insights: string[] = [];
  if (cefrSecure) {
    const next = levels[levels.findIndex((l) => l.key === cefrSecure) + 1];
    insights.push(
      next
        ? `Working securely at ${cefrSecure} level. Questions at ${next.key} scored ${next.pct}% — that is your next target level.`
        : `Secure across every level on this paper, up to ${cefrSecure}. Excellent — aim for authentic, unsimplified English texts.`,
    );
  } else if (levels[0]) {
    insights.push(
      `The entry level on this paper (${levels[0].key}) scored ${levels[0].pct}%. Rebuild the basics at this level before moving up — steady daily practice works best.`,
    );
  }
  const missedSub = diag.perQuestion.filter((q) => q.status !== "correct").slice(0, 4).map((q) => cleanSubskill(q.subskill));
  if (missedSub.length > 0) {
    insights.push(`Specific points to revise: ${missedSub.join("; ")}.`);
  }
  insights.push(...answerHabitInsights(diag.perQuestion.map((q) => q.status)));

  const extraResources = ENGLISH_GENERAL_PRACTICE[paper];
  return {
    subject: "english",
    subjectLabel: "English",
    paperLabel: pdfText(diag.paperLabel),
    pointsEarned: result.pointsEarned,
    pointsMax: result.pointsMax,
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    pct: pct(result.pointsEarned, result.pointsMax),
    awardLabel: AWARD_LABELS[result.award],
    skills,
    skillsTitle: "By Section",
    levels,
    levelsTitle: "By CEFR Level",
    strengths: pickStrengths(skills, growth),
    growth,
    insights,
    cefrSecure,
    review: diag.perQuestion.map((q) => ({
      q: q.q,
      topic: cleanSubskill(q.subskill),
      level: q.level,
      given: q.given,
      correct: q.correct,
      status: q.status,
      note: pdfText(q.note),
    })),
    plan: buildPlan(growth, "english", extraResources),
    extraResources,
    notes: result.notes,
  };
}

export function buildSubjectReports(results: PublicEventBadgeResult[]): SubjectReport[] {
  return results
    .map((r) => (r.subject === "math" ? buildMathReport(r) : buildEnglishReport(r)))
    .filter((r): r is SubjectReport => r !== null);
}

export function allResources(report: SubjectReport): StudyResource[] {
  return uniqueResources([...report.growth.flatMap((g) => g.resources), ...report.extraResources]);
}
