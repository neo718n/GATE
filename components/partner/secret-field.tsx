"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Masked secret display with eye-reveal + copy-to-clipboard.
 * Used in the admin integrations panel and the partner portal credentials page.
 */
export function SecretField({
  label,
  value,
  defaultHidden = true,
  mono = true,
}: {
  label: string;
  value: string;
  defaultHidden?: boolean;
  mono?: boolean;
}) {
  const [hidden, setHidden] = useState(defaultHidden);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <code
          className={cn(
            "flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground",
            mono && "font-mono",
          )}
        >
          {hidden ? "•".repeat(Math.min(Math.max(value.length, 8), 40)) : value}
        </code>
        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          className={iconBtn}
          aria-label={hidden ? "Reveal" : "Hide"}
          title={hidden ? "Reveal" : "Hide"}
        >
          {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={copy}
          className={iconBtn}
          aria-label="Copy"
          title="Copy"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
