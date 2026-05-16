"use server";

import { db } from "@/lib/db";
import { exams, questions, examSessions, examAnswers } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit";

// ─── Admin: Exam CRUD ─────────────────────────────────────────────────────────

/**
 * Admin/QP action: Creates a new exam or practice session.
 * Extracts form data for exam properties (title, type, subject, round, timing, shuffle settings).
 * Redirects to the newly created exam's admin page on success.
 */
export async function createExam(formData: FormData) {
  const session = await requireRole(["admin", "super_admin", "question_provider"]);

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
    createdByUserId: session.user.id,
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

/**
 * Admin action: Updates an existing exam's metadata and settings.
 * Allows changing title, type, subject/round association, timing windows, shuffle behavior,
 * questions-per-session limit, instructions, and target grades. Revalidates admin exam routes.
 */
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
  const targetGrades = formData.getAll("targetGrades") as string[];

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
    targetGrades,
    updatedAt: new Date(),
  }).where(eq(exams.id, examId));

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/exams");
}

/**
 * Admin action: Toggles an exam's published status.
 * Published exams become visible to participants; unpublished exams are hidden.
 * Revalidates exam detail and listing pages.
 */
export async function togglePublishExam(formData: FormData) {
  await requireRole(["admin", "super_admin"]);
  const examId = parseInt(formData.get("examId") as string);
  const published = formData.get("published") === "true";

  await db.update(exams).set({ published: !published, updatedAt: new Date() }).where(eq(exams.id, examId));

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/exams");
}

/**
 * Admin action: Permanently deletes an exam and all its associated data.
 * Writes an audit log entry for the deletion. Redirects to the exam listing page.
 * CASCADE deletes in DB schema remove related questions, sessions, and answers.
 */
export async function deleteExam(formData: FormData) {
  const session = await requireRole(["admin", "super_admin"]);
  const examId = parseInt(formData.get("examId") as string);
  const exam = await db.query.exams.findFirst({ where: eq(exams.id, examId) });
  await db.delete(exams).where(eq(exams.id, examId));
  await writeAuditLog(session.user.id, "delete_exam", "exam", examId, { title: exam?.title });
  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

// ─── Admin: Question CRUD ─────────────────────────────────────────────────────

/**
 * Ownership assertion pattern: Enforces exam ownership for question_provider role.
 * Admins and super_admins bypass this check. For question_providers:
 *   - If exam.createdByUserId is null (legacy exam), claim it for this QP
 *   - If exam.createdByUserId doesn't match userId, throw access error
 * This pattern prevents question_providers from modifying each other's exams.
 */
async function assertExamOwnership(examId: number, userId: string, role: string) {
  if (role === "question_provider") {
    const exam = await db.query.exams.findFirst({ where: eq(exams.id, examId) });
    if (!exam) throw new Error("Imtihon topilmadi");
    if (exam.createdByUserId === null) {
      // Exam predates ownership tracking — claim it for this QP
      await db.update(exams).set({ createdByUserId: userId }).where(eq(exams.id, examId));
    } else if (exam.createdByUserId !== userId) {
      throw new Error("Bu imtihonni boshqarish huquqingiz yo'q");
    }
  }
}

/**
 * Admin/QP action: Creates a new question for an exam.
 * Asserts ownership via assertExamOwnership pattern. Parses MCQ options from JSON.
 * Auto-assigns order (maxOrder + 1) to append question to end. Redirects to exam
 * detail page (/admin or /qp route based on user role).
 */
export async function createQuestion(formData: FormData) {
  const session = await requireRole(["admin", "super_admin", "question_provider"]);
  const role = (session.user as { role?: string }).role ?? "participant";

  const examId = parseInt(formData.get("examId") as string);
  await assertExamOwnership(examId, session.user.id, role);

  const type = formData.get("type") as "mcq" | "numeric" | "open";
  const content = (formData.get("content") as string)?.trim();
  const optionsRaw = formData.get("options") as string | null;
  const correctAnswer = (formData.get("correctAnswer") as string) || null;
  const points = parseInt(formData.get("points") as string) || 1;
  const explanation = (formData.get("explanation") as string)?.trim() || null;
  const grades = formData.getAll("grades") as string[];

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
    grades,
    points,
    explanation,
    order: maxOrder + 1,
  });

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath(`/qp/exams/${examId}`);
  redirect(role === "question_provider" ? `/qp/exams/${examId}` : `/admin/exams/${examId}`);
}

