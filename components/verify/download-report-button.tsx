"use client";

import { useState } from "react";
import { AlertCircle, Check, FileDown, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/client";

type State = "idle" | "loading" | "done" | "error";

export function DownloadReportButton({ cardNo }: { cardNo: string }) {
  const [state, setState] = useState<State>("idle");
  const ru = useLocale() === "ru";

  async function download() {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch(`/verify/${encodeURIComponent(cardNo)}/performance/pdf`);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GATE-Diagnostic-Report-${cardNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3500);
    }
  }

  const label = {
    idle: ru ? "Скачать диагностический отчёт" : "Download Diagnostic Report",
    loading: ru ? "Готовим отчёт…" : "Preparing your report…",
    done: ru ? "Скачано" : "Downloaded",
    error: ru ? "Не получилось — попробуйте ещё раз" : "Couldn't generate — try again",
  }[state];

  const Icon = { idle: FileDown, loading: Loader2, done: Check, error: AlertCircle }[state];

  return (
    <button
      type="button"
      onClick={download}
      disabled={state === "loading"}
      aria-live="polite"
      className="group relative inline-flex w-full sm:w-auto shrink-0 whitespace-nowrap items-center justify-center gap-2 overflow-hidden rounded-xl bg-gate-800 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(11,31,58,0.55)] ring-1 ring-gate-gold/40 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(201,153,58,0.45)] disabled:cursor-wait disabled:translate-y-0 dark:bg-gate-gold dark:text-gate-900 print:hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[300%]"
      />
      <Icon
        className={`h-4 w-4 shrink-0 ${state === "loading" ? "animate-spin" : ""} ${state === "idle" ? "text-gate-gold dark:text-gate-900" : ""}`}
        aria-hidden
      />
      <span>{label}</span>
    </button>
  );
}
