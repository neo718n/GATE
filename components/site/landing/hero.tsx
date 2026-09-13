import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { HeroVideo } from "@/components/site/landing/hero-video";
import { NotifyMeButton } from "@/components/site/landing/notify-me";

const FACTS = ["18–24 AUGUST 2026", "XIDIAN UNIVERSITY", "7 DAYS", "GRADES 1–11"];

export function LandingHero() {
  return (
    <section className="relative flex min-h-[min(92vh,880px)] flex-col justify-end overflow-hidden bg-gate-900">
      <div className="absolute inset-0">
        <HeroVideo />
      </div>

      {/* Legibility gradients over the footage */}
      <div className="absolute inset-0 bg-gradient-to-t from-gate-900 via-gate-900/55 to-gate-900/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-gate-900/80 via-gate-900/10 to-transparent" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-gate-900/70 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-40 sm:pb-20">
        <div className="flex max-w-2xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gate-gold-2/70" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-gold-2">
              18–24 August 2026 · Hangzhou, China
            </p>
          </div>

          <h1 className="font-serif text-4xl font-medium leading-[1.04] text-gate-white sm:text-5xl md:text-6xl lg:text-7xl">
            It already happened<br />once.
          </h1>

          <p className="max-w-xl text-base font-normal leading-[1.7] text-gate-white/80 md:text-lg">
            Students from around the world completed the Hangzhou Academic Camp at Xidian
            University — seven days, one closing ceremony. The next edition has no date yet.
            Leave your details and you&apos;ll hear first.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <NotifyMeButton variant="gold" size="lg">
              Notify Me When Dates Are Set
            </NotifyMeButton>
            <Link
              href="#hangzhou-camp"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gate-white/90 transition-colors hover:text-gate-gold-2"
            >
              <PlayCircle className="h-5 w-5" strokeWidth={1.75} />
              Explore the Program
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            {FACTS.map((fact) => (
              <span
                key={fact}
                className="text-[11px] font-semibold tracking-[0.18em] text-gate-white/55"
              >
                {fact}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 hidden items-center gap-2 rounded-full border border-gate-white/15 bg-gate-900/55 px-4 py-2 backdrop-blur-sm sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-gate-gold-2 animate-pulse" />
        <span className="text-[10px] font-semibold tracking-[0.16em] text-gate-white/70">
          AUGUST 2026 · LIVE FOOTAGE
        </span>
      </div>
    </section>
  );
}
