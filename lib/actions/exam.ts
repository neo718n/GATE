"use server";

import { db } from "@/lib/db";
import { exams, questions, examSessions, examAnswers, subjects, rounds } from "@/lib/db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Admin: Exam CRUD ─────────────────────────────────────────────────────────

export async function createExam(formData: FormData) {
  await requireRole(["admin", "super_admin"]);

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string) as "exam" | "practice";
  const subjectId = formData.get("subjectId") ? parseInt(formData.get("subjectId") as string) : null;
  const roundId = formData.get("roundId") ? parseInt(formData.get("roundId") as string) : null;
  const durationMinutes = formData.get("durationMinutes") ? parseInt(formData.get("durationMinutes") as string) : null;
  const windowStart = formData.get("windowStart") ? new Date(formData.get("windowStart") as string) : null;
  const windowEnd = formData.get("windowEnd") ? new Date(formData.get("windowEnd") as string) : null;
  const shuffleQuestions = formData.get("shuffleQuestions") === "on";
  const questionsPerSession = formData.get("questionsPerSession") ? parseInt(formData.get("questionsPerSession") as string) : null;
  const instructions = (formData.get("instructions") as string)?.trim() || null;

  if (!title) throw new Error("Title is required");

  const [exam] = await db.insert(exams).values({
    title,
    type: type === "practice" ? "practice" : "exam",
    subjectId,
    roundId,
    durationMinutes,
    windowStart,
    windowEnd,
    shuffleQuestions,
    questionsPerSession,
    instructions,
  }).returning({ id: exams.id });

  revalidatePath("/admin/exams");
  redirect(`/admin/exams/${exam.id}`);
}

export async function updateExam(examId: number, formData: FormData) {
  await requireRole(["admin", "super_admin"]);

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string) as "exam" | "practice";
  const subjectId = formData.get("subjectId") ? parseInt(formData.get("subjectId") as string) : null;
  const roundId = formData.get("roundId") ? parseInt(formData.get("roundId") as string) : null;
  const durationMinutes = formData.get("durationMinutes") ? parseInt(formData.get("durationMinutes") as string) : null;
  const windowStart = formData.get("windowStart") ? new Date(formData.get("windowStart") as string) : null;
  const windowEnd = formData.get("windowEnd") ? new Date(formData.get("windowEnd") as string) : null;
  const shuffleQuestions = formData.get("shuffleQuestions") === "on";
  const questionsPerSession = formData.get("questionsPerSession") ? parseInt(formData.get("questionsPerSession") as string) : null;
  const instructions = (formData.get("instructions") as string)?.trim() || null;

  if (!title) throw new Error("Title is required");

  await db.update(exams).set({
    title,
    type: type === "practice" ? "practice" : "exam",
    subjectId,
    roundId,
    durationMinutes,
    windowStart,
    windowEnd,
    shuffleQuestions,
    questionsPerSession,
    instructions,
    updatedAt: new Date(),
  }).where(eq(exams.id, examId));

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/exams");
}

export async function togglePublishExam(formData: FormData) {
  await requireRole(["admin", "super_admin"]);
  const examId = parseInt(formData.get("examId") as string);
  const published = formData.get("published") === "true";

  await db.update(exams).set({ published: !published, updatedAt: new Date() }).where(eq(exams.id, examId));

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/exams");
}

