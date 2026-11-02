"use client";

// Adapted from Watermelon UI "Scroll Island": tracks window scroll instead of
// an inner container and lists the page's sections for quick jumps.

import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig, useMotionValueEvent, useScroll } from "motion/react";
import { ChevronUp } from "lucide-react";

export type IslandSection = { id: string; title: string };

export function ScrollIsland({ sections }: { sections: IslandSection[] }) {
  const { scrollYProgress, scrollY } = useScroll();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(sections[0]?.id);

  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v * 100));
  // Shown after the hero, hidden again once the footer comes into view.
  useMotionValueEvent(scrollY, "change", (v) => {
    const nearEnd = v + window.innerHeight > document.documentElement.scrollHeight - window.innerHeight * 0.9;
    setVisible(v > window.innerHeight * 0.7 && !nearEnd);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const current = sections.find((s) => s.id === active) ?? sections[0];

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4"
          >
            <motion.div
              layout
              className="overflow-hidden border border-white/10 bg-ink text-ivory shadow-[0_20px_50px_-15px_rgba(11,31,58,0.6)]"
              style={{ borderRadius: open ? 22 : 999 }}
            >
              <AnimatePresence initial={false}>
                {open && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex w-72 flex-col px-2 pt-2"
                  >
                    {sections.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          onClick={() => setOpen(false)}
                          className={`block rounded-xl px-3 py-2 text-[13px] transition-colors ${
                            s.id === active ? "bg-white/10 text-gate-gold-2" : "text-ivory/70 hover:text-ivory"
                          }`}
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex h-12 w-72 items-center justify-between gap-4 px-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="relative h-7 w-7 shrink-0 rounded-full"
                    style={{ background: `conic-gradient(#e8c060 ${progress}%, rgba(255,255,255,0.15) 0)` }}
                  >
                    <span className="absolute inset-[3px] rounded-full bg-ink" />
                  </span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current?.id}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      className="truncate text-[13px] font-semibold"
                    >
                      {current?.title}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold tabular-nums text-ivory/60">{Math.round(progress)}%</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }}>
                    <ChevronUp className="h-4 w-4 text-ivory/60" />
                  </motion.span>
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
