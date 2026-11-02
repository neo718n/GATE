"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import type { Subject } from "@/lib/subjects";
import { useLocale } from "@/lib/i18n/client";

// three.js only runs in the browser; the stage text renders immediately.
const SubjectScene = dynamic(() => import("./subject-scene"), { ssr: false });

export type StageSubject = Subject & { grades?: [number, number]; gradeLabel?: string };

/**
 * Pinned 3D stage: the section holds the screen for one viewport per
 * subject while the 3D object and copy hand over to the next subject.
 */
/** 1–12 strip with the subject's grade range lit up. */
function GradeStrip({ grades }: { grades: [number, number] }) {
  const ru = useLocale() === "ru";
  return (
    <div className="flex max-w-lg flex-col gap-2">
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 12 }, (_, i) => {
          const g = i + 1;
          const on = g >= grades[0] && g <= grades[1];
          return (
            <motion.span
              key={g}
              initial={{ scaleY: 0.4, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.03 }}
              className={`flex h-8 items-center justify-center rounded-md [@media(max-height:860px)]:h-7 text-[11px] font-semibold tabular-nums ${
                on ? "bg-gradient-to-b from-gate-gold-2 to-gate-gold text-ink shadow-[0_6px_14px_-6px_rgba(201,153,58,0.8)]" : "bg-ink/5 text-ink-3"
              }`}
            >
              {g}
            </motion.span>
          );
        })}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">
        {ru ? `${grades[0]}–${grades[1]} классы` : `Grades ${grades[0]}–${grades[1]}`}
      </span>
    </div>
  );
}

export function SubjectsStage({
  subjects,
  heading,
  showTopics = true,
}: {
  subjects: StageSubject[];
  heading?: { eyebrow: string; title: string };
  showTopics?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
  const [active, setActive] = useState(0);
  const n = subjects.length;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n))));
  });

  const s = subjects[active];

  return (
    <div ref={ref} className="relative bg-ivory" style={{ height: `${n * 100 + 20}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="gold-aura pointer-events-none absolute inset-0" />
        <div className="tech-grid pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-0 px-6 pb-4 pt-20 lg:grid-cols-[1fr_1.15fr]">
          {/* Copy */}
          <div className="relative z-10 order-2 flex flex-col gap-4 pb-10 lg:order-1 lg:pb-0 [@media(max-height:860px)]:gap-3">
            {heading && (
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gate-gold">
                  <span className="h-px w-8 bg-gate-gold/60" />
                  {heading.eyebrow}
                </span>
                <span className="font-serif text-2xl font-medium text-ink-2 md:text-3xl">{heading.title}</span>
              </div>
            )}
            <div className="flex items-end gap-3">
              <span className="font-serif text-6xl font-medium leading-none text-gold-gradient md:text-7xl [@media(max-height:860px)]:text-5xl">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    0{active + 1}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="pb-2 text-sm font-semibold text-ink-3">/ 0{n}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4 [@media(max-height:860px)]:gap-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-line bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-ink-3">
                    {s.code}
                  </span>
                  {s.gradeLabel && (
                    <span className="rounded-full bg-gate-gold/15 px-3 py-1 text-[11px] font-semibold text-gate-gold">{s.gradeLabel}</span>
                  )}
                </div>
                <h2 className="font-serif text-5xl font-medium leading-[0.98] text-ink md:text-6xl xl:text-7xl [@media(max-height:860px)]:xl:text-6xl">{s.name}</h2>
                <p className="font-serif text-xl italic text-ink-2 md:text-2xl [@media(max-height:860px)]:hidden">{s.tagline}</p>
                <p className="max-w-lg text-[15px] leading-[1.8] text-ink-2 [@media(max-height:860px)]:line-clamp-3">{s.description}</p>
                {s.grades && <GradeStrip grades={s.grades} />}
                <ul className={showTopics ? "flex max-w-lg flex-wrap gap-2 [@media(max-height:860px)]:hidden" : "hidden"}>
                  {s.topics.map((t, i) => (
                    <motion.li
                      key={t}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="rounded-full border border-line bg-white/80 px-3.5 py-1.5 text-[12px] font-medium text-ink"
                    >
                      {t}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 pt-2">
              {subjects.map((sub, i) => (
                <span key={sub.key} className="relative h-1.5 overflow-hidden rounded-full bg-ink/10" style={{ width: i === active ? 48 : 18 }}>
                  {i === active && <motion.span layoutId="subject-dot" className="absolute inset-0 rounded-full bg-gate-gold" />}
                </span>
              ))}
            </div>
          </div>

          {/* 3D */}
          <div className="relative order-1 h-[42vh] w-full lg:order-2 lg:h-[82vh]">
            <div className="absolute inset-[18%] rounded-full bg-gate-gold/20 blur-3xl" />
            <SubjectScene progress={smooth} keys={subjects.map((x) => x.key)} />
          </div>
        </div>
      </div>
    </div>
  );
}
