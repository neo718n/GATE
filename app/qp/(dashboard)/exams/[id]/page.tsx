import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { deleteQuestion } from "@/lib/actions/exam";
import { Button } from "@/components/ui/button";

const TYPE_LABEL: Record<string, string> = { mcq: "MCQ", numeric: "Numeric", open: "Open" };

export default async function QpExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("question_provider");
  const { id } = await params;
  const examId = parseInt(id);

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: { questions: { orderBy: (q, { asc }) => [asc(q.order)] } },
  });
  if (!exam) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            <Link href="/qp/exams" className="hover:opacity-70">Exams</Link> · {exam.title}
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">{exam.title}</h1>
          <p className="text-sm font-light text-foreground/60 mt-1">
            {exam.questions.length} question{exam.questions.length !== 1 ? "s" : ""} ·{" "}
            {exam.type} · {exam.published ? "Published" : "Draft"}
          </p>
        </div>
        <Link href={`/qp/exams/${examId}/questions/new`}>
          <Button variant="gold" size="sm">+ Add Question</Button>
        </Link>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[40px_3fr_1fr_60px_100px] gap-4 px-5 py-3 bg-muted/30">
          {["#", "Content", "Type", "Pts", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">{h}</span>
          ))}
        </div>

        {exam.questions.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            No questions yet.{" "}
            <Link href={`/qp/exams/${examId}/questions/new`} className="text-gate-gold hover:underline">
              Add the first one.
            </Link>
          </p>
        )}

        {exam.questions.map((q, idx) => (
          <div key={q.id} className="grid grid-cols-[40px_3fr_1fr_60px_100px] gap-4 px-5 py-4 items-center">
            <span className="text-xs font-light text-foreground/40">{idx + 1}</span>
            <p
              className="text-sm font-light text-foreground truncate"
              title={q.content.replace(/<[^>]*>/g, "")}
            >
              {q.content.replace(/<[^>]*>/g, "").slice(0, 80) || "(no text)"}
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
              {TYPE_LABEL[q.type] ?? q.type}
            </span>
            <p className="text-sm font-light text-foreground">{q.points}</p>
            <div className="flex items-center gap-3">
              <Link
                href={`/qp/exams/${examId}/questions/${q.id}/edit`}
                className="text-xs text-gate-gold hover:underline"
              >
                Edit
              </Link>
              <form action={deleteQuestion}>
                <input type="hidden" name="questionId" value={q.id} />
                <input type="hidden" name="examId" value={examId} />
                <button
                  type="submit"
                  className="text-xs text-destructive hover:underline"
                  onClick={(e) => {
                    if (!confirm("Delete this question?")) e.preventDefault();
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
