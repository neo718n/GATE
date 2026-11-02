"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { localizePath, splitLocale, type Locale } from "@/lib/i18n/config";
import { rememberLocale, useLocale } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Locale; label: string; title: string }[] = [
  { value: "en", label: "EN", title: "English" },
  { value: "ru", label: "RU", title: "Русский" },
];

/** Remembers the choice and reloads the same page in the other language. */
function switchTo(next: Locale) {
  rememberLocale(next);
  // The visible URL, not usePathname(): on apply.* and partners.* the
  // router path is the rewritten internal one (/apply/…, /rep/…).
  const { path } = splitLocale(window.location.pathname);
  window.location.assign(localizePath(path, next) + window.location.search + window.location.hash);
}

/** EN | RU segmented toggle, for places with room (portals, rep sidebar). */
export function LanguageSwitcher({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const locale = useLocale();

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "relative flex h-10 items-center rounded-full p-1",
        tone === "light" ? "border border-ink/10 bg-white/60" : "bg-white/10",
        className,
      )}
    >
      {OPTIONS.map((o) => {
        const active = o.value === locale;
        return (
          <button
            key={o.value}
            type="button"
            title={o.title}
            aria-pressed={active}
            onClick={() => !active && switchTo(o.value)}
            className={cn(
              "relative isolate h-8 rounded-full px-3 text-[12px] font-semibold tracking-[0.08em] transition-colors",
              active ? (tone === "light" ? "text-ivory" : "text-ink") : tone === "light" ? "text-ink-3 hover:text-ink" : "text-white/60 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId={`lang-${tone}`}
                className={cn("absolute inset-0 -z-10 rounded-full", tone === "light" ? "bg-ink" : "bg-white")}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Compact "🌐 RU ▾" dropdown for the site header. */
export function LanguageMenu({
  align = "right",
  placement = "bottom",
}: {
  align?: "left" | "right";
  placement?: "bottom" | "top";
}) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
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
        aria-label={locale === "ru" ? "Язык сайта" : "Site language"}
        className="flex h-10 items-center gap-1.5 rounded-full border border-ink/10 bg-white/60 px-3 text-[13px] font-semibold text-ink transition-colors hover:border-gate-gold"
      >
        <Globe className="h-3.5 w-3.5 text-ink-3" />
        {locale.toUpperCase()}
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
              "absolute z-50 w-44 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[0_30px_60px_-25px_rgba(11,31,58,0.4)]",
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-bottom-left",
              placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
            )}
          >
            {OPTIONS.map((o) => {
              const active = o.value === locale;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={o.value}
                  onClick={() => (active ? setOpen(false) : switchTo(o.value))}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
                    active ? "bg-ivory-2 font-semibold text-ink" : "text-ink-2 hover:bg-ivory",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 text-[11px] font-semibold tracking-[0.08em] text-ink-3">{o.label}</span>
                    {o.title}
                  </span>
                  {active && <Check className="h-4 w-4 text-gate-gold" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
