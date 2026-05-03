"use client";

import { useState } from "react";
import { gradeOpenAnswer } from "@/lib/actions/exam";
import { Button } from "@/components/ui/button";

export function GradeOpenAnswerForm({ answerId, maxPoints }: { answerId: number; maxPoints: number }) {
  const [points, setPoints] = useState(maxPoints);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (correct: boolean) => {
    setSubmitting(true);
    const fd = new FormData();
    fd.append("answerId", String(answerId));
    fd.append("isCorrect", String(correct));
    fd.append("pointsAwarded", correct ? String(points) : "0");
    await gradeOpenAnswer(fd);
    setSubmitting(false);
  };

  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="flex items-center gap-2">
        <label className="text-xs font-light text-foreground/60">Points:</label>
        <input
          type="number"
          min={0}
          max={maxPoints}
          value={points}
          onChange={(e) => setPoints(Math.min(maxPoints, Math.max(0, parseInt(e.target.value) || 0)))}
          className="w-16 h-8 rounded-lg border border-border bg-card px-2 text-xs font-light text-foreground focus:outline-none focus:border-gate-gold"
        />
        <span className="text-xs text-foreground/40">/ {maxPoints}</span>
      </div>
      <Button
        type="button"
        onClick={() => submit(true)}
        disabled={submitting}
        variant="outline"
        size="sm"
        className="text-green-600 border-green-500/30 hover:bg-green-50/10 text-xs"
      >
        Accept
      </Button>
      <Button
        type="button"
        onClick={() => submit(false)}
        disabled={submitting}
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
      >
        Reject
      </Button>
    </div>
  );
}
