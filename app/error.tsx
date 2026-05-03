"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="flex flex-col gap-4 max-w-md text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-red-500">
              Something went wrong
            </p>
            <p className="text-sm font-light text-foreground/60">
              An unexpected error occurred. Please try again.
            </p>
            <Button variant="outline" size="sm" onClick={reset} className="mx-auto">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}