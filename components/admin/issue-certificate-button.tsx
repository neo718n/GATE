"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { issueCertificate } from "@/lib/certificates/issue";

export function IssueCertificateButton({ resultId }: { resultId: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function issue() {
    setError(null);
    startTransition(async () => {
      try {
        await issueCertificate({ resultId });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to issue");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="gold"
        size="sm"
        onClick={issue}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Issuing…
          </>
        ) : (
          <>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Issue
          </>
        )}
      </Button>
      {error && (
        <p className="text-[10px] font-light text-destructive">{error}</p>
      )}
    </div>
  );
}
