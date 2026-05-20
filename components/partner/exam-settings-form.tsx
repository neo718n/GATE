"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updatePartnerExam,
  togglePublishPartnerExam,
  deletePartnerExam,
} from "@/lib/actions/partner-exam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ExamSettingsForm({
  examId,
  title: initialTitle,
  durationMinutes,
  shuffleQuestions: initialShuffle,
  questionsPerSession,
  instructions: initialInstructions,
  published,
}: {
  examId: number;
  title: string;
  durationMinutes: number | null;
  shuffleQuestions: boolean;
  questionsPerSession: number | null;
  instructions: string | null;
  published: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [duration, setDuration] = useState(
    durationMinutes != null ? String(durationMinutes) : "",
  );
  const [perSession, setPerSession] = useState(
    questionsPerSession != null ? String(questionsPerSession) : "",
  );
  const [shuffle, setShuffle] = useState(initialShuffle);
  const [instructions, setInstructions] = useState(initialInstructions ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("save");
    try {
      await updatePartnerExam({
        examId,
        title,
        durationMinutes: duration ? parseInt(duration) : null,
        questionsPerSession: perSession ? parseInt(perSession) : null,
        shuffleQuestions: shuffle,
        instructions: instructions || null,
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(null);
    }
  }

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Settings
        </h2>
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
            published
              ? "text-green-700 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {published ? "Live" : "Draft"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="e-title">Title</Label>
        <Input
          id="e-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-duration">Duration (min)</Label>
          <Input
            id="e-duration"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="No limit"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-per-session">Questions per session</Label>
          <Input
            id="e-per-session"
            type="number"
            min={1}
            value={perSession}
            onChange={(e) => setPerSession(e.target.value)}
            placeholder="All"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-light text-foreground">
        <input
          type="checkbox"
          checked={shuffle}
          onChange={(e) => setShuffle(e.target.checked)}
          className="h-4 w-4 accent-gate-gold"
        />
        Shuffle questions
      </label>

      <div className="flex flex-col gap-2">
        <Label htmlFor="e-instructions">Instructions (optional)</Label>
        <Textarea
          id="e-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="gold" size="sm" disabled={busy !== null}>
          {busy === "save" ? "Saving…" : "Save"}
        </Button>
        {saved && (
          <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={async () => {
            setBusy("publish");
            try {
              await togglePublishPartnerExam(examId);
              router.refresh();
            } finally {
              setBusy(null);
            }
          }}
        >
          {published ? "Unpublish" : "Publish"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy !== null}
          onClick={async () => {
            if (!confirm("Delete this exam and all its questions?")) return;
            setBusy("delete");
            try {
              await deletePartnerExam(examId);
              router.push("/examPartner/exams");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to delete");
              setBusy(null);
            }
          }}
          className="ml-auto text-destructive hover:bg-destructive/8"
        >
          Delete exam
        </Button>
      </div>
    </form>
  );
}
