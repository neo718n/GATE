"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startExamSession } from "@/lib/actions/exam";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function StartExamButton({ examId, disabled }: { examId: number; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    setError("");
    const result = await startExamSession(examId);
    if ("error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/participant/exams/${examId}/take`);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 max-w-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-destructive mb-1">
            Cannot Start
          </p>
          <p className="text-xs font-light text-destructive/80">{error}</p>
        </div>
      )}
      <Button
        onClick={handleStart}
        disabled={disabled || loading}
        variant="gold"
        size="md"
        className="min-w-[160px]"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Starting…</>
        ) : (
          "I'm ready — Start"
        )}
      </Button>
    </div>
  );
}
