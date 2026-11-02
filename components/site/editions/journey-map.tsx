"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { MapPin, Navigation, Plane } from "lucide-react";
import type { Destination, JourneyPoint } from "@/lib/editions";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";

// Stylized map of the Hangzhou Bay region (not to survey accuracy).
const BOUNDS = { west: 119.7, east: 122.1, north: 31.6, south: 29.0 };
const W = 600;
const H = 650;

function project([lat, lng]: [number, number]) {
  return {
    x: ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * W,
    y: ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * H,
  };
}

// Sea, Yangtze estuary and Hangzhou Bay as one water shape (lat, lng).
const WATER: [number, number][] = [
  [31.6, 122.1], [31.6, 121.3], [31.5, 121.35], [31.35, 121.75], [31.1, 121.95], [30.9, 121.98],
  [30.82, 121.6], [30.68, 121.2], [30.48, 120.9], [30.33, 120.65], [30.3, 120.9], [30.3, 121.3],
  [30.15, 121.7], [30.0, 121.95], [29.9, 122.1], [29.0, 122.1],
];
const WATER_PATH = WATER.map((p, i) => `${i ? "L" : "M"}${project(p).x.toFixed(1)},${project(p).y.toFixed(1)}`).join(" ") + " Z";
// Qiantang River, from the bay up past Hangzhou.
const RIVER = [[30.33, 120.65], [30.27, 120.45], [30.2, 120.25], [30.05, 119.95], [29.85, 119.75]] as [number, number][];
const RIVER_PATH = RIVER.map((p, i) => `${i ? "L" : "M"}${project(p).x.toFixed(1)},${project(p).y.toFixed(1)}`).join(" ");

const ZOOM = 0.58;

