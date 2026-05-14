import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, examSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GradeOpenAnswerForm } from "./grade-form";

const STATUS_COLOR: Record<string, string> = {
  submitted: "text-green-600",
  timed_out: "text-destructive",
  active: "text-yellow-600",
};

export default async function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;
  const examId = parseInt(id);

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: {
      questions: { orderBy: (q, { asc }) => [asc(q.order)] },
      sessions: {
        orderBy: desc(examSessions.createdAt),
        with: {
          participant: { with: { user: true } },
          answers: { with: { question: true } },
        },
      },
    },
  });
  if (!exam) notFound();

  const openQuestions = exam.questions.filter((q) => q.type === "open");
  const submitted = exam.sessions.filter((s) => s.status === "submitted");
  const avgScore =
    submitted.length > 0
      ? (submitted.reduce((s, sess) => s + (sess.score ? parseFloat(sess.score) : 0), 0) / submitted.length).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Admin · <Link href="/admin/exams" className="hover:opacity-70">Exams</Link> ·{" "}
            <Link href={`/admin/exams/${examId}`} className="hover:opacity-70">{exam.title}</Link>
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">Results</h1>
          <p className="text-sm font-light text-foreground/60 mt-1">
            {submitted.length} submitted · {avgScore !== null ? `avg ${avgScore}%` : "no scores yet"}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total sessions", value: exam.sessions.length },
          { label: "Submitted", value: submitted.length },
          { label: "Active", value: exam.sessions.filter((s) => s.status === "active").length },
          { label: "Avg score", value: avgScore ? `${avgScore}%` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border bg-card px-4 py-4">
            <p className="text-2xl font-light text-foreground">{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Sessions table */}
      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-muted/30">
          {["Participant", "Started", "Status", "Score", "Tab switches", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">{h}</span>
          ))}
        </div>

        {exam.sessions.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">No sessions yet.</p>
        )}

        {(exam.sessions as any[]).map((s) => (
          <div key={s.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center">
            <div className="min-w-0">
              <p className="text-sm font-light text-foreground truncate">{s.participant?.fullName}</p>
              <p className="text-[10px] text-foreground/40 truncate">{s.participant?.user?.email}</p>
            </div>
            <p className="text-xs font-light text-foreground/60">
              {new Date(s.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_COLOR[s.status]}`}>
              {s.status}
            </span>
            <p className="text-sm font-light text-foreground">
              {s.score ? `${parseFloat(s.score).toFixed(1)}%` : "—"}
            </p>
            <p className={`text-sm font-light ${(s.tabSwitchCount ?? 0) > 3 ? "text-yellow-600 font-medium" : "text-foreground/60"}`}>
              {s.tabSwitchCount ?? 0}
            </p>
            <Link
              href={`/admin/exams/${examId}/results/${s.id}`}
              className="text-xs text-gate-gold hover:underline"
            >
              Details
            </Link>
          </div>
        ))}
      </div>

      {/* Manual grading for open questions */}
      {openQuestions.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Open-Ended Grading
          </p>
          {exam.sessions
            .filter((s) => s.status === "submitted")
            .map((s) =>
              openQuestions.map((q) => {
                const ans = s.answers.find((a) => a.questionId === q.id);
                if (!ans?.answer) return null;
                const needsGrading = ans.isCorrect === null;
                return (
                  <div key={`${s.id}-${q.id}`} className={`border px-5 py-4 flex flex-col gap-3 ${needsGrading ? "border-yellow-500/30 bg-yellow-50/5" : "border-green-500/20"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{s.participant?.fullName}</span>
                        <span className="text-foreground/20">·</span>
                        <span className="text-[10px] text-foreground/40">Q: {q.content.replace(/<[^>]*>/g, "").slice(0, 60)}…</span>
                      </div>
                      {!needsGrading && (
                        <span className={`text-[10px] font-semibold ${ans.isCorrect ? "text-green-600" : "text-destructive"}`}>
                          {ans.isCorrect ? `+${ans.pointsAwarded} pts` : "0 pts"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-light text-foreground bg-muted/20 px-4 py-3 rounded-lg whitespace-pre-wrap">
                      {ans.answer}
                    </p>
                    {needsGrading && (
                      <GradeOpenAnswerForm
                        answerId={ans.id}
                        maxPoints={q.points}
                      />
                    )}
                  </div>
                );
              })
            )}
        </div>
      )}
    </div>
  );
}
