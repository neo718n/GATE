import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, subjects, rounds } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MathContent } from "@/components/ui/math-content";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { togglePublishExam, deleteExam, updateExam, deleteQuestion } from "@/lib/actions/exam";

const Q_TYPE: Record<string, string> = {
  mcq: "MCQ",
  numeric: "Numeric",
  open: "Open",
};

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;
  const examId = parseInt(id);

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: {
      subject: true,
      round: true,
      questions: { orderBy: (q, { asc }) => [asc(q.order)] },
      sessions: true,
    },
  });
  if (!exam) notFound();

  const [allSubjects, allRounds] = await Promise.all([
    db.query.subjects.findMany({ where: (s, { eq }) => eq(s.active, true), orderBy: asc(subjects.order) }),
    db.query.rounds.findMany({ orderBy: desc(rounds.id), with: { cycle: true } }),
  ]);

  const fmt = (d: Date | null) =>
    d ? new Date(d).toISOString().slice(0, 16) : "";

  const updateExamWithId = updateExam.bind(null, examId);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Admin · <Link href="/admin/exams" className="hover:text-gate-gold/70">Exams</Link>
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">{exam.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${exam.published ? "text-green-600" : "text-foreground/40"}`}>
              {exam.published ? "Published" : "Draft"}
            </span>
            <span className="text-foreground/20">·</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gold">{exam.type}</span>
            <span className="text-foreground/20">·</span>
            <span className="text-xs font-light text-foreground/50">{exam.questions.length} questions</span>
            <span className="text-foreground/20">·</span>
            <span className="text-xs font-light text-foreground/50">{exam.sessions.length} sessions</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={togglePublishExam}>
            <input type="hidden" name="examId" value={exam.id} />
            <input type="hidden" name="published" value={String(exam.published)} />
            <Button type="submit" variant={exam.published ? "outline" : "gold"} size="sm">
              {exam.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
          {exam.sessions.length === 0 && (
            <form action={deleteExam}>
              <input type="hidden" name="examId" value={exam.id} />
              <Button type="submit" variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                Delete
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings form */}
        <div className="flex flex-col gap-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Settings
          </p>
          <form action={updateExamWithId} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required defaultValue={exam.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={exam.type}
                  className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
                >
                  <option value="exam">Exam (official)</option>
                  <option value="practice">Practice test</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="subjectId">Subject</Label>
                <select
                  id="subjectId"
                  name="subjectId"
                  defaultValue={exam.subjectId ?? ""}
                  className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
                >
                  <option value="">— None —</option>
                  {allSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="roundId">Round</Label>
              <select
                id="roundId"
                name="roundId"
                defaultValue={exam.roundId ?? ""}
                className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
              >
                <option value="">— None —</option>
                {allRounds.map((r) => (
                  <option key={r.id} value={r.id}>{r.cycle?.name} — {r.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="durationMinutes">Duration (min)</Label>
                <Input id="durationMinutes" name="durationMinutes" type="number" min="1" defaultValue={exam.durationMinutes ?? ""} placeholder="Unlimited" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="questionsPerSession">Questions / session</Label>
                <Input id="questionsPerSession" name="questionsPerSession" type="number" min="1" defaultValue={exam.questionsPerSession ?? ""} placeholder="All" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="windowStart">Window opens</Label>
                <Input id="windowStart" name="windowStart" type="datetime-local" defaultValue={fmt(exam.windowStart)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="windowEnd">Window closes</Label>
                <Input id="windowEnd" name="windowEnd" type="datetime-local" defaultValue={fmt(exam.windowEnd)} />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="shuffleQuestions" defaultChecked={exam.shuffleQuestions} className="w-4 h-4 accent-gate-gold" />
              <span className="text-sm font-light text-foreground">Shuffle questions</span>
            </label>
            <div className="flex flex-col gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea id="instructions" name="instructions" rows={3} defaultValue={exam.instructions ?? ""} className="rounded-xl" />
            </div>
            <Button type="submit" variant="gold" size="sm">Save Settings</Button>
          </form>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Statistics
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Questions", value: exam.questions.length },
              { label: "Sessions", value: exam.sessions.length },
              { label: "Submitted", value: exam.sessions.filter((s) => s.status === "submitted").length },
              { label: "Active now", value: exam.sessions.filter((s) => s.status === "active").length },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border bg-card p-4">
                <p className="text-2xl font-light text-foreground">{value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
          {exam.sessions.length > 0 && (
            <Link href={`/admin/exams/${exam.id}/results`}>
              <Button variant="outline" size="sm" className="w-full">View Results</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-1 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
            Questions ({exam.questions.length})
          </p>
          <Link href={`/admin/exams/${exam.id}/questions/new`}>
            <Button variant="gold" size="sm">+ Add Question</Button>
          </Link>
        </div>

        {exam.questions.length === 0 && (
          <p className="text-sm font-light text-foreground/40 py-6 text-center">
            No questions yet. Add your first question.
          </p>
        )}

        <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
          {exam.questions.map((q, idx) => (
            <div key={q.id} className="flex items-start gap-4 px-5 py-4">
              <span className="text-[11px] font-semibold text-foreground/30 w-6 shrink-0 mt-0.5">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gate-gold">{Q_TYPE[q.type]}</span>
                  <span className="text-[9px] text-foreground/35">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
                </div>
                <MathContent
                  html={q.content}
                  className="text-sm font-light text-foreground line-clamp-2 [&_p]:inline [&_*]:text-sm"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/exams/${exam.id}/questions/${q.id}/edit`}>
                  <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                </Link>
                <form action={deleteQuestion}>
                  <input type="hidden" name="questionId" value={q.id} />
                  <input type="hidden" name="examId" value={exam.id} />
                  <Button type="submit" variant="outline" size="sm" className="text-xs text-destructive hover:bg-destructive/10">×</Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
