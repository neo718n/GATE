"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePartnerQuestion } from "@/lib/actions/partner-exam";

export function DeleteQuestionButton({
  examId,
  questionId,
}: {
  examId: number;
  questionId: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this question?")) return;
        setBusy(true);
        try {
          await deletePartnerQuestion({ examId, questionId });
          router.refresh();
        } catch (err) {
          alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
          setBusy(false);
        }
      }}
      className="text-foreground/40 transition-colors hover:text-destructive disabled:opacity-50"
      aria-label="Delete question"
      title="Delete question"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
