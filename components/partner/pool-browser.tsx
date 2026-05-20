"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bulkCloneQuestionsToExam } from "@/lib/actions/partner-exam";
import { Button } from "@/components/ui/button";

type PoolQuestion = {
  id: number;
  content: string;
  type: string;
  points: number;
  examTitle: string | null;
  subjectName: string | null;
  difficulty: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  mcq: "MCQ",
  numeric: "Numeric",
  open: "Open",
};

export function PoolBrowser({
  questions,
  partnerExams,
}: {
  questions: PoolQuestion[];
  partnerExams: { id: number; title: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [target, setTarget] = useState<string>(
    partnerExams[0] ? String(partnerExams[0].id) : "",
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function addSelected() {
    if (!target || selected.size === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const { added } = await bulkCloneQuestionsToExam({
        targetExamId: Number(target),
        questionIds: [...selected],
      });
      setMsg(`Added ${added} question${added === 1 ? "" : "s"}.`);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 backdrop-blur">
        <span className="text-xs font-semibold text-foreground">
          {selected.size} selected
        </span>
        <div className="ml-auto flex items-center gap-2">
          {partnerExams.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Create an exam first to add questions.
            </span>
          ) : (
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:border-gate-gold focus:outline-none"
            >
              {partnerExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} (#{e.id})
                </option>
              ))}
            </select>
          )}
          <Button
            variant="gold"
            size="sm"
            disabled={busy || selected.size === 0 || !target}
            onClick={addSelected}
          >
            {busy ? "Adding…" : `Add to exam`}
          </Button>
        </div>
      </div>

      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm font-light text-muted-foreground">
          No questions match your filters.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {questions.map((q) => (
            <label
              key={q.id}
              className="flex cursor-pointer items-start gap-3 px-5 py-3 text-sm hover:bg-muted/40"
            >
              <input
                type="checkbox"
                checked={selected.has(q.id)}
                onChange={() => toggle(q.id)}
                className="mt-0.5 h-4 w-4 accent-gate-gold"
              />
              <span className="flex-1 font-light text-foreground line-clamp-2">
                {q.content}
              </span>
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                {TYPE_LABEL[q.type] ?? q.type}
              </span>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {q.subjectName ?? q.examTitle ?? "—"}
              </span>
              <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                {q.points} pt
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
