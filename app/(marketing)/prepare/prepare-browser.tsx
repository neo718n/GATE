"use client";

import { useMemo, useState } from "react";
import { Link, useLocale } from "@/lib/i18n/client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight, FileText, Lock } from "lucide-react";
import {
  GRADE_BANDS,
  PREP_KIND_LABEL,
  PREP_RESOURCES,
  PREP_SUBJECTS,
  PREP_SUBJECT_RU,
  type GradeBand,
  type PrepKind,
  type PrepSubject,
} from "@/lib/prepare";
import { cn } from "@/lib/utils";

const KINDS: PrepKind[] = ["past-paper", "sample"];

function Chip({
  active,
  onClick,
  children,
  group,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  group: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative isolate h-10 rounded-full px-4 text-[13px] font-semibold transition-colors",
        active ? "text-ivory" : "text-ink-2 hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId={`chip-${group}`}
          className="absolute inset-0 -z-10 rounded-full bg-ink"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      {children}
    </button>
  );
}

export function PrepareBrowser() {
  const locale = useLocale();
  const ru = locale === "ru";
  const [subject, setSubject] = useState<PrepSubject | null>(null);
  const [band, setBand] = useState<GradeBand | null>(null);

  const filtered = useMemo(
    () => PREP_RESOURCES.filter((r) => (!subject || r.subject === subject) && (!band || r.bands.includes(band))),
    [subject, band],
  );

  return (
    <div className="flex flex-col gap-14">
      <div className="glass sticky top-24 z-20 flex flex-col gap-3 rounded-[1.75rem] p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">{ru ? "Предмет" : "Subject"}</span>
          <Chip group="subject" active={!subject} onClick={() => setSubject(null)}>
            {ru ? "Все" : "All"}
          </Chip>
          {PREP_SUBJECTS.map((s) => (
            <Chip key={s} group="subject" active={subject === s} onClick={() => setSubject(s)}>
              {ru ? PREP_SUBJECT_RU[s] : s}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">{ru ? "Классы" : "Grades"}</span>
          <Chip group="band" active={!band} onClick={() => setBand(null)}>
            {ru ? "Все" : "All"}
          </Chip>
          {GRADE_BANDS.map((b) => (
            <Chip key={b} group="band" active={band === b} onClick={() => setBand(b)}>
              {b}
            </Chip>
          ))}
        </div>
      </div>

      {KINDS.map((kind) => {
        const items = filtered.filter((r) => r.kind === kind);
        return (
          <section key={kind} className="flex flex-col gap-6">
            <div className="flex items-baseline gap-4">
              <h2 className="font-serif text-3xl font-medium text-ink md:text-5xl">{PREP_KIND_LABEL[locale][kind]}</h2>
              <div className="h-px flex-1 bg-line" />
              <motion.span
                key={items.length}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-serif text-2xl tabular-nums text-ink-3"
              >
                {items.length}
              </motion.span>
            </div>

            {items.length === 0 ? (
              <p className="rounded-[1.5rem] border border-dashed border-ink/15 px-6 py-10 text-center text-[15px] text-ink-3">
                {kind === "sample"
                  ? ru
                    ? "Примеры задач по каждому предмету появятся здесь до начала следующей программы."
                    : "Sample problems for each subject will be published here before the next program."
                  : ru
                    ? "Для этого предмета и класса материалов пока нет."
                    : "Nothing here for this subject and grade yet."}
              </p>
            ) : (
              <LayoutGroup>
                <motion.ul layout className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((r) => {
                      const body = (
                        <>
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ivory-2 text-gate-gold">
                            <FileText className="h-5 w-5" />
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="text-[15px] font-semibold leading-snug text-ink">{r.copy[locale].title}</span>
                            {r.copy[locale].note && <span className="text-[12px] text-ink-3">{r.copy[locale].note}</span>}
                          </div>
                          {r.href ? (
                            <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                              <Lock className="h-3 w-3" /> {ru ? "Скоро" : "Soon"}
                            </span>
                          )}
                        </>
                      );
                      const cls =
                        "group flex h-full items-center gap-4 rounded-[1.5rem] border border-line bg-white p-4 pr-5 transition-all duration-300";
                      return (
                        <motion.li
                          key={r.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          {r.href ? (
                            <Link href={r.href} className={cn(cls, "hover:border-gate-gold hover:shadow-[0_20px_40px_-25px_rgba(11,31,58,0.4)]")}>
                              {body}
                            </Link>
                          ) : (
                            <div className={cls}>{body}</div>
                          )}
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </motion.ul>
              </LayoutGroup>
            )}
          </section>
        );
      })}
    </div>
  );
}
