"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

type Photo = { src: string; alt: string };

/* ───────────────────────── Pinned outcomes ─────────────────────────
   The section pins for one screen per item. Copy on the left swaps as you
   scroll; photos on the right wipe in one over another. */

export function PinnedOutcomes({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { title: string; body: string; image?: Photo }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const n = items.length;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n))));
  });
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div ref={ref} className="relative bg-ivory" style={{ height: `${n * 100 + 40}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6">
        <div className="gold-aura pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 pt-20 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-4 lg:gap-7 [@media(max-height:860px)]:lg:gap-4">
            <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gate-gold">
              <span className="h-px w-8 bg-gate-gold/60" />
              {eyebrow}
            </span>
            <h2 className="font-serif text-3xl font-medium leading-[1.05] text-ink md:text-5xl xl:text-6xl [@media(max-height:860px)]:md:text-4xl [@media(max-height:860px)]:xl:text-4xl">{title}</h2>

            <div className="flex items-end gap-4">
              <span className="font-serif text-6xl font-medium leading-none text-gold-gradient md:text-7xl xl:text-8xl [@media(max-height:860px)]:md:text-5xl [@media(max-height:860px)]:xl:text-5xl">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    0{active + 1}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="pb-3 text-sm font-semibold text-ink-3">/ 0{n}</span>
            </div>

            <div className="relative min-h-[9rem] md:min-h-[11rem] [@media(max-height:860px)]:md:min-h-[8rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                  transition={{ duration: 0.45 }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="font-serif text-3xl font-medium text-ink md:text-4xl [@media(max-height:860px)]:md:text-3xl">{items[active].title}</h3>
                  <p className="max-w-lg text-base leading-[1.8] text-ink-2">{items[active].body}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="h-px w-full max-w-sm overflow-hidden bg-line">
              <motion.div className="h-full origin-left bg-gate-gold" style={{ scaleX: bar }} />
            </div>
          </div>

          <div className="relative order-first h-[32vh] w-full overflow-hidden rounded-[1.5rem] bg-ivory-2 shadow-[0_40px_80px_-40px_rgba(11,31,58,0.45)] sm:h-[min(60vh,560px)] lg:order-none lg:h-[min(calc(100vh-8rem),720px)] lg:rounded-[2rem]">
            {items.map((item, i) =>
              item.image ? (
                <WipeImage key={item.title} photo={item.image} index={i} count={n} progress={scrollYProgress} />
              ) : null,
            )}
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WipeImage({
  photo,
  index,
  count,
  progress,
}: {
  photo: Photo;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const start = index / count - 0.12;
  const end = index / count + 0.02;
  const reveal = useTransform(progress, [start, end], [100, 0], { clamp: true });
  const clipPath = useTransform(reveal, (r) => (index === 0 ? "inset(0% 0 0 0)" : `inset(${r}% 0 0 0)`));
  const scale = useTransform(progress, [index / count, (index + 1) / count], [1.12, 1]);
  return (
    <motion.div className="absolute inset-0" style={{ clipPath, zIndex: index }}>
      <motion.div className="absolute inset-0" style={{ scale }}>
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Zoom media ─────────────────────────
   A framed photo/video that grows to full-bleed as the section pins. */

export function ZoomMedia({
  children,
  overlay,
  className,
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // The zoom finishes in the first ~40% of the pin and the overlay text is
  // fully in by ~50%, so the copy then holds on screen for the remaining half
  // (≈1 viewport of scrolling) — long enough to actually read it.
  const width = useTransform(scrollYProgress, [0, 0.4], ["min(72rem, 86vw)", "100vw"]);
  const height = useTransform(scrollYProgress, [0, 0.4], ["70vh", "100vh"]);
  const radius = useTransform(scrollYProgress, [0, 0.4], [32, 0]);
  // Function form: clamps explicitly, so the copy stays at full opacity for
  // the rest of the pin instead of fading back out.
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const overlayOpacity = useTransform(scrollYProgress, (p) => clamp01((p - 0.25) / 0.23));
  const overlayY = useTransform(scrollYProgress, (p) => 40 * (1 - clamp01((p - 0.25) / 0.25)));

  return (
    <div ref={ref} className={cn("relative h-[300vh] bg-ivory", className)}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={{ width, height, borderRadius: radius }} className="relative overflow-hidden bg-ink">
          {children}
          {overlay && (
            <motion.div style={{ opacity: overlayOpacity, y: overlayY }} className="absolute inset-0 z-10">
              {overlay}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────────── Parallax gallery ───────────────────────── */

export function ParallaxGallery({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, -260]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-40, -120]);
  const columns = [0, 1, 2].map((c) => photos.filter((_, i) => i % 3 === c));
  const ys = [y1, y2, y3];

  return (
    <div ref={ref} className="grid grid-cols-3 gap-2 md:gap-5">
      {columns.map((col, c) => (
        <motion.div key={c} style={{ y: ys[c] }} className="flex flex-col gap-2 md:gap-5">
          {col.map((p, i) => (
            <div
              key={p.src}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-ivory-3 md:rounded-[1.5rem]",
                (i + c) % 2 === 0 ? "aspect-[4/5]" : "aspect-[4/3]",
              )}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-[1.06]"
              />
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
