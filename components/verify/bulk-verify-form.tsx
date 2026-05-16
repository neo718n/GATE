"use client";

import { useRef, useState, useTransition } from "react";
import {
  Upload,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCode, isValidCodeShape } from "@/lib/certificates/code";

type Row = {
  code: string;
  status: "verified" | "revoked" | "not_found" | "invalid";
  name?: string;
  subject?: string;
  award?: string;
};

const MAX_CODES = 50;

function parseCsvText(text: string): string[] {
  return text
    .split(/[\r\n]+/)
    .map((line) => line.split(",")[0]?.trim() ?? "")
    .filter(Boolean);
}

function toCsv(rows: Row[]): string {
  const header = "code,status,name,subject,award";
  const lines = rows.map((r) =>
    [r.code, r.status, r.name ?? "", r.subject ?? "", r.award ?? ""]
      .map((c) => `"${c.replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export function BulkVerifyForm() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  }

  function submit() {
    setError(null);
    const raw = parseCsvText(text);
    if (!raw.length) {
      setError("Please paste at least one code or upload a CSV.");
      return;
    }
    if (raw.length > MAX_CODES) {
      setError(`Maximum ${MAX_CODES} codes per request.`);
      return;
    }
    const codes = raw.map(formatCode);

    startTransition(async () => {
      const res = await fetch("/api/verify/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      });
      if (res.status === 429) {
        setError(
          "Too many bulk requests. Please wait a minute and try again.",
        );
        return;
      }
      if (!res.ok) {
        setError(`Verification failed (${res.status}).`);
        return;
      }
      const data = (await res.json()) as {
        results: Array<{
          code: string;
          status: Row["status"];
          certificate?: {
            participantName: string;
            subjectName: string;
            award: string;
          };
        }>;
      };
      setRows(
        data.results.map((r) => ({
          code: r.code,
          status: r.status,
          name: r.certificate?.participantName,
          subject: r.certificate?.subjectName,
          award: r.certificate?.award,
        })),
      );
    });
  }

  function downloadCsv() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gate-verify-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <label
          htmlFor="bulk-codes"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Verification codes
        </label>
        <textarea
          id="bulk-codes"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"GATE-2026-MATH-A7K9X2\nGATE-2026-PHYS-Z2N4P9\n…"}
          aria-describedby="bulk-hint"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-foreground/30 focus-visible:outline-none focus-visible:border-gate-gold focus-visible:ring-2 focus-visible:ring-gate-gold/20"
        />
        <div
          id="bulk-hint"
          className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/55"
        >
          <p>
            One code per line. Up to {MAX_CODES} codes per request. CSV (single
            column or with `code` header) supported.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Upload CSV
          </button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={isPending}
            onClick={submit}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Verifying…
              </>
            ) : (
              "Verify all codes"
            )}
          </Button>
          {rows.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={downloadCsv}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download CSV
            </Button>
          )}
        </div>
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50 border-b border-border">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Award</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.code} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {r.code}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {r.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {r.subject ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground/80 capitalize">
                      {r.award?.replace(/_/g, " ") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-500 text-xs font-semibold">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Verified
      </span>
    );
  if (status === "revoked")
    return (
      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500 text-xs font-semibold">
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
        Revoked
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-destructive text-xs font-semibold">
      <ShieldX className="h-3.5 w-3.5" aria-hidden />
      {status === "invalid" ? "Invalid" : "Not found"}
    </span>
  );
}