/**
 * Admin/QP action: Updates an existing question's content, type, options, answer, and metadata.
 * Asserts ownership via assertExamOwnership pattern. Parses MCQ options from JSON if applicable.
 * Redirects to exam detail page (/admin or /qp route based on user role).
 */
export async function updateQuestion(formData: FormData) {
  const session = await requireRole(["admin", "super_admin", "question_provider"]);
  const role = (session.user as { role?: string }).role ?? "participant";

  const questionId = parseInt(formData.get("questionId") as string);
  const examId = parseInt(formData.get("examId") as string);
  await assertExamOwnership(examId, session.user.id, role);
  const type = formData.get("type") as "mcq" | "numeric" | "open";
  const content = (formData.get("content") as string)?.trim();
  const optionsRaw = formData.get("options") as string | null;
  const correctAnswer = (formData.get("correctAnswer") as string) || null;
  const points = parseInt(formData.get("points") as string) || 1;
  const explanation = (formData.get("explanation") as string)?.trim() || null;
  const grades = formData.getAll("grades") as string[];

  let options = null;
  if (type === "mcq" && optionsRaw) {
    try { options = JSON.parse(optionsRaw); } catch { options = null; }
  }

  await db.update(questions).set({
    type,
    content,
    options,
    correctAnswer,
    grades,
    points,
    explanation,
    updatedAt: new Date(),
  }).where(eq(questions.id, questionId));

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath(`/qp/exams/${examId}`);
  redirect(role === "question_provider" ? `/qp/exams/${examId}` : `/admin/exams/${examId}`);
}

/**
 * Admin/QP action: Permanently deletes a question from an exam.
 * Asserts ownership via assertExamOwnership pattern. Prevents deletion if any participant
 * has already answered the question. Writes audit log entry. Revalidates exam detail pages.
 */
export async function deleteQuestion(formData: FormData) {
  const session = await requireRole(["admin", "super_admin", "question_provider"]);
  const role = (session.user as { role?: string }).role ?? "participant";
  const questionId = parseInt(formData.get("questionId") as string);
  const examId = parseInt(formData.get("examId") as string);
  await assertExamOwnership(examId, session.user.id, role);

  const answered = await db.query.examAnswers.findFirst({
    where: eq(examAnswers.questionId, questionId),
  });
  if (answered)
    throw new Error("Bu savolga participant javob bergan — o'chirib bo'lmaydi");

  await db.delete(questions).where(eq(questions.id, questionId));
  await writeAuditLog(session.user.id, "delete_question", "question", questionId, { examId });
  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath(`/qp/exams/${examId}`);
}

// ─── Participant: Exam Sessions ───────────────────────────────────────────────

