"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface MCQOptionsEditorProps {
  defaultOptions?: Option[];
  defaultCorrect?: string;
}

export function MCQOptionsEditor({ defaultOptions, defaultCorrect }: MCQOptionsEditorProps) {
  const [options, setOptions] = useState<Option[]>(
    defaultOptions && defaultOptions.length > 0
      ? defaultOptions
      : [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" },
        ]
  );
  const [correct, setCorrect] = useState(defaultCorrect ?? "");

  const addOption = () => {
    const ids = "ABCDEFGHIJ";
    const next = ids[options.length] ?? String(options.length + 1);
    setOptions((o) => [...o, { id: next, text: "" }]);
  };

  const removeOption = (id: string) => {
    setOptions((o) => o.filter((opt) => opt.id !== id));
    if (correct === id) setCorrect("");
  };

  const updateText = (id: string, text: string) => {
    setOptions((o) => o.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="options" value={JSON.stringify(options)} />
      <input type="hidden" name="correctAnswer" value={correct} />

      {options.map((opt) => (
        <div key={opt.id} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCorrect(opt.id)}
            className={`w-7 h-7 rounded-full border-2 text-[11px] font-bold shrink-0 transition-all ${
              correct === opt.id
                ? "border-gate-gold bg-gate-gold text-white"
                : "border-border text-foreground/40 hover:border-gate-gold/50"
            }`}
            title="Mark as correct"
          >
            {opt.id}
          </button>
          <input
            type="text"
            value={opt.text}
            onChange={(e) => updateText(opt.id, e.target.value)}
            placeholder={`Option ${opt.id}`}
            className="flex-1 h-10 rounded-xl border border-border bg-card px-3 text-sm font-light text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(opt.id)}
              className="text-foreground/30 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      {options.length < 6 && (
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1.5 text-xs font-light text-foreground/50 hover:text-gate-gold transition-colors self-start"
        >
          <Plus className="h-3.5 w-3.5" />
          Add option
        </button>
      )}

      {correct && (
        <p className="text-[10px] text-green-600 font-medium">
          Correct answer: Option {correct}
        </p>
      )}
    </div>
  );
}
