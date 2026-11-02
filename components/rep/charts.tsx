"use client";

import { motion } from "motion/react";
import { Counter } from "@/components/site/motion/reveal";

export function StatCard({ label, value, hint, accent }: { label: string; value: number; hint?: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 rounded-[1.75rem] p-6 ${accent ? "bg-ink text-ivory" : "border border-line bg-white"}`}>
      <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${accent ? "text-gate-gold-2" : "text-ink-3"}`}>{label}</span>
      <Counter value={String(value)} className={`font-serif text-5xl font-medium ${accent ? "text-white" : "text-ink"}`} />
      {hint && <span className={`text-[12px] ${accent ? "text-ivory/60" : "text-ink-3"}`}>{hint}</span>}
    </div>
  );
}

/** Horizontal bars that grow in on first view. */
export function BarList({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-5 rounded-[1.75rem] border border-line bg-white p-6">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-3">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <li key={r.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-ink">{r.label}</span>
                <span className="tabular-nums text-ink-3">{r.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ivory-2">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(r.value / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-gate-gold to-gate-gold-2"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