/**
 * Participant action: Starts a new exam session or resumes an active one.
 * Checks exam availability, window constraints, and participant enrollment (round/subject).
 * Filters questions by participant's grade level. Handles shuffling and question-per-session limits.
 * For practice exams, archives old sessions so participant can review prior attempts.
 * For regular exams, prevents multiple attempts. Returns sessionId or error message.
 */
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
    with: { subjects: true },
  });
  if (!participant) return { error: "Participant profile not found" };

  // Admins bypass enrollment checks; participants must be enrolled in the exam's round and subject.
  // Practice exams are open to any participant — no enrollment required.
  const userRole = (session.user as { role?: string }).role ?? "participant";
  if (userRole === "participant" && exam.type !== "practice") {
    if (exam.roundId && participant.roundId !== exam.roundId) {
      return { error: "You are not enrolled in the round for this exam" };
    }
    if (exam.subjectId) {
      const enrolled = participant.subjects.some((s) => s.subjectId === exam.subjectId);
      if (!enrolled) return { error: "You are not enrolled in the subject for this exam" };
    }
  }

  // Check existing non-archived session (archived = prior practice attempts)
  const existing = await db.query.examSessions.findFirst({
    where: and(
      eq(examSessions.examId, examId),
      eq(examSessions.participantId, participant.id),
      sql`${examSessions.archivedAt} IS NULL`,
    ),
  });
  if (existing) {
    if (existing.status === "active") return { sessionId: existing.id };
    if (exam.type === "practice") {
      // Archive old session so participant can review prior attempts; don't delete
      await db.update(examSessions)
        .set({ archivedAt: new Date() })
        .where(eq(examSessions.id, existing.id));
    } else {
      return { error: "You have already completed this exam" };
    }
  }

  // Filter questions by participant's grade (empty grades array = all grades)
  const participantGrade = participant.grade ?? null;
  const gradeFiltered = exam.questions.filter((q) => {
    const qGrades = (q.grades as string[] | null) ?? [];
    return qGrades.length === 0 || (participantGrade !== null && qGrades.includes(participantGrade));
  });

  let questionIds = gradeFiltered.map((q) => q.id);
  if (exam.shuffleQuestions) {
    questionIds = questionIds.sort(() => Math.random() - 0.5);
  }
  if (exam.questionsPerSession && exam.questionsPerSession < questionIds.length) {
    questionIds = questionIds.slice(0, exam.questionsPerSession);
  }

  if (questionIds.length === 0) {
    return { error: `No questions match Grade ${participantGrade ?? "your grade"}. Ask an administrator to assign questions for your grade level.` };
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

/**
 * Participant action: Saves or updates a participant's answer for a specific question.
 * Validates session is active and not expired. Enforces ownership — participants can only
 * save answers to their own sessions. Uses upsert (onConflictDoUpdate) to handle answer changes.
 * If deadline passed, marks session as timed_out and rejects the answer.
 */
export async function saveAnswer(
  sessionId: number,
  questionId: number,
  answer: string | null,
  flagged: boolean = false,
) {
  const authSession = await requireRole(["participant", "admin", "super_admin"]);

  const dbSession = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
  });
  if (!dbSession || dbSession.status !== "active") return { error: "Session not active" };

  // Ownership check — participants can only save answers to their own sessions
  const role = (authSession.user as { role?: string }).role ?? "participant";
  if (role === "participant") {
    const participant = await db.query.participants.findFirst({
      where: (p, { eq }) => eq(p.userId, authSession.user.id),
    });
    if (!participant || dbSession.participantId !== participant.id) {
      return { error: "Unauthorized" };
    }
  }

  if (dbSession.deadlineAt && new Date() > dbSession.deadlineAt) {
    await db.update(examSessions).set({ status: "timed_out" }).where(eq(examSessions.id, sessionId));
    return { error: "Time expired" };
  }

  await db.insert(examAnswers).values({
    sessionId,
    questionId,
    answer,
    flagged,
    answeredAt: answer ? new Date() : null,
  }).onConflictDoUpdate({
    target: [examAnswers.sessionId, examAnswers.questionId],
    set: {
      answer,
      flagged,
      answeredAt: answer ? new Date() : sql`${examAnswers.answeredAt}`,
      updatedAt: new Date(),
    },
  });

  return { ok: true };
}

/**
 * Participant action: Submits an exam session and runs auto-scoring algorithm (60+ lines).
 *
 * Auto-scoring algorithm logic:
 *   1. Identifies session-assigned questions from questionOrder array
 *   2. Iterates through each question to calculate total and earned points:
 *      - MCQ questions: exact string match (answer === correctAnswer)
 *      - Numeric questions: absolute difference < 1e-9 tolerance (floating-point safe)
 *      - Open questions: skipped (requires manual grading, not auto-scored)
 *   3. Calculates percentage score: (earnedPoints / totalPoints) * 100
 *   4. Updates each answer row with isCorrect flag and pointsAwarded value
 *   5. Marks session as submitted with final score and timestamp
 *
 * Returns: { ok: true, score: string } or { error: string }
 */
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

  // Auto-score MCQ and numeric — only questions assigned to this session
  const sessionExam = session.exam as any;
  const sessionQuestionIds = new Set<number>(
    Array.isArray(session.questionOrder)
      ? (session.questionOrder as number[])
      : sessionExam.questions.map((q: any) => q.id)
  );
  const sessionQuestions = sessionExam.questions.filter((q: any) => sessionQuestionIds.has(q.id));

  // Accumulate points across all session questions for percentage calculation
  let totalPoints = 0;
  let earnedPoints = 0;
  const scoreUpdates: { answerId: number; isCorrect: boolean; awarded: number }[] = [];

  for (const q of sessionQuestions) {
    // Accumulate maximum possible points from all questions in this session
    totalPoints += q.points;
    const ans = session.answers.find((a) => a.questionId === q.id);
    // Skip auto-scoring if no answer submitted or if question type is open-ended,
    // since open-ended responses require manual grading by admins
    if (!ans?.answer || q.type === "open") continue;

    let isCorrect = false;
    if (q.type === "mcq") {
      // MCQ requires exact string match because option values are stored as strings (A/B/C/D)
      // and any variation would indicate a different selected option
      isCorrect = ans.answer === q.correctAnswer;
    } else if (q.type === "numeric" && q.correctAnswer) {
      // Numeric answers use floating-point tolerance (1e-9) instead of exact equality
      // to account for rounding errors during string-to-float conversion and prevent
      // rejecting mathematically correct answers due to precision limits
      const diff = Math.abs(parseFloat(ans.answer) - parseFloat(q.correctAnswer));
      isCorrect = diff < 1e-9;
    }

    // Award full points if correct, zero otherwise (no partial credit in auto-scoring)
    const awarded = isCorrect ? q.points : 0;
    // Accumulate earned points for percentage score calculation
    earnedPoints += awarded;
    scoreUpdates.push({ answerId: ans.id, isCorrect, awarded });
  }

  // Calculate percentage score: (earned / total) * 100, ensuring we avoid division by zero
  const score = totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(2) : null;

  // Neon HTTP driver does not support transactions — run sequentially
  await Promise.all(
    scoreUpdates.map(({ answerId, isCorrect, awarded }) =>
      db.update(examAnswers).set({
        isCorrect,
        pointsAwarded: awarded.toString(),
        updatedAt: new Date(),
      }).where(eq(examAnswers.id, answerId))
    )
  );

  await db.update(examSessions).set({
    status: "submitted",
    submittedAt: new Date(),
    score,
  }).where(eq(examSessions.id, sessionId));

  return { ok: true, score };
}

