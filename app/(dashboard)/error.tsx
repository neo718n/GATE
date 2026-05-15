"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4 max-w-md py-16">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-red-500">
        Something went wrong
      </p>
      <p className="text-sm font-light text-foreground/60">
        An unexpected error occurred while loading this page.
      </p>
      {error.digest && (
        <p className="text-[10px] font-mono text-foreground/40">digest: {error.digest}</p>
      )}
      {error.message && (
        <pre className="text-xs font-mono text-red-700 bg-red-50 border border-red-200 p-3 rounded whitespace-pre-wrap break-words max-w-xl">
          {error.message}
        </pre>
      )}
      <Button variant="outline" size="sm" onClick={reset} className="w-fit">
        Try again
      </Button>
    </div>
  );
}