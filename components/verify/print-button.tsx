"use client";

import { Printer } from "lucide-react";
import { useLocale } from "@/lib/i18n/client";

export function PrintButton() {
  const ru = useLocale() === "ru";
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors print:hidden"
    >
      <Printer className="h-3.5 w-3.5" aria-hidden />
      {ru ? "Печать" : "Print"}
    </button>
  );
}