export async function deleteExam(formData: FormData) {
  await requireRole(["admin", "super_admin"]);
  const examId = parseInt(formData.get("examId") as string);
  await db.delete(exams).where(eq(exams.id, examId));
  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

// ─── Admin: Question CRUD ─────────────────────────────────────────────────────

export async function createQuestion(formData: FormData) {
  await requireRole(["admin", "super_admin"]);

  const examId = parseInt(formData.get("examId") as string);
  const type = formData.get("type") as "mcq" | "numeric" | "open";
  const content = (formData.get("content") as string)?.trim();
  const optionsRaw = formData.get("options") as string | null;
  const correctAnswer = (formData.get("correctAnswer") as string) || null;
  const toleranceRaw = formData.get("tolerance") as string | null;
  const tolerance = toleranceRaw ? parseFloat(toleranceRaw).toString() : null;
  const points = parseInt(formData.get("points") as string) || 1;
  const explanation = (formData.get("explanation") as string)?.trim() || null;

  if (!content) throw new Error("Content is required");

  const existing = await db.query.questions.findMany({
    where: eq(questions.examId, examId),
  });
  const maxOrder = existing.reduce((m, q) => Math.max(m, q.order), -1);

  let options = null;
  if (type === "mcq" && optionsRaw) {
    try { options = JSON.parse(optionsRaw); } catch { options = null; }
  }

  await db.insert(questions).values({
    examId,
    type,
    content,
    options,
    correctAnswer,
    tolerance,
    points,
    explanation,
    order: maxOrder + 1,
  });

  revalidatePath(`/admin/exams/${examId}`);
  redirect(`/admin/exams/${examId}`);
}

export async function updateQuestion(formData: FormData) {
  await requireRole(["admin", "super_admin"]);

  const questionId = parseInt(formData.get("questionId") as string);
  const examId = parseInt(formData.get("examId") as string);
  const type = formData.get("type") as "mcq" | "numeric" | "open";
  const content = (formData.get("content") as string)?.trim();
  const optionsRaw = formData.get("options") as string | null;
  const correctAnswer = (formData.get("correctAnswer") as string) || null;
  const toleranceRaw = formData.get("tolerance") as string | null;
  const tolerance = toleranceRaw ? parseFloat(toleranceRaw).toString() : null;
  const points = parseInt(formData.get("points") as string) || 1;
  const explanation = (formData.get("explanation") as string)?.trim() || null;

  let options = null;
  if (type === "mcq" && optionsRaw) {
    try { options = JSON.parse(optionsRaw); } catch { options = null; }
  }

  await db.update(questions).set({
    type,
    content,
    options,
    correctAnswer,
    tolerance,
    points,
    explanation,
    updatedAt: new Date(),
  }).where(eq(questions.id, questionId));

  revalidatePath(`/admin/exams/${examId}`);
  redirect(`/admin/exams/${examId}`);
}

export async function deleteQuestion(formData: FormData) {
  await requireRole(["admin", "super_admin"]);
  const questionId = parseInt(formData.get("questionId") as string);
  const examId = parseInt(formData.get("examId") as string);
  await db.delete(questions).where(eq(questions.id, questionId));
  revalidatePath(`/admin/exams/${examId}`);
}

// ─── Participant: Exam Sessions ───────────────────────────────────────────────

export async function startExamSession(examId: number): Promise<{ sessionId: number } | { error: string }> {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: { questions: true },
  });
  if (!exam || !exam.published) return { error: "Exam not available" };

  const now = new Date();
  if (exam.windowStart && now < exam.windowStart) return { error: "Exam window has not started" };
  if (exam.windowEnd && now > exam.windowEnd) return { error: "Exam window has closed" };

  const participant = await db.query.participants.findFirst({
    where: (p, { eq }) => eq(p.userId, session.user.id),
  });
  if (!participant) return { error: "Participant profile not found" };

  // Check existing active session
  const existing = await db.query.examSessions.findFirst({
    where: and(
      eq(examSessions.examId, examId),
      eq(examSessions.participantId, participant.id),
    ),
  });
  if (existing) {
    if (existing.status === "active") return { sessionId: existing.id };
    return { error: "You have already completed this exam" };
  }

  let questionIds = exam.questions.map((q) => q.id);
  if (exam.shuffleQuestions) {
    questionIds = questionIds.sort(() => Math.random() - 0.5);
  }
  if (exam.questionsPerSession && exam.questionsPerSession < questionIds.length) {
    questionIds = questionIds.slice(0, exam.questionsPerSession);
  }

  const deadlineAt = exam.durationMinutes
    ? new Date(now.getTime() + exam.durationMinutes * 60 * 1000)
    : null;

  const [newSession] = await db.insert(examSessions).values({
    examId,
    participantId: participant.id,
    questionOrder: questionIds,
    deadlineAt,
  }).returning({ id: examSessions.id });

  return { sessionId: newSession.id };
}

