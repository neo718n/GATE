"use client";

import { useState } from "react";

const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1));

export function GradesSelector({ defaultGrades = [] }: { defaultGrades?: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultGrades);

  const toggle = (g: string) =>
    setSelected((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Visually hidden required sentinel — browser blocks submit when no grade selected */}
      <input
        type="text"
        value={selected.length > 0 ? "ok" : ""}
        onChange={() => {}}
        required
        aria-hidden
        tabIndex={-1}
        className="sr-only pointer-events-none"
        onInvalid={(e) =>
          (e.target as HTMLInputElement).setCustomValidity(
            "Please select at least one target grade.",
          )
        }
        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
      />

      <div className="flex flex-wrap gap-3">
        {GRADES.map((g) => (
          <label key={g} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="grades"
              value={g}
              checked={selected.includes(g)}
              onChange={() => toggle(g)}
              className="w-4 h-4 rounded border-border accent-gate-gold"
            />
            <span className="text-sm font-light text-foreground">Grade {g}</span>
          </label>
        ))}
      </div>

      {selected.length === 0 && (
        <p className="text-[11px] text-destructive/80">
          At least one grade must be selected.
        </p>
      )}
    </div>
  );
}
