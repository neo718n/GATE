import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateQuestion } from "@/lib/actions/exam";
import { QuestionEditor } from "@/components/admin/question-editor";
import { MCQOptionsEditor } from "@/components/admin/mcq-options-editor";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string; qid: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id, qid } = await params;
  const examId = parseInt(id);
  const questionId = parseInt(qid);

  const [exam, question] = await Promise.all([
    db.query.exams.findFirst({ where: eq(exams.id, examId) }),
    db.query.questions.findFirst({ where: eq(questions.id, questionId) }),
  ]);
  if (!exam || !question) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin · <Link href={`/admin/exams/${examId}`} className="hover:opacity-70">{exam.title}</Link>
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Edit Question</h1>
      </div>

      <form action={updateQuestion} className="flex flex-col gap-6">
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="examId" value={examId} />
        <input type="hidden" name="type" value={question.type} />

        <div className="border border-gate-gold/30 bg-gate-gold/5 px-4 py-3 rounded-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
            Type: {question.type.toUpperCase()}
          </p>
        </div>

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Question Content
          </p>
          <div className="flex flex-col gap-2">
            <Label>Question text *</Label>
            <QuestionEditor name="content" defaultValue={question.content} />
          </div>
        </fieldset>

        {question.type === "mcq" && (
          <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
              Answer Options
            </p>
            <MCQOptionsEditor
              defaultOptions={(question.options as { id: string; text: string }[]) ?? undefined}
              defaultCorrect={question.correctAnswer ?? undefined}
            />
          </fieldset>
        )}

        {question.type === "numeric" && (
          <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
              Correct Answer
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="correctAnswer">Correct value</Label>
                <Input id="correctAnswer" name="correctAnswer" type="number" step="any" defaultValue={question.correctAnswer ?? ""} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tolerance">Tolerance (±)</Label>
                <Input id="tolerance" name="tolerance" type="number" step="any" min="0" defaultValue={question.tolerance ?? "0"} />
              </div>
            </div>
          </fieldset>
        )}

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Scoring & Explanation
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" name="points" type="number" min="1" defaultValue={question.points} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea id="explanation" name="explanation" rows={2} className="rounded-xl" defaultValue={question.explanation ?? ""} />
          </div>
        </fieldset>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="gold" size="md">Save Changes</Button>
          <Link href={`/admin/exams/${examId}`}>
            <Button type="button" variant="outline" size="md">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