/**
 * Participant action: Increments tab switch counter for proctoring purposes.
 * Tracks when a participant navigates away from the exam tab. Only applies to active
 * sessions. Participants can only log tab switches for their own sessions (ownership check).
 * Admins can log tab switches for any session (testing/monitoring).
 */
export async function logTabSwitch(sessionId: number) {
  const auth = await requireRole(["participant", "admin", "super_admin"]);
  const role = (auth.user as { role?: string }).role ?? "participant";

  let participantIdFilter: ReturnType<typeof eq> | undefined;
  if (role === "participant") {
    const participant = await db.query.participants.findFirst({
      where: (p, { eq: peq }) => peq(p.userId, auth.user.id),
    });
    if (!participant) return;
    participantIdFilter = eq(examSessions.participantId, participant.id);
  }

  await db
    .update(examSessions)
    .set({ tabSwitchCount: sql`${examSessions.tabSwitchCount} + 1` })
    .where(
      and(
        eq(examSessions.id, sessionId),
        eq(examSessions.status, "active"),
        participantIdFilter
      )
    );
}

// ─── Admin: Grading ───────────────────────────────────────────────────────────

/**
 * Admin action: Manually grades an open-ended answer and recalculates session score.
 * Sets isCorrect flag and pointsAwarded for the answer. Records grader's userId and timestamp.
 * After grading, recomputes entire session's score by summing all pointsAwarded values
 * (including previously auto-scored MCQ/numeric answers). Revalidates exam result pages.
 */
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

  // Reload answer with session to recalculate total score
  const answer = await db.query.examAnswers.findFirst({
    where: eq(examAnswers.id, answerId),
    with: { session: { with: { exam: { with: { questions: true } } } } },
  });
  if (!answer) return;

  // Recalculate session score including newly graded open answers
  const allAnswers = await db.query.examAnswers.findMany({
    where: eq(examAnswers.sessionId, answer.sessionId),
  });

  const answerSession = answer.session as any;
  const sessionQIds = new Set<number>(
    Array.isArray(answerSession.questionOrder)
      ? (answerSession.questionOrder as number[])
      : answerSession.exam.questions.map((q: any) => q.id)
  );
  const sessionQuestions = answerSession.exam.questions.filter((q: any) => sessionQIds.has(q.id));
  const totalPts = sessionQuestions.reduce((sum: number, q: any) => sum + q.points, 0);
  const earnedPts = allAnswers.reduce((sum, a) => sum + (parseFloat(a.pointsAwarded ?? "0") || 0), 0);
  const newScore = totalPts > 0 ? ((earnedPts / totalPts) * 100).toFixed(2) : null;

  await db.update(examSessions)
    .set({ score: newScore })
    .where(eq(examSessions.id, answer.sessionId));

  revalidatePath(`/admin/exams/${answerSession.examId}/results`);
  revalidatePath(`/admin/exams/${answerSession.examId}/results/${answer.sessionId}`);
}
