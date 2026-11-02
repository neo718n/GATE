"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageHero } from "@/components/site/kit";
import { Reveal } from "@/components/site/motion/reveal";
import { cn } from "@/lib/utils";
import { rememberLocale, useLocale } from "@/lib/i18n/client";
import { usePathname } from "next/navigation";
import { splitLocale } from "@/lib/i18n/config";

export type LegalSection = {
  number: string;
  title: string;
  content: string[];
  list?: string[];
};

/** Long-form policy page with a sticky, scroll-spied table of contents. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const [active, setActive] = useState(sections[0]?.number);
  const ru = useLocale() === "ru";
  const { path } = splitLocale(usePathname());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id.replace("s-", ""));
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(`s-${s.number}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <PageHero eyebrow={ru ? "Правовая информация" : "Legal"} title={title} lead={intro}>
        <div className="flex flex-col gap-3">
          <span className="glass inline-flex w-fit rounded-full px-4 py-2 text-[12px] font-semibold text-ink-2">{updated}</span>
          {ru && (
            <p className="max-w-2xl rounded-2xl border border-gate-gold/30 bg-gate-gold/10 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
              Это перевод для удобства. Юридическую силу имеет{" "}
              <a href={path} hrefLang="en" className="font-semibold text-ink underline underline-offset-2" onClick={() => rememberLocale("en")}>
                английская версия
              </a>
              ; при любых расхождениях применяется она.
            </p>
          )}
        </div>
      </PageHero>

      <section className="bg-ivory px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[18rem_1fr] lg:gap-20">
          <nav aria-label={ru ? "Разделы" : "Sections"} className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-1">
              <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-3">{ru ? "На этой странице" : "On this page"}</span>
              {sections.map((s) => (
                <a
                  key={s.number}
                  href={`#s-${s.number}`}
                  className={cn(
                    "relative flex items-baseline gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors",
                    active === s.number ? "text-ink" : "text-ink-3 hover:text-ink",
                  )}
                >
                  {active === s.number && (
                    <motion.span
                      layoutId="legal-active"
                      className="absolute inset-0 -z-10 rounded-xl bg-white shadow-[0_8px_20px_-14px_rgba(11,31,58,0.4)]"
                    />
                  )}
                  <span className="text-[10px] font-semibold tabular-nums text-gate-gold">{s.number}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="flex flex-col">
            {sections.map((s) => (
              <Reveal key={s.number} as="section">
                <div id={`s-${s.number}`} className="scroll-mt-28 border-b border-line py-10 first:pt-0 last:border-0 md:py-14">
                  <div className="mb-6 flex items-baseline gap-5">
                    <span className="font-serif text-4xl font-medium tabular-nums text-gold-gradient">{s.number}</span>
                    <h2 className="font-serif text-3xl font-medium text-ink md:text-4xl">{s.title}</h2>
                  </div>
                  <div className="flex max-w-3xl flex-col gap-4">
                    {s.content.map((p, i) => (
                      <p key={i} className="text-[15px] leading-[1.9] text-ink-2">
                        {p}
                      </p>
                    ))}
                    {s.list && (
                      <ul className="mt-1 flex flex-col gap-3">
                        {s.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-4 text-[15px] leading-[1.8] text-ink-2">
                            <span className="mt-[13px] h-px w-4 shrink-0 bg-gate-gold" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
