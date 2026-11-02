"use client";

// Adapted from Watermelon UI "Footer 14": a rounded brand card with link
// columns, a contact block, a status bar and oversized brand typography.

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { ArrowUpRight, Mail } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/brand-icons";
import { CONTACT } from "@/lib/site";
import { Globe } from "@/components/site/motion/globe";
import { getCurrentEdition, getEditions, isPast, seasonLabel, type Edition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { Link, useLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";

const SEASON_RU: Record<string, string> = { winter: "Зима", summer: "Лето" };

const yearLabel = (e: Edition, locale: Locale) =>
  `${locale === "ru" ? (SEASON_RU[e.season] ?? seasonLabel(e.season)) : seasonLabel(e.season)} ${e.year} · ${e.city}`;

const T = {
  en: {
    columns: [
      {
        title: "Program",
        links: [
          { href: "/about", label: "About G.A.T.E." },
          { href: "/subjects", label: "Subjects" },
          { href: "/prepare", label: "Prepare" },
          { href: "/awards", label: "Awards & certificates" },
        ],
      },
      { title: "Years", links: [] },
      {
        title: "Trust & legal",
        links: [
          { href: "/verify", label: "Verify certificate" },
          { href: "/rules", label: "Rules & regulations" },
          { href: "/academic-integrity", label: "Academic integrity" },
          { href: "/privacy", label: "Privacy policy" },
          { href: "/terms", label: "Terms of participation" },
        ],
      },
      {
        title: "Company",
        links: [
          { href: "/contact", label: "Contact" },
          { href: "/partnerships", label: "Partnerships" },
          { href: "/careers", label: "Careers" },
        ],
      },
    ],
    blurb: "International academic programs for students in Grades 1–12, held at partner universities in China.",
    partnership: "In partnership with",
    contact: "Contact us",
    instagram: "G.A.T.E. on Instagram",
    footerNav: "Footer navigation",
    latest: "Latest program",
    next: "Next program",
    operated: "Operated by EdSquare",
  },
  ru: {
    columns: [
      {
        title: "Программа",
        links: [
          { href: "/about", label: "О G.A.T.E." },
          { href: "/subjects", label: "Предметы" },
          { href: "/prepare", label: "Подготовка" },
          { href: "/awards", label: "Награды и сертификаты" },
        ],
      },
      { title: "Годы", links: [] },
      {
        title: "Доверие и право",
        links: [
          { href: "/verify", label: "Проверка сертификата" },
          { href: "/rules", label: "Правила программы" },
          { href: "/academic-integrity", label: "Академическая честность" },
          { href: "/privacy", label: "Политика конфиденциальности" },
          { href: "/terms", label: "Условия участия" },
        ],
      },
      {
        title: "Компания",
        links: [
          { href: "/contact", label: "Контакты" },
          { href: "/partnerships", label: "Партнёрство" },
          { href: "/careers", label: "Вакансии" },
        ],
      },
    ],
    blurb: "Международные академические программы для школьников 1–12 классов на базе университетов-партнёров в Китае.",
    partnership: "При участии",
    contact: "Связаться с нами",
    instagram: "G.A.T.E. в Instagram",
    footerNav: "Навигация в подвале сайта",
    latest: "Последняя программа",
    next: "Ближайшая программа",
    operated: "Оператор — EdSquare",
  },
};

const stagger: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", duration: 0.6, bounce: 0 } },
};
const linkStagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const linkItem: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.4, bounce: 0 } },
};
const brand: Variants = {
  hidden: { opacity: 0, y: 60, filter: "blur(14px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", duration: 1.2, bounce: 0 } },
};

