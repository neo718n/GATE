import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import type { Award } from "@/lib/db/schema";

// Source: results/Math/Math_Answer_Keys.xlsx (36 photographed paper answer sheets,
// 35 on the original badge roster + 1 unregistered) and
// results/English/English_Answer_Keys.xlsx (2 photographed sheets), scored against
// the official answer keys in lib/badges/answer-keys.ts. Medal tiers confirmed by
// the event organizer 2026-08-22.
//
// "Muhammad Yusuf Xurramov" (Category 2 Math, 15/25 correct, 60/100, Participant)
// was not on the original 55-person badge roster, so he was given a new badge
// (UZB-C-030, seeded in scripts/seed-china-camp-badges.ts on 2026-08-22) purely so
// the QR performance feature can cover him too.

interface SeedRow {
  cardNo: string;
  subject: "math" | "english";
  category: number;
  answers: string[];
  correctCount: number;
  totalQuestions: number;
  pointsEarned: number;
  pointsMax: number;
  award: Award;
  notes: string | null;
}

const results: SeedRow[] = [
  { cardNo: "TJK-C-002", subject: "math", category: 5, answers: ["B", "A", "C", "D", "C", "A", "B", "E", "C", "A", "A", "D", "E", "A", "C", "D", "B", "E", "A", "D", "B", "A", "A", "C", "B"], correctCount: 5, totalQuestions: 25, pointsEarned: 20, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "TJK-C-005", subject: "math", category: 3, answers: ["A", "C", "B", "A", "C", "C", "A", "A", "D", "C", "C", "E", "B", "B", "C", "C", "B", "A", "B", "C", "A", "C", "C", "A", "C"], correctCount: 4, totalQuestions: 25, pointsEarned: 16, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-013", subject: "math", category: 1, answers: ["A", "D", "D", "B", "C", "B", "B", "D", "D", "A", "C", "A", "B", "D", "C", "C", "D", "C", "C", "C", "C", "D", "C", "B", "A"], correctCount: 20, totalQuestions: 25, pointsEarned: 80, pointsMax: 100, award: "silver", notes: null },
  { cardNo: "UZB-C-024", subject: "math", category: 2, answers: ["E", "A", "B", "A", "D", "D", "E", "C", "B", "E", "C", "B", "B", "D", "B", "D", "E", "B", "C", "C", "B", "A", "C", "D", "A"], correctCount: 16, totalQuestions: 25, pointsEarned: 64, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-012", subject: "math", category: 2, answers: ["B", "A", "B", "A", "D", "D", "E", "C", "A", "E", "E", "B", "C", "D", "E", "E", "C", "A", "D", "A", "B", "D", "C", "C", "A"], correctCount: 17, totalQuestions: 25, pointsEarned: 68, pointsMax: 100, award: "bronze", notes: null },
  { cardNo: "UZB-C-020", subject: "math", category: 3, answers: ["C", "A", "D", "B", "C", "C", "E", "D", "A", "D", "B", "E", "C", "C", "B", "D", "C", "A", "A", "C", "D", "B", "E", "D", "B"], correctCount: 20, totalQuestions: 25, pointsEarned: 80, pointsMax: 100, award: "silver", notes: null },
  { cardNo: "TJK-C-006", subject: "math", category: 5, answers: ["D", "B", "B", "B", "", "C", "B", "B", "A", "E", "D", "B", "D", "E", "C", "B", "D", "B", "B", "A", "C", "C", "B", "C", "A"], correctCount: 8, totalQuestions: 25, pointsEarned: 32, pointsMax: 100, award: "bronze", notes: "Q5 left blank" },
  { cardNo: "TJK-C-003", subject: "math", category: 5, answers: ["B", "B/C?", "A", "B", "C", "D", "B", "B", "D", "D", "B", "A", "C", "B", "B", "A", "B", "D", "B", "B", "E", "A", "A/E?", "D", "B"], correctCount: 2, totalQuestions: 25, pointsEarned: 8, pointsMax: 100, award: "participation", notes: "Q2: both B and C filled (double mark) Q23: both A and E filled (double mark)" },
  { cardNo: "TJK-C-007", subject: "math", category: 4, answers: ["", "E", "D", "A", "B", "", "B", "B/C?", "C", "D", "C", "D", "D", "B", "D", "A", "C", "A", "E", "B", "B", "D", "D", "D", "A"], correctCount: 4, totalQuestions: 25, pointsEarned: 16, pointsMax: 100, award: "participation", notes: "Q1: D crossed out, no replacement Q6: C crossed out, no replacement Q8: both B and C checked" },
  { cardNo: "UZB-C-011", subject: "math", category: 2, answers: ["E", "A", "B", "A", "D", "C", "E", "C", "A", "D", "E", "B", "C", "D", "C", "B", "A", "E", "A", "E", "B", "A", "A", "C", "A"], correctCount: 15, totalQuestions: 25, pointsEarned: 60, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-018", subject: "math", category: 3, answers: ["B", "C", "C", "B", "B", "C", "D", "C", "A", "C", "B", "D", "C", "B", "B", "E", "B", "D", "C", "B", "C", "C", "C", "B", "C"], correctCount: 7, totalQuestions: 25, pointsEarned: 28, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-010", subject: "math", category: 3, answers: ["C", "A", "D", "B", "C", "C", "E", "D", "C", "D", "B", "E", "C", "B", "B", "D", "C", "A", "A", "C", "E", "B", "E", "B", "A"], correctCount: 22, totalQuestions: 25, pointsEarned: 88, pointsMax: 100, award: "gold", notes: null },
  { cardNo: "UZB-C-021", subject: "math", category: 1, answers: ["A", "D", "D", "B", "C", "B", "B", "A", "D", "A", "C", "A", "B", "D", "C", "C", "C", "C", "A", "C", "C", "C", "B", "C", "A"], correctCount: 21, totalQuestions: 25, pointsEarned: 84, pointsMax: 100, award: "gold", notes: null },
  { cardNo: "UZB-C-019", subject: "math", category: 2, answers: ["E", "B", "A", "A", "D", "D", "D", "A", "A", "E", "C", "C", "C", "D", "C", "C", "B", "E", "C", "A", "B", "A", "A", "C", "E"], correctCount: 9, totalQuestions: 25, pointsEarned: 36, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-008", subject: "math", category: 3, answers: ["C", "A", "D", "B", "C", "C", "E", "D", "C", "D", "B", "E", "C", "B", "A", "D", "C", "A", "A", "C", "D", "B", "D", "C", "A"], correctCount: 20, totalQuestions: 25, pointsEarned: 80, pointsMax: 100, award: "silver", notes: null },
  { cardNo: "UZB-C-002", subject: "math", category: 3, answers: ["C", "A", "A", "B", "E", "C", "E", "D", "C", "D", "B", "E", "C", "A", "C", "E", "C", "A", "E", "D", "D", "A", "A", "C", "E"], correctCount: 14, totalQuestions: 25, pointsEarned: 56, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-006", subject: "math", category: 2, answers: ["D", "A", "B", "A", "D", "D", "E", "C", "A", "B", "E", "B", "B", "E", "E", "C", "", "A", "B", "B", "B", "B", "C", "B", "E"], correctCount: 14, totalQuestions: 25, pointsEarned: 56, pointsMax: 100, award: "participation", notes: "Q17 left blank" },
  { cardNo: "RUS-C-001", subject: "math", category: 5, answers: ["A", "B", "C", "B", "D", "", "B/C?", "B", "B", "B", "D", "A", "C", "C", "D", "D", "B", "B", "A", "C", "C", "A", "B", "D", "D/E?"], correctCount: 9, totalQuestions: 25, pointsEarned: 36, pointsMax: 100, award: "bronze", notes: "User confirmed 2026-08-21: this is a completed Math submission, Category 5, all 25 questions answered (sheet uses the English-diagnostic template's Section A/B layout, options A-D only, no printed E) Note: Q1,Q6,Q12,Q20 in the Category-5 key are answer E, which this sheet format cannot represent, so those 4 score as wrong regardless of intent Q7 both B and C marked; Q25 D marked plus an extra hand-drawn circled E outside the printed columns roster lists this person (Sulaimonov Okilkhudzha) as Russia, sheet says Tajikistan" },
  { cardNo: "UZB-C-023", subject: "math", category: 2, answers: ["E", "A", "B", "A", "A", "D", "C", "D", "C", "E", "E", "D", "B", "A", "D", "A", "B", "A", "B", "E", "B", "D", "C", "C", "B"], correctCount: 9, totalQuestions: 25, pointsEarned: 36, pointsMax: 100, award: "participation", notes: "sheet's category row was pre-printed with ALL 5 circles filled black (printing defect); actual choice hand-circled around position 2, consistent with grade 4" },
  { cardNo: "UZB-C-025", subject: "math", category: 3, answers: ["C", "A", "E", "B", "C", "C", "E", "D", "C", "D", "B", "E", "A", "B", "A", "D", "A", "A", "A", "D", "D", "C", "E", "D", "B"], correctCount: 16, totalQuestions: 25, pointsEarned: 64, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-004", subject: "math", category: 2, answers: ["E", "A", "B", "A", "D", "D", "E", "C", "A", "D", "E", "B", "B", "D", "C", "B", "A", "E", "D", "D", "B", "D", "A", "B", "B"], correctCount: 19, totalQuestions: 25, pointsEarned: 76, pointsMax: 100, award: "silver", notes: null },
  { cardNo: "UZB-C-017", subject: "math", category: 1, answers: ["A", "C", "A", "B", "B", "B", "B", "B", "D", "A", "B", "A", "C", "D", "B", "D", "A", "B", "B", "C", "C", "B", "C", "A", "C"], correctCount: 12, totalQuestions: 25, pointsEarned: 48, pointsMax: 100, award: "bronze", notes: null },
  { cardNo: "UZB-C-029", subject: "math", category: 1, answers: ["A", "B", "A", "C", "C", "B", "D", "B", "A", "C", "D", "A", "D", "D", "D", "D", "B", "B", "A", "C", "D", "A", "C", "B", "A"], correctCount: 7, totalQuestions: 25, pointsEarned: 28, pointsMax: 100, award: "participation", notes: "Sheet marked with checkmark/slash style inside the circles instead of solid fills - user confirmed 2026-08-21 this is just this student's alternate marking style, not an error; letter read is the one with the mark per row" },
  { cardNo: "UZB-C-003", subject: "math", category: 2, answers: ["E", "A", "B", "A", "D", "D", "E", "C", "B", "D", "A", "B", "B", "A", "E", "B", "C", "A", "B", "B", "B", "D", "C", "B", "B"], correctCount: 18, totalQuestions: 25, pointsEarned: 72, pointsMax: 100, award: "bronze", notes: "Country field says \"Xurshid\" which is a person's name, not a country - likely a form-filling mistake, probably meant Uzbekistan (roster: Musurmonov Behruz = Uzbekistan)" },
  { cardNo: "UZB-C-015", subject: "math", category: 2, answers: ["E", "A", "A", "A", "D", "D", "E", "C", "A", "D", "C", "B", "B", "D", "E", "B", "C", "E", "B", "C", "B", "D", "C", "B", "B"], correctCount: 22, totalQuestions: 25, pointsEarned: 88, pointsMax: 100, award: "gold", notes: null },
  { cardNo: "UZB-C-009", subject: "math", category: 3, answers: ["C", "A", "D", "B", "B", "C", "E", "D", "C", "E", "B", "E", "A", "C", "D", "D", "E", "A", "A", "C", "A", "A", "E", "B", "D"], correctCount: 15, totalQuestions: 25, pointsEarned: 60, pointsMax: 100, award: "participation", notes: "Country field just says \"1\" - not filled in properly, roster confirms Uzbekistan" },
  { cardNo: "UZB-C-028", subject: "math", category: 5, answers: ["C", "A", "D", "B", "E", "B", "E", "A", "C", "A", "E", "D", "C", "D", "A", "B", "E", "C", "B", "A", "D", "C", "E", "B", "A"], correctCount: 3, totalQuestions: 25, pointsEarned: 12, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-005", subject: "math", category: 3, answers: ["C", "A", "D", "B", "B", "C", "E", "D", "A", "D", "B", "E", "C", "D", "D", "D", "C", "A", "A", "A", "C", "B", "A", "B", "C"], correctCount: 18, totalQuestions: 25, pointsEarned: 72, pointsMax: 100, award: "bronze", notes: null },
  { cardNo: "UZB-C-014", subject: "math", category: 2, answers: ["E", "A", "B", "A", "D", "D", "E", "C", "A", "D", "C", "B", "B", "D", "E", "B", "C", "E", "D", "C", "B", "D", "C", "B", "A"], correctCount: 25, totalQuestions: 25, pointsEarned: 100, pointsMax: 100, award: "gold", notes: null },
  { cardNo: "UZB-C-007", subject: "math", category: 3, answers: ["D", "A", "D", "B", "E", "C", "E", "D", "C", "D", "B", "E", "B", "A", "A", "D", "A", "A", "A", "C", "D", "B", "E", "C", "C"], correctCount: 16, totalQuestions: 25, pointsEarned: 64, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-026", subject: "math", category: 2, answers: ["E", "A", "B", "A", "D", "D", "E", "C", "A", "D", "C", "B", "B", "D", "E", "B", "C", "A", "B", "C", "B", "D", "A", "E", "D"], correctCount: 20, totalQuestions: 25, pointsEarned: 80, pointsMax: 100, award: "silver", notes: null },
  { cardNo: "UZB-C-001", subject: "math", category: 2, answers: ["E", "A", "B", "A", "D", "D", "E", "C", "A", "C", "A", "B", "B", "E", "E", "E", "A", "E", "E", "E", "B", "D", "A", "B", "C"], correctCount: 16, totalQuestions: 25, pointsEarned: 64, pointsMax: 100, award: "participation", notes: null },
  { cardNo: "UZB-C-016", subject: "math", category: 5, answers: ["B", "C", "B", "D", "D", "E", "B", "B", "B", "C", "E", "E", "B", "A", "D", "A", "D", "B", "A", "D", "C", "C", "C", "A", "E"], correctCount: 14, totalQuestions: 25, pointsEarned: 56, pointsMax: 100, award: "silver", notes: null },
  { cardNo: "UZB-C-027", subject: "math", category: 1, answers: ["A", "B", "D", "D", "C", "B", "C", "A", "D", "A", "D", "D", "C", "C", "C", "C", "B", "A", "A", "B", "C", "B", "B", "C", "A"], correctCount: 10, totalQuestions: 25, pointsEarned: 40, pointsMax: 100, award: "bronze", notes: null },
  { cardNo: "UZB-C-022", subject: "math", category: 1, answers: ["A", "B", "C", "B", "C", "B", "B", "D", "D", "A", "C", "C", "B", "D", "B", "B", "C", "D", "A", "C", "C", "D", "B", "B", "C"], correctCount: 12, totalQuestions: 25, pointsEarned: 48, pointsMax: 100, award: "bronze", notes: null },
  { cardNo: "UZB-C-030", subject: "math", category: 2, answers: ["E", "A", "A", "A", "D", "D", "E", "C", "A", "C", "E", "B", "B", "B", "D", "B", "A", "A", "B", "E", "B", "D", "C", "E", "A"], correctCount: 15, totalQuestions: 25, pointsEarned: 60, pointsMax: 100, award: "participation", notes: "Not on the original 55-person badge roster — genuine extra/unregistered contestant, given badge UZB-C-030 post-event so this feature could cover him." },
  { cardNo: "TJK-C-004", subject: "english", category: 5, answers: ["C", "B", "B", "B", "A", "C", "B", "A", "D", "D", "D", "A", "C", "D", "D", "B", "B", "B", "D", "B", "C", "D", "D", "A", "A", "B", "B/D?", "", "C", "C", "A", "B", "C", "D", "B", "D", "B", "C", "B", "A"], correctCount: 8, totalQuestions: 40, pointsEarned: 22, pointsMax: 117, award: "participation", notes: "Sheet was already hand-graded by an examiner (score of 25/117 written on it); this independent re-score against the official key gives 22/117 — a small gap most likely from one double-circled and one blank answer that are genuinely ambiguous on the original sheet." },
  { cardNo: "TJK-C-001", subject: "english", category: 4, answers: ["C", "C", "B", "B", "B", "B", "A", "B", "A", "D", "B", "A", "B", "B", "D", "C", "D", "B", "A", "C", "A", "B", "B", "B", "B", "D", "B", "A", "B", "A", "A", "C", "B", "B", "B", "B", "B", "B", "C", "D"], correctCount: 24, totalQuestions: 40, pointsEarned: 49, pointsMax: 83, award: "bronze", notes: "Category bubble on the sheet was marked 5 then crossed out; grade (8) matches Category 4, so scored against the Category 4 Entry Diagnostic paper. That paper's own printed point values sum to 83, two points above the 81 its summary table states as the maximum." },
];

async function main() {
  const { db } = await import("@/lib/db");
  const { eventBadges, eventBadgeResults } = await import("@/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");

  console.log(`→ Seeding ${results.length} China Camp 2026 contest result(s)…`);

  let inserted = 0;
  let skipped = 0;
  let missingBadge = 0;

  for (const row of results) {
    const [badge] = await db
      .select({ id: eventBadges.id })
      .from(eventBadges)
      .where(eq(eventBadges.cardNo, row.cardNo))
      .limit(1);

    if (!badge) {
      console.log(`  ✗ ${row.cardNo} has no event badge — skipping (seed eventBadges first)`);
      missingBadge++;
      continue;
    }

    const [existing] = await db
      .select({ id: eventBadgeResults.id })
      .from(eventBadgeResults)
      .where(
        and(
          eq(eventBadgeResults.eventBadgeId, badge.id),
          eq(eventBadgeResults.subject, row.subject),
        ),
      )
      .limit(1);

    if (existing) {
      console.log(`  · ${row.cardNo} (${row.subject}) already exists, skipping`);
      skipped++;
      continue;
    }

    await db.insert(eventBadgeResults).values({
      eventBadgeId: badge.id,
      subject: row.subject,
      category: row.category,
      answers: row.answers,
      correctCount: row.correctCount,
      totalQuestions: row.totalQuestions,
      pointsEarned: row.pointsEarned,
      pointsMax: row.pointsMax,
      award: row.award,
      notes: row.notes,
    });
    console.log(`  ✓ ${row.cardNo} (${row.subject}) → ${row.correctCount}/${row.totalQuestions}, ${row.award}`);
    inserted++;
  }

  console.log(
    `\nDone. Inserted: ${inserted}, skipped (already existed): ${skipped}, missing badge: ${missingBadge}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
