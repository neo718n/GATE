"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";

export function ShareLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={
        copied
          ? "Verification link copied"
          : `Copy verification link ${url}`
      }
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          Copied
        </>
      ) : (
        <>
          <LinkIcon className="h-3.5 w-3.5" aria-hidden />
          Share verification link
        </>
      )}
    </button>
  );
}
