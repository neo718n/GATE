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
    <div className="flex flex-col border border-border">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-b border-border last:border-0">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-6 px-8 py-6 text-left group"
            >
              <span className="text-sm font-semibold text-foreground leading-snug">
                {item.q}
              </span>
              <span
                className={cn(
                  "mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center border text-xs font-light transition-colors",
                  isOpen
                    ? "border-gate-gold/60 text-gate-gold"
                    : "border-foreground/25 text-foreground/45 group-hover:border-foreground/50 group-hover:text-foreground/70",
                )}
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-8 pb-7">
                <p className="text-sm font-light text-foreground/65 leading-[1.9]">
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
