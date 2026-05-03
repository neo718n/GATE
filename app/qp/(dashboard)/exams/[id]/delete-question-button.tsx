"use client";

import { deleteQuestion } from "@/lib/actions/exam";

export function DeleteQuestionButton({ questionId, examId }: { questionId: number; examId: number }) {
  return (
    <form
      action={deleteQuestion}
      onSubmit={(e) => {
        if (!confirm("Delete this question?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="examId" value={examId} />
      <button type="submit" className="text-xs text-destructive hover:underline">
        Delete
      </button>
    </form>
  );
}
