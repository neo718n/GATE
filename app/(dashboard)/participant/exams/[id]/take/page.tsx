import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, examSessions, examAnswers, participants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ExamTaker } from "./exam-taker";

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const { id } = await params;
  const examId = parseInt(id);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });
  if (!participant) redirect("/participant/profile");

  const examSession = await db.query.examSessions.findFirst({
    where: and(
      eq(examSessions.examId, examId),
      eq(examSessions.participantId, participant.id),
      sql`${examSessions.archivedAt} IS NULL`,
    ),
  });
  if (!examSession) redirect(`/participant/exams/${examId}`);
  if (examSession.status === "submitted" || examSession.status === "timed_out") {
    redirect(`/participant/exams/${examId}/result`);
  }

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: { questions: { orderBy: (q, { asc }) => [asc(q.order)] } },
  });
  if (!exam) notFound();

  // Apply session's question order (shuffled)
  const orderedIds = (examSession.questionOrder as number[]) ?? exam.questions.map((q) => q.id);
  const questionMap = new Map(exam.questions.map((q) => [q.id, q]));
  const orderedQuestions = orderedIds.map((id) => questionMap.get(id)).filter(Boolean) as typeof exam.questions;

  const savedAnswers = await db.query.examAnswers.findMany({
    where: eq(examAnswers.sessionId, examSession.id),
  });
  const answerMap = Object.fromEntries(
    savedAnswers.map((a) => [a.questionId, { answer: a.answer, flagged: a.flagged }])
  );

  // Check if time already expired server-side
  if (examSession.deadlineAt && new Date() > examSession.deadlineAt) {
    await db.update(examSessions).set({ status: "timed_out" }).where(eq(examSessions.id, examSession.id));
    redirect(`/participant/exams/${examId}/result`);
  }

  return (
    <ExamTaker
      sessionId={examSession.id}
      examId={examId}
      examTitle={exam.title}
      deadlineAt={examSession.deadlineAt?.toISOString() ?? null}
      questions={orderedQuestions.map((q) => ({
        id: q.id,
        type: q.type,
        content: q.content,
        points: q.points,
        options: (q.options as { id: string; text: string }[] | null) ?? null,
      }))}
      initialAnswers={answerMap}
      isExam={exam.type === "exam"}
    />
  );
}
