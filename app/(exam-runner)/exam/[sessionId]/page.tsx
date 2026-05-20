import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, examSessions, examAnswers, participants } from "@/lib/db/schema";
import { ExamTaker } from "@/app/(dashboard)/participant/exams/[id]/take/exam-taker";
import { LockdownShell } from "@/components/partner/lockdown-shell";

export default async function ExamRunnerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const { sessionId } = await params;
  const sid = Number(sessionId);
  if (!Number.isInteger(sid)) notFound();

  const examSession = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sid),
  });
  if (!examSession) notFound();

  // Ownership: participants can only run their own session.
  const role = (session.user as { role?: string }).role ?? "participant";
  if (role === "participant") {
    const participant = await db.query.participants.findFirst({
      where: eq(participants.userId, session.user.id),
    });
    if (!participant || examSession.participantId !== participant.id) notFound();
  }

  if (examSession.status === "submitted" || examSession.status === "timed_out") {
    redirect(`/participant/exams/${examSession.examId}/result`);
  }

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examSession.examId),
    with: { questions: { orderBy: (q, { asc }) => [asc(q.order)] } },
  });
  if (!exam) notFound();

  const rawOrder = examSession.questionOrder as number[] | null;
  const orderedIds =
    rawOrder && rawOrder.length > 0
      ? rawOrder
      : exam.questions.map((q) => q.id);
  const questionMap = new Map(exam.questions.map((q) => [q.id, q]));
  const orderedQuestions = orderedIds
    .map((id) => questionMap.get(id))
    .filter(Boolean) as typeof exam.questions;
  if (orderedQuestions.length === 0) notFound();

  const savedAnswers = await db.query.examAnswers.findMany({
    where: eq(examAnswers.sessionId, examSession.id),
  });
  const answerMap = Object.fromEntries(
    savedAnswers.map((a) => [a.questionId, { answer: a.answer, flagged: a.flagged }]),
  );

  if (examSession.deadlineAt && new Date() > examSession.deadlineAt) {
    await db
      .update(examSessions)
      .set({ status: "timed_out" })
      .where(and(eq(examSessions.id, examSession.id)));
    redirect(`/participant/exams/${examSession.examId}/result`);
  }

  return (
    <LockdownShell sessionId={examSession.id} examTitle={exam.title}>
      <div className="p-5 md:p-8">
        <ExamTaker
          sessionId={examSession.id}
          examId={examSession.examId}
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
      </div>
    </LockdownShell>
  );
}