function zoomBox(c: { x: number; y: number }) {
  const w = W * ZOOM;
  const h = H * ZOOM;
  const x = Math.min(W - w, Math.max(0, c.x - w / 2));
  const y = Math.min(H - h, Math.max(0, c.y - h / 2));
  return `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
}

function arc(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const bend = Math.min(60, Math.hypot(dx, dy) * 0.22);
  const len = Math.hypot(dx, dy) || 1;
  return `M${a.x},${a.y} Q${mx - (dy / len) * bend},${my + (dx / len) * bend} ${b.x},${b.y}`;
}

function Segment({ d, index, progress }: { d: string; index: number; progress: MotionValue<number> }) {
  const pathLength = useTransform(progress, [index, index + 0.55], [0, 1], { clamp: true });
  return (
    <>
      <path d={d} fill="none" stroke="rgba(11,31,58,0.12)" strokeWidth={2} strokeDasharray="4 6" />
      <motion.path d={d} fill="none" stroke="#c9993a" strokeWidth={3} strokeLinecap="round" style={{ pathLength }} />
    </>
  );
}

/**
 * Pinned journey: the route draws itself across the map as you scroll, and
 * each stop opens a scene with its photo, day and highlights.
 */
export function JourneyMap({ start, stops, title }: { start: JourneyPoint; stops: Destination[]; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = stops.length;
  const local = useTransform(scrollYProgress, (v) => v * n);
  const [active, setActive] = useState(0);
  const ru = useLocale() === "ru";
  useMotionValueEvent(local, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v)))));

  const points = [start, ...stops].map((p) => project(p.coords));
  const segments = points.slice(1).map((p, i) => arc(points[i], p));
  const stop = stops[active];
  const here = points[active + 1];

  return (
    <div ref={ref} className="relative bg-ivory" style={{ height: `${n * 100 + 30}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-4 pt-20 md:px-6 lg:pt-16">
        <div className="mx-auto grid h-full max-h-[860px] w-full max-w-7xl grid-cols-1 gap-4 py-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:py-10">
          {/* Map */}
          <div className="relative h-[34vh] overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_30px_60px_-40px_rgba(11,31,58,0.4)] lg:h-full">
            <div className="absolute left-5 top-5 z-10 flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gate-gold">The route</span>
              <span className="hidden font-serif text-2xl font-medium text-ink md:block">{title}</span>
            </div>
            <motion.svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid slice"
              // Glide the camera toward the active stop.
              animate={{ viewBox: zoomBox(here) }}
              transition={{ type: "spring", stiffness: 50, damping: 18 }}
            >
              <defs>
                <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="rgba(11,31,58,0.10)" />
                </pattern>
                <pattern id="waves" width="18" height="10" patternUnits="userSpaceOnUse">
                  <path d="M0 5 Q4.5 0 9 5 T18 5" fill="none" stroke="rgba(43,85,145,0.18)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={W} height={H} fill="#fbf9f4" />
              <rect width={W} height={H} fill="url(#dots)" />
              <path d={WATER_PATH} fill="#e8eef6" />
              <path d={WATER_PATH} fill="url(#waves)" />
              <path d={RIVER_PATH} fill="none" stroke="#d5e0ee" strokeWidth={5} strokeLinecap="round" />

              {segments.map((d, i) => (
                <Segment key={i} d={d} index={i} progress={local} />
              ))}

              {/* Start */}
              <g transform={`translate(${points[0].x},${points[0].y})`}>
                <circle r={9} fill="#0b1f3a" />
                <text x={14} y={4} className="fill-ink-3" style={{ font: "600 12px var(--font-montserrat)" }}>
                  Xiaoshan Airport
                </text>
              </g>

              {stops.map((s, i) => {
                const p = points[i + 1];
                const on = i === active;
                const visited = i < active;
                return (
                  <g key={s.name} transform={`translate(${p.x},${p.y})`}>
                    {on && (
                      <motion.circle
                        r={10}
                        fill="none"
                        stroke="#c9993a"
                        strokeWidth={2}
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 2.6, opacity: 0 }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      />
                    )}
                    <circle r={on ? 9 : 6} fill={on || visited ? "#c9993a" : "#fff"} stroke="#c9993a" strokeWidth={2.5} />
                    <text
                      x={i % 2 ? -14 : 14}
                      y={4}
                      textAnchor={i % 2 ? "end" : "start"}
                      style={{ font: `${on ? 700 : 600} ${on ? 14 : 12}px var(--font-montserrat)` }}
                      className={on ? "fill-ink" : "fill-ink-3"}
                    >
                      {s.name}
                    </text>
                  </g>
                );
              })}
            </motion.svg>

            <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-1.5">
              {stops.map((s, i) => (
                <span key={s.name} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <span className={cn("block h-full rounded-full bg-gate-gold transition-all duration-500", i <= active ? "w-full" : "w-0")} />
                </span>
              ))}
            </div>
          </div>

          {/* Scene */}
          <div className="relative min-h-0 overflow-hidden rounded-[2rem] bg-ink">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={stop.name}
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                exit={{ opacity: 0.4 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                  <Image src={stop.image.src} alt={stop.image.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="relative flex h-full flex-col justify-end p-6 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stop.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gate-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
                      {stop.day}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      <MapPin className="h-3 w-3" /> {ru ? `Остановка ${active + 1} из ${n}` : `Stop ${active + 1} of ${n}`}
                    </span>
                    {stop.distance && (
                      <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        <Navigation className="h-3 w-3" /> {stop.distance}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-4xl font-medium leading-[1] text-white md:text-6xl">{stop.name}</h3>
                  <p className="max-w-xl text-[14px] leading-[1.8] text-white/80 md:text-[15px]">{stop.body}</p>
                  <ul className="flex flex-wrap gap-2">
                    {stop.highlights.map((h) => (
                      <li key={h} className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur">
                        {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
              <span className="mt-6 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 md:flex">
                <Plane className="h-3.5 w-3.5" /> {ru ? "Старт и финиш" : "Start & finish"}: {start.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
