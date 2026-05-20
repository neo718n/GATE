"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { updatePartnerReturnOrigins } from "@/lib/actions/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReturnOriginsEditor({
  partnerId,
  initial,
}: {
  partnerId: number;
  initial: string[];
}) {
  const router = useRouter();
  const [origins, setOrigins] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function add() {
    const t = draft.trim();
    if (!t) return;
    let origin: string;
    try {
      origin = new URL(t).origin;
    } catch {
      setError("Enter a full URL, e.g. https://arcmc.com");
      return;
    }
    setError(null);
    if (!origins.includes(origin)) setOrigins([...origins, origin]);
    setDraft("");
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await updatePartnerReturnOrigins(partnerId, origins);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
        Allowed return origins
      </h2>
      <p className="text-xs font-light text-muted-foreground">
        After an exam, students are redirected to the token&apos;s{" "}
        <code>return_url</code> only if its origin is listed here. Leave empty to
        allow any origin from the partner&apos;s signed token.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {origins.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {origins.map((o) => (
            <span
              key={o}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground"
            >
              {o}
              <button
                type="button"
                onClick={() => setOrigins(origins.filter((x) => x !== o))}
                className="text-foreground/40 hover:text-destructive"
                aria-label={`Remove ${o}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://arcmc.com"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          Add
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="gold" size="sm" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save origins"}
        </Button>
        {saved && (
          <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
        )}
      </div>
    </div>
  );
}
