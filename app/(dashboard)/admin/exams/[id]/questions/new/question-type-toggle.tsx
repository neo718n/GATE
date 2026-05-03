"use client";

import { useState } from "react";

const TYPES = [
  { value: "mcq", label: "Multiple Choice", desc: "4+ options, one correct" },
  { value: "numeric", label: "Numeric", desc: "Exact number answer" },
  { value: "open", label: "Open-ended", desc: "Manual grading" },
] as const;

type QType = (typeof TYPES)[number]["value"];

export function QuestionTypeToggle() {
  const [type, setType] = useState<QType>("mcq");

  const toggle = (t: QType) => {
    setType(t);
    const mcq = document.getElementById("mcq-section");
    const numeric = document.getElementById("numeric-section");
    const open = document.getElementById("open-section");
    if (mcq) mcq.className = t === "mcq" ? "flex flex-col gap-4 border-0 p-0 m-0" : "hidden flex-col gap-4 border-0 p-0 m-0";
    if (numeric) numeric.className = t === "numeric" ? "flex flex-col gap-4 border-0 p-0 m-0" : "hidden flex-col gap-4 border-0 p-0 m-0";
    if (open) open.className = t === "open" ? "flex flex-col gap-4 border-0 p-0 m-0" : "hidden flex-col gap-4 border-0 p-0 m-0";
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="type" value={type} />
      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => toggle(t.value)}
            className={`flex flex-col gap-0.5 px-4 py-3 border rounded-xl text-left transition-all flex-1 ${
              type === t.value
                ? "border-gate-gold bg-gate-gold/8"
                : "border-border hover:border-foreground/30"
            }`}
          >
            <span className={`text-[11px] font-semibold ${type === t.value ? "text-gate-gold" : "text-foreground"}`}>
              {t.label}
            </span>
            <span className="text-[10px] font-light text-foreground/50">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
