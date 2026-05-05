import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, examSessions, examAnswers, participants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MathContent } from "@/components/ui/math-content";

export default async function ExamResultPage({ params }: { params: Promise<{ id: string }> }) {
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
    with: {
      answers: { with: { question: true } },
    },
  });
  if (!examSession) redirect(`/participant/exams/${examId}`);
  if (examSession.status === "active") redirect(`/participant/exams/${examId}/take`);

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: { questions: true },
  });
  if (!exam) notFound();

  const isPractice = exam.type === "practice";
  const isTimedOut = examSession.status === "timed_out";

  // Only show questions that were in this participant's session (grade-filtered subset)
  const sessionQuestionIds = new Set(
    (examSession.questionOrder as number[] | null) ?? exam.questions.map((q) => q.id),
  );
  const sessionQuestions = exam.questions.filter((q) => sessionQuestionIds.has(q.id));

  const totalPoints = sessionQuestions.reduce((s, q) => s + q.points, 0);
  const earnedPoints = examSession.answers
    .reduce((s, a) => s + (a.pointsAwarded ? parseFloat(a.pointsAwarded) : 0), 0);
  const scorePercent = examSession.score ? parseFloat(examSession.score) : null;
  const hasOpenQuestions = sessionQuestions.some((q) => q.type === "open");
  const pendingGrading = examSession.answers.some((a) => a.question.type === "open" && a.isCorrect === null && a.answer);

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">{exam.title}</span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          {isTimedOut ? "Time Expired" : "Exam Submitted"}
        </h1>
      </div>

      {/* Score card */}
      <div className="border border-border bg-card px-6 py-6 flex flex-col gap-4">
        {isPractice && scorePercent !== null ? (
          <>
            <div className="flex items-end gap-3">
              <span className="font-serif text-6xl font-light text-foreground">{scorePercent.toFixed(0)}</span>
              <span className="text-2xl font-light text-foreground/40 mb-2">%</span>
            </div>
            <p className="text-sm font-light text-foreground/60">
              {earnedPoints.toFixed(0)} / {totalPoints} points
            </p>
          </>
        ) : isPractice && pendingGrading ? (
          <p className="text-sm font-light text-foreground/60">
            Partial score pending — open-ended answers are being reviewed.
          </p>
        ) : !isPractice ? (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gold">Official Exam</p>
            <p className="text-sm font-light text-foreground/70">
              Your submission has been received. Results will be published by the admin after grading.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/40">Questions</p>
            <p className="text-lg font-light text-foreground mt-0.5">{sessionQuestions.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/40">Answered</p>
            <p className="text-lg font-light text-foreground mt-0.5">{examSession.answers.filter((a) => a.answer).length}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/40">Status</p>
            <p className={`text-lg font-light mt-0.5 ${isTimedOut ? "text-destructive" : "text-green-600"}`}>
              {isTimedOut ? "Timed out" : "Submitted"}
            </p>
          </div>
        </div>
      </div>

      {/* Practice: show answers */}
      {isPractice && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Review
          </p>
          {sessionQuestions.map((q, idx) => {
            const ans = examSession.answers.find((a) => a.questionId === q.id);
            const isCorrect = ans?.isCorrect;
            const isPending = q.type === "open" && isCorrect === null;
            return (
              <div key={q.id} className={`border px-5 py-4 flex flex-col gap-2 ${isCorrect ? "border-green-500/30 bg-green-50/5" : isPending ? "border-border" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-foreground/40">Q{idx + 1}</span>
                  {!isPending && (
                    <span className={`text-[10px] font-semibold uppercase ${isCorrect ? "text-green-600" : "text-destructive"}`}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  )}
                  {isPending && <span className="text-[10px] font-semibold text-foreground/40">Pending review</span>}
                </div>
                <MathContent html={q.content} className="text-sm font-light text-foreground prose prose-sm max-w-none" />
                {ans?.answer && (
                  <p className="text-xs font-light text-foreground/60">Your answer: <span className="text-foreground">{ans.answer}</span></p>
                )}
                {q.explanation && (
                  <div className="border-t border-border pt-2 mt-1">
                    <MathContent html={q.explanation} className="text-xs font-light text-foreground/50 prose prose-sm max-w-none [&_p]:m-0 [&_img]:max-w-full [&_img]:rounded" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4">
        {isPractice && (
          <Link href={`/participant/exams/${examId}`}>
            <Button variant="gold" size="md">Try Again</Button>
          </Link>
        )}
        <Link href="/participant/exams">
          <Button variant="outline" size="md">Back to Exams</Button>
        </Link>
      </div>
    </div>
  );
}
