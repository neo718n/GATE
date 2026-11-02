"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, Check, ChevronDown, Search } from "lucide-react";
import { ru as ruCalendar } from "react-day-picker/locale/ru";
import { COUNTRIES, flagUrl } from "@/lib/phone-codes";
import { useLocale } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/* ───────────────────────── Field shell ───────────────────────── */

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.span
            key="e"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[12px] font-medium text-[#b03030]"
          >
            {error}
          </motion.span>
        ) : hint ? (
          <span className="text-[12px] text-ink-3">{hint}</span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const inputClass = (invalid?: boolean) =>
  cn(
    "h-12 w-full rounded-2xl border bg-white px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-3/70",
    "focus:border-gate-gold focus:shadow-[0_0_0_4px_rgba(201,153,58,0.15)]",
    invalid ? "border-[#b03030]/60" : "border-ink/10",
  );

// Anything outside basic Latin (Cyrillic, Arabic, accented letters…) is
// stripped as the user types, with a short notice explaining why.
const NON_LATIN = /[^\u0000-\u007F]/g;

export function LatinInput({
  value,
  onChange,
  invalid,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
}) {
  const [warned, setWarned] = useState(false);
  const ru = useLocale() === "ru";
  return (
    <div className="relative">
      <input
        {...rest}
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const clean = raw.replace(NON_LATIN, "");
          setWarned(clean !== raw);
          onChange(clean);
        }}
        className={inputClass(invalid)}
        autoComplete={rest.autoComplete ?? "off"}
        spellCheck={false}
      />
      <AnimatePresence>
        {warned && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-1 text-[11px] font-medium text-gate-gold"
          >
            {ru ? "Только латиница — как в загранпаспорте" : "Latin letters only — as written in the passport"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Chips ───────────────────────── */

export function ChipGroup<T extends string | number>({
  options,
  value,
  onChange,
  columns,
  layoutGroup,
}: {
  options: { value: T; label: string; disabled?: boolean; hint?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  columns?: string;
  layoutGroup: string;
}) {
  return (
    <div className={cn("grid gap-2", columns ?? "grid-cols-2 sm:grid-cols-3")}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "relative isolate flex min-h-12 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-[14px] font-semibold transition-colors",
              active ? "border-ink text-ivory" : "border-ink/10 bg-white text-ink hover:border-gate-gold",
              o.disabled && "cursor-not-allowed opacity-35 hover:border-ink/10",
            )}
          >
            {active && (
              <motion.span
                layoutId={`chip-${layoutGroup}`}
                className="absolute inset-0 -z-10 rounded-2xl bg-ink"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {o.label}
            {o.hint && <span className={cn("text-[10px] font-medium", active ? "text-ivory/70" : "text-ink-3")}>{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Popover hook ───────────────────────── */

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const popover = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { type: "spring" as const, stiffness: 420, damping: 32 },
};

/* ───────────────────────── Country select ───────────────────────── */

// The shared list surfaces CIS countries first; the form shows plain A–Z.
const COUNTRIES_AZ = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, "en"));

export function CountrySelect({
  value,
  onChange,
  invalid,
  id,
}: {
  value: string;
  onChange: (name: string) => void;
  invalid?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ru = useLocale() === "ru";
  const ref = useDismiss(open, () => setOpen(false));
  const selected = COUNTRIES_AZ.find((c) => c.name === value);
  const list = useMemo(
    () => (q ? COUNTRIES_AZ.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : COUNTRIES_AZ),
    [q],
  );

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(inputClass(invalid), "flex items-center justify-between text-left")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("flex items-center gap-2.5", !selected && "text-ink-3/70")}>
          {selected && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={flagUrl(selected.iso2)} alt="" width={20} height={14} className="rounded-[3px]" />
          )}
          {selected?.name ?? (ru ? "Выберите страну" : "Select country")}
        </span>
        <ChevronDown className="h-4 w-4 text-ink-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...popover}
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-25px_rgba(11,31,58,0.4)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search className="h-4 w-4 text-ink-3" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={ru ? "Поиск (латиницей)" : "Search"}
                className="h-11 w-full bg-transparent text-[14px] outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-64 overflow-y-auto p-1.5" data-lenis-prevent>
              {list.map((c) => (
                <li key={c.iso2}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.name);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[14px] text-ink hover:bg-ivory"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(c.iso2)} alt="" width={20} height={14} className="rounded-[3px]" />
                    <span className="flex-1">{c.name}</span>
                    {c.name === value && <Check className="h-4 w-4 text-gate-gold" />}
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="px-3 py-4 text-[13px] text-ink-3">{ru ? "Ничего не найдено" : "No match"}</li>}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Date of birth ─────────────────────────
   Styled after Watermelon UI "DatePicker 1" (rounded trigger + popover
   calendar), with month/year dropdowns so a birth year is one click away. */

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function DateOfBirthPicker({
  value,
  onChange,
  invalid,
  id,
}: {
  value: string;
  onChange: (iso: string) => void;
  invalid?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;
  const now = new Date();
  const fallbackMonth = new Date(now.getFullYear() - 12, 0, 1);
  const labelId = useId();
  const ru = useLocale() === "ru";

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-describedby={labelId}
        className={cn(inputClass(invalid), "flex items-center justify-between text-left")}
      >
        <span className={selected ? "text-ink" : "text-ink-3/70"}>
          {selected
            ? selected.toLocaleDateString(ru ? "ru-RU" : "en-GB", { day: "numeric", month: "long", year: "numeric" })
            : ru
              ? "Выберите дату"
              : "Pick a date"}
        </span>
        <CalendarDays className="h-4 w-4 text-ink-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...popover}
            className="gate-daypicker absolute left-0 top-full z-30 mt-2 rounded-3xl border border-line bg-white p-4 shadow-[0_30px_60px_-25px_rgba(11,31,58,0.4)]"
          >
            <DayPicker
              mode="single"
              captionLayout="dropdown"
              startMonth={new Date(now.getFullYear() - 22, 0)}
              endMonth={new Date(now.getFullYear() - 4, 11)}
              defaultMonth={selected ?? fallbackMonth}
              selected={selected}
              onSelect={(d) => {
                if (!d) return;
                onChange(toIso(d));
                setOpen(false);
              }}
              weekStartsOn={1}
              locale={ru ? ruCalendar : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <span id={labelId} className="sr-only">
        {ru ? "Дата рождения" : "Date of birth"}
      </span>
    </div>
  );
}
