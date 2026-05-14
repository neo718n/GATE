import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, examSessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MathContent } from "@/components/ui/math-content";

const STATUS_COLOR: Record<string, string> = {
  submitted: "text-green-600",
  timed_out: "text-destructive",
  active: "text-yellow-600",
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sid: string }>;
}) {
  await requireRole(["admin", "super_admin"]);
  const { id, sid } = await params;
  const examId = parseInt(id);
  const sessionId = parseInt(sid);

  const [exam, session] = await Promise.all([
    db.query.exams.findFirst({
      where: eq(exams.id, examId),
      with: { questions: { orderBy: (q, { asc }) => [asc(q.order)] } },
    }),
    db.query.examSessions.findFirst({
      where: and(eq(examSessions.id, sessionId), eq(examSessions.examId, examId)),
      with: {
        participant: { with: { user: true } },
        answers: { with: { question: true } },
      },
    }),
  ]);
  if (!exam || !session) notFound();

  const totalPoints = exam.questions.reduce((s, q) => s + q.points, 0);
  const earnedPoints = session.answers.reduce(
    (s, a) => s + (a.pointsAwarded ? parseFloat(a.pointsAwarded) : 0),
    0,
  );

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin ·{" "}
          <Link href="/admin/exams" className="hover:opacity-70">Exams</Link> ·{" "}
          <Link href={`/admin/exams/${examId}`} className="hover:opacity-70">{exam.title}</Link> ·{" "}
          <Link href={`/admin/exams/${examId}/results`} className="hover:opacity-70">Results</Link>
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          {(session as any).participant?.fullName ?? "Session"} — Detail
        </h1>
        <div className="flex items-center gap-4 mt-1">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_COLOR[session.status]}`}>
            {session.status}
          </span>
          <span className="text-xs font-light text-foreground/50">
            {session.score
              ? `Score: ${parseFloat(session.score).toFixed(1)}% — ${earnedPoints}/${totalPoints} pts`
              : `${earnedPoints}/${totalPoints} pts`}
          </span>
          {(session.tabSwitchCount ?? 0) > 0 && (
            <span className={`text-xs font-light ${(session.tabSwitchCount ?? 0) > 3 ? "text-yellow-600 font-medium" : "text-foreground/50"}`}>
              {session.tabSwitchCount} tab switch{session.tabSwitchCount !== 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {exam.questions.map((q, idx) => {
          const ans = session.answers.find((a) => a.questionId === q.id);
          const correct = ans?.isCorrect;
          const pending = q.type === "open" && ans?.answer && ans?.isCorrect === null;

          return (
            <div
              key={q.id}
              className={`border rounded-xl px-5 py-4 flex flex-col gap-3 ${
                pending
                  ? "border-yellow-500/30 bg-yellow-50/5"
                  : correct === true
                  ? "border-green-500/20 bg-green-50/5"
                  : correct === false
                  ? "border-destructive/20 bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-foreground/40">Q{idx + 1}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gate-gold/80">
                    {q.type}
                  </span>
                  <span className="text-[10px] text-foreground/35">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
                  {ans?.flagged && (
                    <span className="text-[10px] text-yellow-500 font-semibold">Flagged</span>
                  )}
                </div>
                <span className={`text-[10px] font-bold shrink-0 ${
                  pending ? "text-yellow-600" : correct === true ? "text-green-600" : correct === false ? "text-destructive" : "text-foreground/30"
                }`}>
                  {pending ? "Pending" : correct === true ? `+${ans?.pointsAwarded ?? q.points} pts` : correct === false ? "0 pts" : "—"}
                </span>
              </div>

              <MathContent
                html={q.content}
                className="text-sm font-light text-foreground prose prose-sm max-w-none"
              />

              {/* Participant answer */}
              <div className="text-xs font-light text-foreground/60 bg-muted/20 px-3 py-2 rounded-lg">
                <span className="text-foreground/40 mr-1">Answer:</span>
                {ans?.answer ? (
                  q.type === "mcq" && q.options ? (
                    (() => {
                      const opt = (q.options as { id: string; text: string }[]).find(
                        (o) => o.id === ans.answer,
                      );
                      return (
                        <span className="text-foreground">
                          {ans.answer}) {opt?.text ?? ans.answer}
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-foreground whitespace-pre-wrap">{ans.answer}</span>
                  )
                ) : (
                  <span className="text-foreground/30 italic">No answer</span>
                )}
              </div>

              {/* Correct answer */}
              {q.type !== "open" && q.correctAnswer && (
                <div className="text-[10px] font-light text-foreground/40">
                  Correct:{" "}
                  {q.type === "mcq" && q.options
                    ? (() => {
                        const opt = (q.options as { id: string; text: string }[]).find(
                          (o) => o.id === q.correctAnswer,
                        );
                        return `${q.correctAnswer}) ${opt?.text ?? q.correctAnswer}`;
                      })()
                    : q.correctAnswer}
                  {q.tolerance && parseFloat(q.tolerance) > 0 ? ` ± ${q.tolerance}` : ""}
                </div>
              )}

              {/* Explanation */}
              {q.explanation && (
                <div className="text-[10px] font-light text-foreground/50 border-t border-border pt-2">
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
