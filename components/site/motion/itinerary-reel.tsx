"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useMotionValue } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";

type Photo = { src: string; alt: string };
export type DayCard = { title: string; place: string; items: string[]; photo?: Photo; date?: string };

const SPEED = 38; // px per second

/**
 * Itinerary as an endless, self-moving reel. It pauses on hover/touch,
 * can be dragged or stepped with the arrows, and each card expands into
 * the day's detail (Watermelon "Expandable Event Card" pattern).
 */
export function ItineraryReel({ eyebrow, title, days }: { eyebrow: string; title: string; days: DayCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<{ i: number; copy: number } | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const ru = useLocale() === "ru";
  const drag = useRef<{ startX: number; startOffset: number; moved: boolean } | null>(null);
  const loopWidth = useRef(0);
  const step = useRef(1);
  const nudge = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function measure() {
      const track = trackRef.current;
      if (!track) return;
      loopWidth.current = track.scrollWidth / 2;
      const first = track.children[0] as HTMLElement | undefined;
      const second = track.children[1] as HTMLElement | undefined;
      if (first && second) step.current = second.offsetLeft - first.offsetLeft;
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function wrap(v: number) {
    const w = loopWidth.current;
    if (!w) return v;
    if (v <= -w) return v + w;
    if (v > 0) return v - w;
    return v;
  }

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 64) / 1000;
    let v = x.get();
    if (nudge.current !== 0) {
      // Ease toward an arrow-button target.
      const d = nudge.current * Math.min(1, dt * 7);
      v += d;
      nudge.current -= d;
      if (Math.abs(nudge.current) < 0.5) nudge.current = 0;
    } else if (!drag.current && !hovered && !paused && open === null && !reduced.current) {
      v -= SPEED * dt;
    }
    v = wrap(v);
    x.set(v);
    const idx = Math.round(-v / step.current) % days.length;
    if (idx !== activeDay) setActiveDay((idx + days.length) % days.length);
  });

  const reel = [0, 1].flatMap((copy) => days.map((d, i) => ({ d, i, copy })));

  return (
    <>
      <div className="flex flex-col gap-10 overflow-hidden bg-ivory-2 py-24 md:py-32">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-6">
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gate-gold">
              <span className="h-px w-8 bg-gate-gold/60" />
              {eyebrow}
            </span>
            <h2 className="font-serif text-4xl font-medium leading-[1.05] text-ink md:text-6xl">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={ru ? "Предыдущий день" : "Previous day"}
              onClick={() => (nudge.current += step.current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-gate-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={paused ? (ru ? "Воспроизвести" : "Play") : ru ? "Пауза" : "Pause"}
              onClick={() => setPaused((p) => !p)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-gate-700"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label={ru ? "Следующий день" : "Next day"}
              onClick={() => (nudge.current -= step.current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-gate-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            drag.current = null;
          }}
          onPointerDown={(e) => {
            drag.current = { startX: e.clientX, startOffset: x.get(), moved: false };
          }}
          onPointerMove={(e) => {
            const g = drag.current;
            if (!g) return;
            const dx = e.clientX - g.startX;
            if (Math.abs(dx) > 5) g.moved = true;
            x.set(wrap(g.startOffset + dx));
          }}
          onPointerUp={() => {
            // Keep `moved` for the click handler that fires next, then release.
            setTimeout(() => (drag.current = null), 0);
          }}
          onTouchStart={() => setHovered(true)}
          onTouchEnd={() => setTimeout(() => setHovered(false), 2500)}
        >
          <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-5 pl-6 md:gap-6">
            {reel.map(({ d, i, copy }) => (
              <motion.button
                key={`${copy}-${i}`}
                type="button"
                layoutId={`day-${copy}-${i}`}
                aria-hidden={copy === 1}
                tabIndex={copy === 1 ? -1 : 0}
                onClick={() => {
                  if (drag.current?.moved) return;
                  setOpen({ i, copy });
                }}
                className="group relative flex h-[440px] w-[78vw] shrink-0 flex-col overflow-hidden rounded-[1.75rem] bg-white text-left shadow-[0_30px_60px_-35px_rgba(11,31,58,0.45)] sm:w-[340px] lg:w-[380px]"
              >
                <motion.div layoutId={`day-img-${copy}-${i}`} className="pointer-events-none relative h-[58%] w-full overflow-hidden">
                  {d.photo && (
                    <Image
                      src={d.photo.src}
                      alt={d.photo.alt}
                      fill
                      draggable={false}
                      sizes="380px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur">
                    {ru ? "День" : "Day"} {i + 1}
                    {d.date ? ` · ${d.date}` : ""}
                  </span>
                </motion.div>
                <div className="flex flex-1 flex-col justify-between gap-3 p-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">{d.place}</span>
                    <motion.h3 layoutId={`day-title-${copy}-${i}`} className="font-serif text-3xl font-medium text-ink">
                      {d.title}
                    </motion.h3>
                  </div>
                  <span className="text-[12px] font-semibold text-ink-3 transition-colors group-hover:text-ink">{ru ? "Подробнее о дне →" : "View the day →"}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        <div className="mx-auto flex items-center gap-2">
          {days.map((d, i) => (
            <span
              key={d.title}
              className={cn("h-1.5 rounded-full transition-all duration-500", i === activeDay ? "w-10 bg-gate-gold" : "w-4 bg-ink/15")}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8" data-lenis-prevent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
              className="absolute inset-0 bg-ivory/70 backdrop-blur-md"
            />
            <motion.div
              layoutId={`day-${open.copy}-${open.i}`}
              className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label={ru ? "Закрыть" : "Close"}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur transition-colors hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
              <motion.div layoutId={`day-img-${open.copy}-${open.i}`} className="relative h-64 w-full shrink-0 overflow-hidden sm:h-80">
                {days[open.i].photo && (
                  <Image src={days[open.i].photo!.src} alt={days[open.i].photo!.alt} fill sizes="672px" className="object-cover" />
                )}
              </motion.div>
              <div className="flex flex-col gap-4 overflow-y-auto p-7 sm:p-9">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-gold">
                  {ru ? "День" : "Day"} {open.i + 1} · {days[open.i].place}
                </span>
                <motion.h3 layoutId={`day-title-${open.copy}-${open.i}`} className="font-serif text-4xl font-medium text-ink">
                  {days[open.i].title}
                </motion.h3>
                <motion.ul
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3 pt-2"
                >
                  {days[open.i].items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-2">
                      <span className="mt-[11px] h-px w-4 shrink-0 bg-gate-gold" />
                      {item}
                    </li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
