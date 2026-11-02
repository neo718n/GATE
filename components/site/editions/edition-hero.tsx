"use client";

import { Link, useLocale } from "@/lib/i18n/client";
import { plural } from "@/lib/i18n/plural";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Globe } from "@/components/site/motion/globe";
import { Counter, Reveal, SplitHeading } from "@/components/site/motion/reveal";
import { ZoomMedia } from "@/components/site/motion/pinned";
import { HeroVideo } from "@/components/site/landing/hero-video";
import type { Edition } from "@/lib/editions";
import { APPLY_URL } from "@/lib/portal-urls";

const DESKTOP = "(min-width: 1024px)";
function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(DESKTOP);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

function dayCount(e: Edition) {
  return Math.round((new Date(e.endDate).getTime() - new Date(e.startDate).getTime()) / 86_400_000);
}

const T = {
  en: {
    grades: "Grades",
    perParticipant: "Per participant",
    apply: "Apply now",
    itinerary: "See the itinerary",
    hostCity: "Host city",
    happened: "It already happened once.",
    footage: "Live footage · August 2026",
    footageLine: "Seven days. One campus. Students from across the region.",
  },
  ru: {
    grades: "Классы",
    perParticipant: "За участника",
    apply: "Подать заявку",
    itinerary: "Смотреть программу",
    hostCity: "Город программы",
    happened: "Это уже было. И было здорово.",
    footage: "Живые кадры · август 2026",
    footageLine: "Семь дней. Один кампус. Ребята из разных стран.",
  },
};

function Facts({ edition }: { edition: Edition }) {
  const locale = useLocale();
  const t = T[locale];
  const days = dayCount(edition);
  const n = edition.subjects.length;
  const facts: [string, string][] = [
    [String(days), plural(days, locale, ["Day", "Days"], ["День", "Дня", "Дней"])],
    [String(n), plural(n, locale, ["Subject", "Subjects"], ["Предмет", "Предмета", "Предметов"])],
    [`${edition.grades[0]}–${edition.grades[1]}`, t.grades],
  ];
  return (
    <div className={`grid w-full gap-2 ${edition.price ? "max-w-2xl grid-cols-2 sm:grid-cols-4" : "max-w-lg grid-cols-3"}`}>
      {facts.map(([v, l]) => (
        <div key={l} className="glass flex flex-col gap-1 rounded-2xl px-4 py-3">
          <Counter value={v} className="font-serif text-3xl font-medium text-ink" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">{l}</span>
        </div>
      ))}
      {edition.price && (
        <div className="flex flex-col gap-1 rounded-2xl bg-ink px-4 py-3 shadow-[0_14px_30px_-14px_rgba(11,31,58,0.6)]">
          <span className="font-serif text-3xl font-medium text-gate-gold-2">{edition.price.label}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/70">{t.perParticipant}</span>
        </div>
      )}
    </div>
  );
}

/** Upcoming year: copy on the left, the 3D globe on the right. */
export function UpcomingHero({ edition, headingLevel = "h1" }: { edition: Edition; headingLevel?: "h1" | "h2" }) {
  const t = T[useLocale()];
  const ref = useRef<HTMLElement>(null);
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Parallax only on desktop: on a phone the globe sits below the copy and
  // shrinking it while it scrolls into view just makes it look tiny.
  const globeY = useTransform(scrollYProgress, [0, 1], desktop ? [0, 140] : [0, 0]);
  const globeScale = useTransform(scrollYProgress, [0, 1], desktop ? [1, 0.85] : [1, 1]);
  const copyY = useTransform(scrollYProgress, [0, 1], desktop ? [0, -60] : [0, 0]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden px-6 pb-16 pt-32 md:pt-36">
      <div className="gold-aura pointer-events-none absolute inset-0" />
      <div className="tech-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-4">
        <motion.div style={{ y: copyY }} className="relative z-10 flex flex-col gap-7">
          <Reveal>
            <span className="glass inline-flex w-fit items-center gap-2.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gate-gold opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gate-gold" />
              </span>
              {edition.name} · {edition.shortDateLabel}
            </span>
          </Reveal>

          <SplitHeading
            as={headingLevel}
            text={edition.tagline}
            className="font-serif text-5xl font-medium leading-[0.98] tracking-[-0.02em] text-ink sm:text-6xl md:text-7xl xl:text-[5.5rem]"
          />

          <Reveal delay={0.35}>
            <p className="max-w-xl text-base leading-[1.8] text-ink-2 md:text-lg">{edition.summary}</p>
          </Reveal>

          <Reveal delay={0.45} className="flex flex-wrap items-center gap-3">
            <Link
              href={APPLY_URL}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[13px] font-semibold text-ivory shadow-[0_14px_30px_-12px_rgba(11,31,58,0.6)] transition-colors hover:bg-gate-700"
            >
              {t.apply}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#itinerary"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-6 text-[13px] font-semibold text-ink backdrop-blur transition-colors hover:border-gate-gold"
            >
              {t.itinerary} <ArrowDown className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.55}>
            <Facts edition={edition} />
          </Reveal>
        </motion.div>

        <motion.div
          style={{ y: globeY, scale: globeScale }}
          // Desktop: pinned to the top of the row so it sits beside the headline
          // instead of being centred on the (much taller) text column.
          className="relative -mx-16 w-[calc(100%+8rem)] max-w-[640px] sm:mx-auto sm:w-full lg:-mt-20 lg:self-start"
        >
          <div className="absolute inset-[12%] rounded-full bg-gate-gold/15 blur-3xl" />
          <Globe />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="glass absolute bottom-[14%] right-20 flex flex-col gap-0.5 rounded-2xl px-4 py-3 sm:right-[4%]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-gold">{t.hostCity}</span>
            <span className="font-serif text-xl font-medium text-ink">
              {edition.city}, {edition.country}
            </span>
            <span className="text-[11px] text-ink-3">{edition.host}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/** Past year with footage: a headline, then the video zooms to full-bleed on scroll. */
export function VideoHero({ edition, headingLevel = "h1" }: { edition: Edition; headingLevel?: "h1" | "h2" }) {
  const t = T[useLocale()];
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-6 pt-36 md:pt-44">
        <div className="gold-aura pointer-events-none absolute inset-0" />
        <div className="tech-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
              {edition.name} · {edition.dateLabel} · {edition.city}
            </span>
          </Reveal>
          <SplitHeading
            as={headingLevel}
            text={t.happened}
            className="font-serif text-5xl font-medium leading-[0.98] tracking-[-0.02em] text-ink sm:text-7xl md:text-8xl"
          />
          <Reveal delay={0.3}>
            <p className="max-w-2xl text-base leading-[1.8] text-ink-2 md:text-lg">{edition.summary}</p>
          </Reveal>
        </div>
      </section>
      <ZoomMedia
        overlay={
          <div className="flex h-full w-full items-end bg-gradient-to-t from-ink/80 via-ink/20 to-transparent p-8 md:p-14">
            <div className="flex max-w-xl flex-col gap-3 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gate-gold-2">{t.footage}</span>
              <p className="font-serif text-3xl font-medium leading-tight text-white md:text-5xl">{t.footageLine}</p>
            </div>
          </div>
        }
      >
        <HeroVideo />
      </ZoomMedia>
    </>
  );
}
