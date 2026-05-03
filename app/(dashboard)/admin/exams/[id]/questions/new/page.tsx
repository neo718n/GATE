import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createQuestion } from "@/lib/actions/exam";
import { QuestionEditor } from "@/components/admin/question-editor";
import { MCQOptionsEditor } from "@/components/admin/mcq-options-editor";
import { QuestionTypeToggle } from "./question-type-toggle";

export default async function NewQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;
  const examId = parseInt(id);

  const exam = await db.query.exams.findFirst({ where: eq(exams.id, examId) });
  if (!exam) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin · <Link href="/admin/exams" className="hover:opacity-70">Exams</Link> ·{" "}
          <Link href={`/admin/exams/${examId}`} className="hover:opacity-70">{exam.title}</Link>
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">New Question</h1>
      </div>

      <form action={createQuestion} className="flex flex-col gap-6">
        <input type="hidden" name="examId" value={examId} />

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Question Type
          </p>
          <QuestionTypeToggle />
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Question Content
          </p>
          <div className="flex flex-col gap-2">
            <Label>Question text *</Label>
            <QuestionEditor name="content" placeholder="Type your question here. Use the Formula button to add math." />
          </div>
        </fieldset>

        {/* MCQ Options — shown/hidden via JS by QuestionTypeToggle */}
        <fieldset id="mcq-section" className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Answer Options
          </p>
          <p className="text-xs font-light text-foreground/50">Click the circle to mark the correct answer.</p>
          <MCQOptionsEditor />
        </fieldset>

        {/* Numeric answer */}
        <fieldset id="numeric-section" className="hidden flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Correct Answer
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="correctAnswer-num">Correct value</Label>
              <Input id="correctAnswer-num" name="correctAnswer" type="number" step="any" placeholder="e.g. 42 or 3.14" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tolerance">Tolerance (±)</Label>
              <Input id="tolerance" name="tolerance" type="number" step="any" min="0" placeholder="0" />
            </div>
          </div>
        </fieldset>

        {/* Open answer has no correct answer */}
        <fieldset id="open-section" className="hidden flex-col gap-4 border-0 p-0 m-0">
          <div className="border border-border bg-muted/20 px-4 py-3 rounded-xl">
            <p className="text-xs font-light text-foreground/60">
              Open-ended answers are graded manually by admins after submission.
            </p>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Scoring & Explanation
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" name="points" type="number" min="1" defaultValue="1" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="explanation">Explanation (shown after exam)</Label>
            <Textarea id="explanation" name="explanation" rows={2} className="rounded-xl" placeholder="Optional: explain the correct answer..." />
          </div>
        </fieldset>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="gold" size="md">Save Question</Button>
          <Link href={`/admin/exams/${examId}`}>
            <Button type="button" variant="outline" size="md">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
