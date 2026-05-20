/**
 * Partner exam session bootstrap (called from the launch route, NOT a server
 * action). Mirrors `startExamSession` (lib/actions/exam.ts) but:
 *  - skips round/subject enrollment (partner students aren't GATE-enrolled),
 *  - asserts the exam belongs to the launching partner,
 *  - records partner launch context (partnerId / assignment / return URL),
 *  - takes participant + grade directly (the JWT already authenticated).
 */
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exams, examSessions } from "@/lib/db/schema";

export async function startPartnerExamSession(opts: {
  examId: number;
  participantId: number;
  partnerId: number;
  externalAssignmentId?: string | null;
  returnUrl?: string | null;
  grade?: string | null;
}): Promise<{ sessionId: number } | { error: string }> {
  const { examId, participantId, partnerId } = opts;

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: { questions: true },
  });
  if (!exam || !exam.published) return { error: "Exam not available" };
  if (exam.createdByPartnerId !== partnerId) {
    return { error: "Exam not available for this partner" };
  }

  const now = new Date();
  if (exam.windowStart && now < exam.windowStart) {
    return { error: "Exam window has not started" };
  }
  if (exam.windowEnd && now > exam.windowEnd) {
    return { error: "Exam window has closed" };
  }

  // Resume an active session; archive a finished practice attempt; block re-take.
  const existing = await db.query.examSessions.findFirst({
    where: and(
      eq(examSessions.examId, examId),
      eq(examSessions.participantId, participantId),
      sql`${examSessions.archivedAt} IS NULL`,
    ),
  });
  if (existing) {
    if (existing.status === "active") return { sessionId: existing.id };
    if (exam.type === "practice") {
      await db
        .update(examSessions)
        .set({ archivedAt: new Date() })
        .where(eq(examSessions.id, existing.id));
    } else {
      return { error: "You have already completed this exam" };
    }
  }

  // Grade filter (empty question.grades = all grades), shuffle, sample.
  const grade = opts.grade ?? null;
  const gradeFiltered = exam.questions.filter((q) => {
    const qGrades = (q.grades as string[] | null) ?? [];
    return (
      qGrades.length === 0 || (grade !== null && qGrades.includes(grade))
    );
  });

  let questionIds = gradeFiltered.map((q) => q.id);
  if (exam.shuffleQuestions) {
    questionIds = questionIds.sort(() => Math.random() - 0.5);
  }
  if (exam.questionsPerSession && exam.questionsPerSession < questionIds.length) {
    questionIds = questionIds.slice(0, exam.questionsPerSession);
  }
  if (questionIds.length === 0) {
    return { error: "This exam has no questions for the student's grade" };
  }

  const deadlineAt = exam.durationMinutes
    ? new Date(now.getTime() + exam.durationMinutes * 60 * 1000)
    : null;

  const [newSession] = await db
    .insert(examSessions)
    .values({
      examId,
      participantId,
      questionOrder: questionIds,
      deadlineAt,
      partnerId,
      externalAssignmentId: opts.externalAssignmentId ?? null,
      partnerReturnUrl: opts.returnUrl ?? null,
    })
    .returning({ id: examSessions.id });

  return { sessionId: newSession.id };
}
