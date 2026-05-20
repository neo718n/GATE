"use client";

import { useState } from "react";
import { generateSampleLaunchToken } from "@/lib/actions/partner-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecretField } from "@/components/partner/secret-field";

export function SampleLaunchTester({
  exams,
}: {
  exams: { id: number; title: string }[];
}) {
  const [examId, setExamId] = useState(exams[0] ? String(exams[0].id) : "");
  const [externalUserId, setExternalUserId] = useState("");
  const [grade, setGrade] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ token: string; url: string } | null>(
    null,
  );

  if (exams.length === 0) {
    return (
      <p className="text-xs font-light text-muted-foreground">
        Create and publish an exam first to generate a test launch.
      </p>
    );
  }

  async function generate() {
    setError(null);
    setBusy(true);
    try {
      const r = await generateSampleLaunchToken({
        examId: Number(examId),
        externalUserId: externalUserId || undefined,
        grade: grade || undefined,
      });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-exam">Exam</Label>
          <select
            id="t-exam"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:border-gate-gold focus:outline-none"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} (#{e.id})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-user">External user id</Label>
          <Input
            id="t-user"
            value={externalUserId}
            onChange={(e) => setExternalUserId(e.target.value)}
            placeholder="stu_test_1"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-grade">Grade (optional)</Label>
          <Input
            id="t-grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="G7"
          />
        </div>
      </div>
      <div>
        <Button variant="gold" size="sm" disabled={busy} onClick={generate}>
          {busy ? "Generating…" : "Generate token + URL"}
        </Button>
      </div>

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <SecretField label="Launch token" value={result.token} />
          <SecretField label="Launch URL" value={result.url} defaultHidden={false} />
          <a
            href={result.url}
            target="_blank"
            rel="noreferrer"
            className="self-start text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
          >
            Open launch ▷
          </a>
        </div>
      )}
    </div>
  );
}
