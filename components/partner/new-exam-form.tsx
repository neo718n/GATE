"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createPartnerExam } from "@/lib/actions/partner-exam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewExamForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { examId } = await createPartnerExam({
        title,
        durationMinutes: duration ? parseInt(duration) : null,
      });
      router.push(`/examPartner/exams/${examId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exam");
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New exam
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <h3 className="font-serif text-lg font-light text-foreground">New exam</h3>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exam-title">Title</Label>
          <Input
            id="exam-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Math Grade 7"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="exam-duration">Duration (min)</Label>
          <Input
            id="exam-duration"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" variant="gold" size="sm" disabled={pending}>
          {pending ? "Creating…" : "Create & edit"}
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