export function SiteFooter() {
  const locale = useLocale();
  const t = T[locale];
  const current = localizeEdition(getCurrentEdition(), locale);
  const years = getEditions().map((e) => {
    const l = localizeEdition(e, locale);
    return { href: `/${e.slug}`, label: yearLabel(l, locale) };
  });
  const COLUMNS = t.columns.map((c, i) => (i === 1 ? { ...c, links: years } : c));

  return (
    <footer className="bg-ivory px-3 pb-3 pt-10 md:px-5 md:pb-5">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2.25rem] bg-ink">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-gate-gold/15 blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 bottom-20 h-[360px] w-[360px] rounded-full bg-gate-600/30 blur-[120px]" />
        {/* 3D backdrop: the dotted globe, half-sunk into the bottom-right corner. */}
        {/* Phones: a fixed offset, because the stacked footer is so tall that a
            percentage would push the globe below the card. */}
        <div className="pointer-events-none absolute -bottom-[45vw] -right-[35vw] w-[150vw] opacity-70 [mask-image:radial-gradient(circle_at_center,#000_45%,transparent_72%)] sm:-bottom-[38vw] sm:-right-[25vw] sm:w-[110vw] lg:-bottom-[38%] lg:-right-[12%] lg:w-[min(900px,95vw)]">
          <Globe tone="dark" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="relative px-6 pt-12 sm:px-10 lg:px-14"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <div className="flex shrink-0 flex-col gap-10 lg:w-80">
            <motion.div variants={rise} className="flex flex-col gap-6">
              <Image
                src="/partners/gate-mark.png"
                alt="G.A.T.E. — Global Academic & Theoretical Excellence"
                width={2440}
                height={920}
                className="h-auto w-56"
              />
              <p className="text-[14px] leading-[1.8] text-white/75">
                {t.blurb}
              </p>
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{t.partnership}</span>
                <div className="flex items-center gap-3">
                  {current.hostLogo && (
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg">
                      <Image src={current.hostLogo} alt={current.host} width={120} height={120} className="h-full w-auto" />
                    </span>
                  )}
                  <span className="flex h-16 items-center rounded-2xl bg-white px-4 shadow-lg">
                    <Image src="/partners/edsquare-transparent.png" alt="EdSquare" width={128} height={30} className="h-5 w-auto" />
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={rise} className="order-last flex w-full flex-col gap-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white">{t.contact}</h3>
              <a
                href={CONTACT.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl bg-[#25D366] px-4 py-3.5 shadow-[0_12px_30px_-12px_rgba(37,211,102,0.6)] transition-transform hover:scale-[1.02]"
              >
                <span className="flex items-center gap-3 text-[14px] font-semibold text-white">
                  <WhatsAppIcon className="h-5 w-5" /> {CONTACT.whatsapp.display}
                </span>
                <ArrowUpRight className="h-4 w-4 text-white/80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href={CONTACT.email.href}
                className="group flex items-center justify-between rounded-2xl bg-white/[0.07] px-4 py-3.5 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
              >
                <span className="flex min-w-0 items-center gap-3 whitespace-nowrap text-[13px] font-medium text-white">
                  <Mail className="h-4 w-4 shrink-0 text-gate-gold-2" /> {CONTACT.email.display}
                </span>
                <ArrowUpRight className="h-4 w-4 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href={CONTACT.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.instagram}
                className="group mt-1 flex w-fit items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 ring-1 ring-white/15 transition-colors hover:ring-white/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_110%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] text-white">
                  <InstagramIcon className="h-4 w-4" />
                </span>
                <span className="text-[13px] font-medium text-white/80 group-hover:text-white">{CONTACT.instagram.display}</span>
              </a>
            </motion.div>
            </div>

            <motion.nav variants={stagger} aria-label={t.footerNav} className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
              {COLUMNS.map((col) => (
                <motion.div key={col.title} variants={rise}>
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white">{col.title}</h3>
                  <motion.ul variants={linkStagger} className="mt-5 flex flex-col gap-3">
                    {col.links.map((l) => (
                      <motion.li key={l.href} variants={linkItem}>
                        <Link href={l.href} className="text-[14px] text-white/75 transition-colors hover:text-gate-gold-2">
                          {l.label}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              ))}
            </motion.nav>

          </div>

          {/* Status bar */}
          <motion.div variants={rise} className="mt-12 flex flex-col gap-3 border-t border-white/10 py-5 text-[13px] sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/${current.slug}`} className="group flex flex-wrap items-center gap-x-2.5 gap-y-1 text-white/70 hover:text-white">
              <span className="relative flex h-2 w-2">
                {!isPast(current) && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gate-gold opacity-70" />}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gate-gold" />
              </span>
              {isPast(current) ? t.latest : t.next}:
              <span className="font-medium text-white">
                {current.name} · {current.city} · {current.dateLabel}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="relative text-white/75">© {new Date().getFullYear()} G.A.T.E. Assessment · {t.operated}</p>
          </motion.div>
        </motion.div>

        {/* Oversized brand */}
        <motion.div
          variants={brand}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          aria-hidden
          className="relative flex items-end justify-center overflow-hidden px-4"
          style={{ minHeight: "clamp(120px, 19vw, 300px)" }}
        >
          <p
            className="translate-y-[18%] select-none bg-clip-text text-center font-serif font-medium leading-[0.8] tracking-[-0.02em] text-transparent"
            style={{
              fontSize: "clamp(4.5rem, 21vw, 22rem)",
              // White fading into the card: high contrast at the top, transparent at the edge.
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 100%)",
            }}
          >
            G.A.T.E.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
