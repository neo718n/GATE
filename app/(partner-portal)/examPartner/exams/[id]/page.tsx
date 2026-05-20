import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { requirePartnerStaff } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, questions } from "@/lib/db/schema";
import { ExamSettingsForm } from "@/components/partner/exam-settings-form";
import { AddQuestionForm } from "@/components/partner/add-question-form";
import { DeleteQuestionButton } from "@/components/partner/delete-question-button";

export const metadata = { title: "Edit exam" };

const TYPE_LABEL: Record<string, string> = {
  mcq: "MCQ",
  numeric: "Numeric",
  open: "Open",
};

export default async function PartnerExamBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { partnerId } = await requirePartnerStaff();
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isInteger(examId)) notFound();

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
  });
  if (!exam || exam.createdByPartnerId !== partnerId) notFound();

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.examId, examId))
    .orderBy(asc(questions.order));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/examPartner/exams"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Exams
        </Link>
        <h1 className="font-serif text-4xl font-light text-foreground">
          {exam.title}
        </h1>
        <p className="text-xs font-light text-muted-foreground">
          Launch with exam ID{" "}
          <code className="font-mono text-foreground">#{exam.id}</code> +
          your shared secret (set <code>exam_ref</code> = {exam.id}).
        </p>
      </div>

      <ExamSettingsForm
        examId={exam.id}
        title={exam.title}
        durationMinutes={exam.durationMinutes}
        shuffleQuestions={exam.shuffleQuestions}
        questionsPerSession={exam.questionsPerSession}
        instructions={exam.instructions}
        published={exam.published}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
            Questions ({qs.length})
          </h2>
          <Link
            href="/examPartner/pool"
            className="text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
          >
            + Add from pool
          </Link>
        </div>

        {qs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm font-light text-muted-foreground">
            No questions yet. Add one below or import from the pool.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {qs.map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-3 px-5 py-3 text-sm"
              >
                <span className="w-5 shrink-0 text-xs font-semibold text-foreground/40">
                  {i + 1}
                </span>
                <span className="flex-1 font-light text-foreground line-clamp-2">
                  {q.content}
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
                  {TYPE_LABEL[q.type] ?? q.type}
                </span>
                <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                  {q.points} pt
                </span>
                <DeleteQuestionButton examId={exam.id} questionId={q.id} />
              </div>
            ))}
          </div>
        )}

        <AddQuestionForm examId={exam.id} />
      </div>
    </div>
  );
}
