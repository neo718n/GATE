"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col border border-gate-fog">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-b border-gate-fog/70 last:border-0">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-6 px-8 py-6 text-left group"
            >
              <span className="text-sm font-semibold text-gate-800 leading-snug">
                {item.q}
              </span>
              <span
                className={cn(
                  "mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center border text-xs font-light transition-colors",
                  isOpen
                    ? "border-gate-gold/60 text-gate-gold"
                    : "border-gate-800/25 text-gate-800/45 group-hover:border-gate-800/50 group-hover:text-gate-800/70",
                )}
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-8 pb-7">
                <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
