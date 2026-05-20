"use server";

/**
 * Partner-scoped exam authoring (exam_partner role). Each action verifies the
 * target exam belongs to the caller's tenant via {@link assertPartnerExamOwnership}.
 * Mirrors the admin exam/question CRUD but writes `createdByPartnerId`.
 */
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePartnerStaff } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { exams, questions, examAnswers } from "@/lib/db/schema";

type QuestionType = "mcq" | "numeric" | "open";
type ExamType = "exam" | "practice";

async function assertPartnerExamOwnership(examId: number, partnerId: number) {
  const exam = await db.query.exams.findFirst({ where: eq(exams.id, examId) });
  if (!exam) throw new Error("Exam not found");
  if (exam.createdByPartnerId !== partnerId) {
    throw new Error("You do not have access to this exam");
  }
  return exam;
}

export async function createPartnerExam(input: {
  title: string;
  type?: ExamType;
  durationMinutes?: number | null;
  shuffleQuestions?: boolean;
  questionsPerSession?: number | null;
  instructions?: string | null;
}): Promise<{ examId: number }> {
  const { session, partnerId } = await requirePartnerStaff();
  const title = input.title?.trim();
  if (!title) throw new Error("Title is required");

  const [exam] = await db
    .insert(exams)
    .values({
      title,
      type: input.type === "practice" ? "practice" : "exam",
      createdByPartnerId: partnerId,
      createdByUserId: session.user.id,
      durationMinutes: input.durationMinutes ?? null,
      shuffleQuestions: input.shuffleQuestions ?? true,
      questionsPerSession: input.questionsPerSession ?? null,
      instructions: input.instructions?.trim() || null,
    })
    .returning({ id: exams.id });

  await writeAuditLog(session.user.id, "partner_create_exam", "exam", exam.id, {
    partnerId,
    title,
  });
  revalidatePath("/examPartner/exams");
  return { examId: exam.id };
}

export async function updatePartnerExam(input: {
  examId: number;
  title?: string;
  type?: ExamType;
  durationMinutes?: number | null;
  windowStart?: string | null;
  windowEnd?: string | null;
  shuffleQuestions?: boolean;
  questionsPerSession?: number | null;
  instructions?: string | null;
  targetGrades?: string[];
}) {
  const { partnerId } = await requirePartnerStaff();
  await assertPartnerExamOwnership(input.examId, partnerId);

  const set: Partial<typeof exams.$inferInsert> = { updatedAt: new Date() };
  if (input.title !== undefined) {
    const t = input.title.trim();
    if (!t) throw new Error("Title is required");
    set.title = t;
  }
  if (input.type !== undefined) {
    set.type = input.type === "practice" ? "practice" : "exam";
  }
  if (input.durationMinutes !== undefined) set.durationMinutes = input.durationMinutes;
  if (input.windowStart !== undefined) {
    set.windowStart = input.windowStart ? new Date(input.windowStart) : null;
  }
  if (input.windowEnd !== undefined) {
    set.windowEnd = input.windowEnd ? new Date(input.windowEnd) : null;
  }
  if (input.shuffleQuestions !== undefined) set.shuffleQuestions = input.shuffleQuestions;
  if (input.questionsPerSession !== undefined) {
    set.questionsPerSession = input.questionsPerSession;
  }
  if (input.instructions !== undefined) {
    set.instructions = input.instructions?.trim() || null;
  }
  if (input.targetGrades !== undefined) set.targetGrades = input.targetGrades;

  await db.update(exams).set(set).where(eq(exams.id, input.examId));
  revalidatePath(`/examPartner/exams/${input.examId}`);
  revalidatePath("/examPartner/exams");
}

export async function togglePublishPartnerExam(examId: number) {
  const { partnerId } = await requirePartnerStaff();
  const exam = await assertPartnerExamOwnership(examId, partnerId);
  await db
    .update(exams)
    .set({ published: !exam.published, updatedAt: new Date() })
    .where(eq(exams.id, examId));
  revalidatePath(`/examPartner/exams/${examId}`);
  revalidatePath("/examPartner/exams");
}

export async function deletePartnerExam(examId: number) {
  const { session, partnerId } = await requirePartnerStaff();
  await assertPartnerExamOwnership(examId, partnerId);
  await db.delete(exams).where(eq(exams.id, examId));
  await writeAuditLog(session.user.id, "partner_delete_exam", "exam", examId, {
    partnerId,
  });
  revalidatePath("/examPartner/exams");
}

export async function createPartnerQuestion(input: {
  examId: number;
  type: QuestionType;
  content: string;
  options?: { id: string; text: string }[] | null;
  correctAnswer?: string | null;
  points?: number;
  explanation?: string | null;
  grades?: string[];
  difficulty?: string | null;
}) {
  const { partnerId } = await requirePartnerStaff();
  await assertPartnerExamOwnership(input.examId, partnerId);
  const content = input.content?.trim();
  if (!content) throw new Error("Question content is required");

  const existing = await db.query.questions.findMany({
    where: eq(questions.examId, input.examId),
  });
  const maxOrder = existing.reduce((m, q) => Math.max(m, q.order), -1);

  await db.insert(questions).values({
    examId: input.examId,
    type: input.type,
    content,
    options: input.type === "mcq" ? (input.options ?? null) : null,
    correctAnswer: input.correctAnswer ?? null,
    points: input.points ?? 1,
    explanation: input.explanation?.trim() || null,
    grades: input.grades ?? [],
    difficulty: input.difficulty?.trim() || null,
    order: maxOrder + 1,
  });
  revalidatePath(`/examPartner/exams/${input.examId}`);
}

export async function deletePartnerQuestion(input: {
  examId: number;
  questionId: number;
}) {
  const { partnerId } = await requirePartnerStaff();
  await assertPartnerExamOwnership(input.examId, partnerId);

  const answered = await db.query.examAnswers.findFirst({
    where: eq(examAnswers.questionId, input.questionId),
  });
  if (answered) {
    throw new Error("A student has answered this question — it cannot be deleted");
  }
  await db
    .delete(questions)
    .where(
      and(eq(questions.id, input.questionId), eq(questions.examId, input.examId)),
    );
  revalidatePath(`/examPartner/exams/${input.examId}`);
}

/**
 * P4: clone selected pool questions into one of the partner's exams. Copies the
 * full question (incl. correctAnswer) into new rows with a fresh order.
 */
export async function bulkCloneQuestionsToExam(input: {
  targetExamId: number;
  questionIds: number[];
}): Promise<{ added: number }> {
  const { session, partnerId } = await requirePartnerStaff();
  await assertPartnerExamOwnership(input.targetExamId, partnerId);
  if (input.questionIds.length === 0) return { added: 0 };

  const source = await db
    .select()
    .from(questions)
    .where(inArray(questions.id, input.questionIds));
  if (source.length === 0) return { added: 0 };

  const existing = await db.query.questions.findMany({
    where: eq(questions.examId, input.targetExamId),
  });
  let order = existing.reduce((m, q) => Math.max(m, q.order), -1);

  await db.insert(questions).values(
    source.map((q) => ({
      examId: input.targetExamId,
      type: q.type,
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      tolerance: q.tolerance,
      grades: q.grades,
      points: q.points,
      explanation: q.explanation,
      tags: q.tags,
      difficulty: q.difficulty,
      order: ++order,
    })),
  );

  await writeAuditLog(
    session.user.id,
    "partner_clone_questions",
    "exam",
    input.targetExamId,
    { partnerId, count: source.length },
  );
  revalidatePath(`/examPartner/exams/${input.targetExamId}`);
  return { added: source.length };
}