export async function saveAnswer(
  sessionId: number,
  questionId: number,
  answer: string | null,
  flagged: boolean = false,
) {
  await requireRole(["participant", "admin", "super_admin"]);

  const session = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
  });
  if (!session || session.status !== "active") return { error: "Session not active" };
  if (session.deadlineAt && new Date() > session.deadlineAt) {
    await db.update(examSessions).set({ status: "timed_out" }).where(eq(examSessions.id, sessionId));
    return { error: "Time expired" };
  }

  // Upsert answer
  const existing = await db.query.examAnswers.findFirst({
    where: and(eq(examAnswers.sessionId, sessionId), eq(examAnswers.questionId, questionId)),
  });

  if (existing) {
    await db.update(examAnswers).set({
      answer,
      flagged,
      answeredAt: answer ? new Date() : existing.answeredAt,
      updatedAt: new Date(),
    }).where(eq(examAnswers.id, existing.id));
  } else {
    await db.insert(examAnswers).values({
      sessionId,
      questionId,
      answer,
      flagged,
      answeredAt: answer ? new Date() : null,
    });
  }

  return { ok: true };
}

export async function submitExam(sessionId: number) {
  await requireRole(["participant", "admin", "super_admin"]);

  const session = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
    with: {
      answers: { with: { question: true } },
      exam: { with: { questions: true } },
    },
  });
  if (!session || session.status !== "active") return { error: "Session not active" };

  // Auto-score MCQ and numeric
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const q of session.exam.questions) {
    totalPoints += q.points;
    const ans = session.answers.find((a) => a.questionId === q.id);
    if (!ans?.answer) continue;

    let isCorrect = false;
    let awarded = 0;

    if (q.type === "mcq") {
      isCorrect = ans.answer === q.correctAnswer;
    } else if (q.type === "numeric" && q.correctAnswer) {
      const diff = Math.abs(parseFloat(ans.answer) - parseFloat(q.correctAnswer));
      const tol = q.tolerance ? parseFloat(q.tolerance) : 0;
      isCorrect = diff <= tol;
    }

    if (isCorrect) awarded = q.points;
    earnedPoints += awarded;

    if (q.type !== "open") {
      await db.update(examAnswers).set({
        isCorrect,
        pointsAwarded: awarded.toString(),
        updatedAt: new Date(),
      }).where(eq(examAnswers.id, ans.id));
    }
  }

  const score = totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(2) : null;

  await db.update(examSessions).set({
    status: "submitted",
    submittedAt: new Date(),
    score,
  }).where(eq(examSessions.id, sessionId));

  return { ok: true, score };
}

export async function logTabSwitch(sessionId: number) {
  const session = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
  });
  if (!session || session.status !== "active") return;

  await db.update(examSessions).set({
    tabSwitchCount: (session.tabSwitchCount ?? 0) + 1,
  }).where(eq(examSessions.id, sessionId));
}

// ─── Admin: Grading ───────────────────────────────────────────────────────────

export async function gradeOpenAnswer(formData: FormData) {
  const gradingSession = await requireRole(["admin", "super_admin"]);

  const answerId = parseInt(formData.get("answerId") as string);
  const isCorrect = formData.get("isCorrect") === "true";
  const pointsAwarded = parseFloat(formData.get("pointsAwarded") as string);

  await db.update(examAnswers).set({
    isCorrect,
    pointsAwarded: pointsAwarded.toString(),
    gradedAt: new Date(),
    gradedByUserId: gradingSession.user.id,
    updatedAt: new Date(),
  }).where(eq(examAnswers.id, answerId));

  const answer = await db.query.examAnswers.findFirst({
    where: eq(examAnswers.id, answerId),
  });
  if (answer) revalidatePath(`/admin/exams/${answer.sessionId}/results`);
}
