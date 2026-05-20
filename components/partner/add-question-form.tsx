"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createPartnerQuestion } from "@/lib/actions/partner-exam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type QType = "mcq" | "numeric" | "open";

const SELECT_CLASS =
  "h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground focus:border-gate-gold focus:outline-none";

const letter = (i: number) => String.fromCharCode(65 + i);

export function AddQuestionForm({ examId }: { examId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<QType>("mcq");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [numericAnswer, setNumericAnswer] = useState("");
  const [points, setPoints] = useState("1");
  const [explanation, setExplanation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setType("mcq");
    setContent("");
    setOptions(["", "", "", ""]);
    setCorrectIdx(0);
    setNumericAnswer("");
    setPoints("1");
    setExplanation("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      let opts: { id: string; text: string }[] | null = null;
      let correctAnswer: string | null = null;
      if (type === "mcq") {
        const filled = options.map((t) => t.trim());
        if (filled.filter(Boolean).length < 2) {
          throw new Error("Add at least two options");
        }
        opts = filled
          .map((text, i) => ({ id: letter(i), text }))
          .filter((o) => o.text);
        correctAnswer = letter(correctIdx);
        if (!opts.some((o) => o.id === correctAnswer)) {
          throw new Error("Select a valid correct option");
        }
      } else if (type === "numeric") {
        if (!numericAnswer.trim()) throw new Error("Enter the correct value");
        correctAnswer = numericAnswer.trim();
      }

      await createPartnerQuestion({
        examId,
        type,
        content,
        options: opts,
        correctAnswer,
        points: parseInt(points) || 1,
        explanation: explanation || null,
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add question
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <h3 className="font-serif text-lg font-light text-foreground">
        New question
      </h3>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="q-type">Type</Label>
          <select
            id="q-type"
            value={type}
            onChange={(e) => setType(e.target.value as QType)}
            className={SELECT_CLASS}
          >
            <option value="mcq">Multiple choice</option>
            <option value="numeric">Numeric</option>
            <option value="open">Open (manual grading)</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="q-points">Points</Label>
          <Input
            id="q-points"
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="q-content">Question</Label>
        <Textarea
          id="q-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Simplify 6/8 to lowest terms."
          required
        />
      </div>

      {type === "mcq" && (
        <div className="flex flex-col gap-2">
          <Label>Options (select the correct one)</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctIdx === i}
                onChange={() => setCorrectIdx(i)}
                className="h-4 w-4 accent-gate-gold"
                aria-label={`Mark ${letter(i)} correct`}
              />
              <span className="w-5 text-xs font-semibold text-foreground/60">
                {letter(i)}
              </span>
              <Input
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Option ${letter(i)}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setOptions(options.filter((_, j) => j !== i));
                    if (correctIdx >= options.length - 1) setCorrectIdx(0);
                  }}
                  className="text-foreground/40 hover:text-destructive"
                  aria-label="Remove option"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {options.length < 8 && (
            <button
              type="button"
              onClick={() => setOptions([...options, ""])}
              className="self-start text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
            >
              + Add option
            </button>
          )}
        </div>
      )}

      {type === "numeric" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="q-numeric">Correct value</Label>
          <Input
            id="q-numeric"
            value={numericAnswer}
            onChange={(e) => setNumericAnswer(e.target.value)}
            placeholder="42"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="q-explanation">Explanation (optional)</Label>
        <Textarea
          id="q-explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Shown to the student after grading."
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="gold" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add question"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
