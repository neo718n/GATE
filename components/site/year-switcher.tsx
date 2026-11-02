"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { getCurrentEdition, getEditions, isPast } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { splitLocale } from "@/lib/i18n/config";
import { Link, useLocale } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/**
 * Header control showing the featured year ("2027 ▾"). The list stacks
 * newest-first, so a new year in lib/editions.ts appears here on its own.
 */
export function YearSwitcher({
  onNavigate,
  align = "right",
  placement = "bottom",
}: {
  onNavigate?: () => void;
  align?: "left" | "right";
  placement?: "bottom" | "top";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const ru = locale === "ru";
  const { path } = splitLocale(usePathname());
  const editions = getEditions().map((e) => localizeEdition(e, locale));
  const current = localizeEdition(getCurrentEdition(), locale);
  const viewing = editions.find((e) => path === `/${e.slug}`) ?? current;

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ru ? `Год программы: ${viewing.name}. Выбрать другой` : `Program year: ${viewing.name}. Choose another year`}
        className="flex h-10 items-center gap-1.5 rounded-full border border-ink/10 bg-white/60 px-4 text-[13px] font-semibold tabular-nums text-ink transition-colors hover:border-gate-gold"
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", isPast(viewing) ? "bg-ink/30" : "animate-pulse bg-gate-gold")} />
        {viewing.year}
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: placement === "bottom" ? -8 : 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "bottom" ? -8 : 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "absolute z-50 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-[0_30px_60px_-25px_rgba(11,31,58,0.4)]",
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-bottom-left",
              placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
            )}
          >
            <span className="block px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-3">
              {ru ? "Годы программы" : "Program years"}
            </span>
            {editions.map((e) => {
              const active = e.slug === viewing.slug;
              return (
                <Link
                  key={e.slug}
                  role="menuitem"
                  href={`/${e.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-colors",
                    active ? "bg-ivory-2" : "hover:bg-ivory",
                  )}
                >
                  <span className="flex flex-col gap-0.5">
                    <span className={cn("text-[14px] font-semibold", active ? "text-ink" : "text-ink-2")}>{e.name}</span>
                    <span className="text-[12px] text-ink-3">
                      {e.city} · {e.shortDateLabel}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      isPast(e) ? "bg-ink/5 text-ink-3" : "bg-gate-gold/15 text-gate-gold",
                    )}
                  >
                    {isPast(e) ? (ru ? "Архив" : "Archive") : ru ? "Скоро" : "Upcoming"}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
