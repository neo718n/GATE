"use client";

// Adapted from Watermelon UI "Navigation-5": a floating island navbar with a
// multi-column mega menu, rebuilt on motion instead of Radix NavigationMenu.

import { useRef, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Award, BadgeCheck, BookOpen, ChevronDown, Mail, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { APPLY_URL, PARTNERS_URL } from "@/lib/portal-urls";
import { YearSwitcher } from "@/components/site/year-switcher";
import { LanguageMenu } from "@/components/site/language-switcher";
import { getCurrentEdition, getEditions, isPast } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { splitLocale } from "@/lib/i18n/config";
import { Link, useLocale } from "@/lib/i18n/client";
import { getSubjects } from "@/lib/subjects";
import { cn } from "@/lib/utils";

const T = {
  en: {
    links: [
      { href: "/subjects", label: "Subjects" },
      { href: "/prepare", label: "Prepare" },
      { href: "/about", label: "About" },
      { href: "/verify", label: "Verify" },
    ],
    extraMobile: [
      { href: "/awards", label: "Awards" },
      { href: "/contact", label: "Contact" },
    ],
    resources: [
      { href: "/prepare", label: "Prepare", desc: "Past papers & sample problems", icon: BookOpen },
      { href: "/verify", label: "Verify a certificate", desc: "Check any G.A.T.E. credential", icon: BadgeCheck },
      { href: "/awards", label: "Awards & certificates", desc: "How recognition works", icon: Award },
      { href: "/contact", label: "Contact", desc: "Talk to the team", icon: Mail },
    ],
    programs: "Programs",
    programYears: "Program years",
    subjects: "Subjects",
    resourcesTitle: "Resources",
    latest: "Latest",
    upcoming: "Upcoming",
    explore: "Explore",
    dashboard: "Dashboard",
    partners: "For partners",
    apply: "Apply now",
    signOut: "Sign Out",
    home: "G.A.T.E. home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  ru: {
    links: [
      { href: "/subjects", label: "Предметы" },
      { href: "/prepare", label: "Подготовка" },
      { href: "/about", label: "О нас" },
      { href: "/verify", label: "Проверка" },
    ],
    extraMobile: [
      { href: "/awards", label: "Награды" },
      { href: "/contact", label: "Контакты" },
    ],
    resources: [
      { href: "/prepare", label: "Подготовка", desc: "Задания прошлых лет и примеры", icon: BookOpen },
      { href: "/verify", label: "Проверить сертификат", desc: "Подлинность любого документа G.A.T.E.", icon: BadgeCheck },
      { href: "/awards", label: "Награды и сертификаты", desc: "Как мы отмечаем результаты", icon: Award },
      { href: "/contact", label: "Контакты", desc: "Напишите нам", icon: Mail },
    ],
    programs: "Программы",
    programYears: "Годы программы",
    subjects: "Предметы",
    resourcesTitle: "Полезное",
    latest: "Последняя",
    upcoming: "Скоро",
    explore: "Подробнее",
    dashboard: "Кабинет",
    partners: "Партнёрам",
    apply: "Подать заявку",
    signOut: "Выйти",
    home: "G.A.T.E. — на главную",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
  },
};

const ROLE_HOME: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  coordinator: "/coordinator",
  partner_contact: "/partner",
  participant: "/participant",
  career_applicant: "/participant",
};

interface NavSession {
  user: { name: string; email: string; role?: string | null };
}

export function SiteNav({ session }: { session?: NavSession | null }) {
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobilePrograms, setMobilePrograms] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = splitLocale(usePathname()).path;
  const { scrollY } = useScroll();
  const locale = useLocale();
  const t = T[locale];
  const LINKS = t.links;
  const current = localizeEdition(getCurrentEdition(), locale);
  const editions = getEditions().map((e) => localizeEdition(e, locale));
  const subjects = getSubjects(locale);

  // Always visible: a floating island at the top that docks into a
  // full-width bar once the page scrolls.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Close menus when the route changes (adjusting state during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMega(false);
    setMobile(false);
  }

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMegaSoon = () => {
    closeTimer.current = setTimeout(() => setMega(false), 140);
  };

  const dashboardHref = session
    ? (ROLE_HOME[(session.user as unknown as { role?: string }).role ?? "participant"] ?? "/participant")
    : "/participant";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const programsActive = editions.some((e) => pathname === `/${e.slug}`);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ paddingTop: scrolled ? 0 : 16, paddingLeft: scrolled ? 0 : 12, paddingRight: scrolled ? 0 : 12 }}
        transition={{ type: "spring", stiffness: 260, damping: 34 }}
        className="fixed inset-x-0 top-0 z-50"
        onMouseLeave={closeMegaSoon}
      >
        {/* Island → full-width bar */}
        <motion.div
          initial={false}
          animate={{ maxWidth: scrolled ? 4000 : 1152, borderRadius: scrolled ? 0 : 36 }}
          transition={{ type: "spring", stiffness: 260, damping: 34 }}
          className={cn(
            "relative mx-auto border-ink/10 bg-white transition-[box-shadow,border-color] duration-300",
            scrolled
              ? "border-b shadow-[0_8px_30px_-20px_rgba(11,31,58,0.35)]"
              : "border shadow-[0_10px_40px_-18px_rgba(11,31,58,0.35)]",
          )}
        >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 pl-5 pr-2.5">
          <Link href="/" aria-label={t.home} className="shrink-0 pr-2">
            <Logo size="xs" variant="light" showTagline={false} />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            <button
              type="button"
              onMouseEnter={openMega}
              onClick={openMega}
              onKeyDown={(e) => e.key === "Escape" && setMega(false)}
              aria-expanded={mega}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-medium transition-colors",
                mega ? "bg-ivory-2 text-ink" : programsActive ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {t.programs}
              <motion.span animate={{ rotate: mega ? 180 : 0 }}>
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </button>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={closeMegaSoon}
                className={cn(
                  "relative isolate whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-medium transition-colors",
                  isActive(l.href) ? "text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                {isActive(l.href) && (
                  <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-ivory-2" />
                )}
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <LanguageMenu />
              <YearSwitcher />
            </div>
            {session ? (
              <NextLink
                href={dashboardHref}
                className="hidden h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-ivory-2 hover:text-ink xl:inline-flex"
              >
                {t.dashboard}
              </NextLink>
            ) : (
              <Link
                href={PARTNERS_URL}
                className="hidden h-11 items-center rounded-full px-4 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-ivory-2 hover:text-ink xl:inline-flex"
              >
                {t.partners}
              </Link>
            )}
            <Link
              href={APPLY_URL}
              className="group hidden h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-6 text-[13px] font-semibold text-ivory shadow-[0_10px_24px_-12px_rgba(11,31,58,0.6)] transition-colors hover:bg-gate-700 md:inline-flex"
            >
              {t.apply} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobile(true)}
              aria-label={t.openMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ivory-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        </motion.div>

        {/* Mega menu */}
        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onMouseEnter={openMega}
              className="mx-auto mt-3 hidden w-[calc(100%-1.5rem)] max-w-6xl origin-top overflow-hidden rounded-[2.25rem] border border-ink/10 bg-white shadow-[0_40px_80px_-30px_rgba(11,31,58,0.45)] lg:block"
            >
              <div className="grid grid-cols-[1.25fr_1fr_1fr_1.2fr] divide-x divide-line p-8">
                {/* Featured */}
                <Link href={`/${current.slug}`} className="group relative mr-6 flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={current.heroImage.src}
                    alt={current.heroImage.alt}
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                  <div className="relative flex flex-col gap-1.5 p-5">
                    <span className="w-fit rounded-full bg-gate-gold px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
                      {isPast(current) ? t.latest : t.upcoming}
                    </span>
                    <span className="font-serif text-2xl font-medium text-white">{current.name}</span>
                    <span className="text-[12px] text-white/75">
                      {current.city} · {current.dateLabel}
                      {current.price ? ` · ${current.price.label}` : ""}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-gate-gold-2">
                      {t.explore} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>

                {/* Years */}
                <div className="flex flex-col gap-3 px-6">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">{t.programYears}</span>
                  {editions.map((e) => (
                    <Link key={e.slug} href={`/${e.slug}`} className="group flex flex-col gap-0.5 rounded-xl py-1.5">
                      <span className="flex items-center gap-2 text-[14px] font-medium text-ink transition-colors group-hover:text-gate-gold">
                        <span className={cn("h-1.5 w-1.5 rounded-full", isPast(e) ? "bg-ink/25" : "bg-gate-gold")} />
                        {e.name}
                      </span>
                      <span className="pl-3.5 text-[12px] text-ink-3">
                        {e.city} · {e.shortDateLabel}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Subjects */}
                <div className="flex flex-col gap-3 px-6">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">{t.subjects}</span>
                  {subjects.map((s) => (
                    <Link key={s.key} href="/subjects" className="text-[14px] font-medium text-ink-2 transition-colors hover:text-ink">
                      {s.name}
                    </Link>
                  ))}
                </div>

                {/* Resources */}
                <div className="flex flex-col gap-2 pl-6">
                  <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">{t.resourcesTitle}</span>
                  {t.resources.map((r) => (
                    <Link key={r.href} href={r.href} className="group flex items-start gap-3 rounded-2xl p-2 transition-colors hover:bg-ivory">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ivory-2 text-gate-gold">
                        <r.icon className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[14px] font-medium text-ink">{r.label}</span>
                        <span className="text-[12px] text-ink-3">{r.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobile(false)}
              className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-[61] flex w-[min(360px,88vw)] flex-col gap-6 overflow-y-auto bg-white p-6 shadow-2xl lg:hidden"
              data-lenis-prevent
            >
              <div className="flex items-center justify-between">
                <Logo size="xs" variant="light" showTagline={false} />
                <button
                  type="button"
                  onClick={() => setMobile(false)}
                  aria-label={t.closeMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory-2 text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Link href={`/${current.slug}`} className="relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl">
                <Image src={current.heroImage.src} alt={current.heroImage.alt} fill sizes="360px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
                <div className="relative p-4">
                  <span className="font-serif text-xl font-medium text-white">{current.name}</span>
                  <span className="block text-[12px] text-white/75">
                    {current.city} · {current.dateLabel}
                  </span>
                </div>
              </Link>

              <nav className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setMobilePrograms((v) => !v)}
                  className="flex items-center justify-between border-b border-line py-4 text-left text-[17px] font-medium text-ink"
                >
                  {t.programs}
                  <motion.span animate={{ rotate: mobilePrograms ? 180 : 0 }}>
                    <ChevronDown className="h-4 w-4 text-ink-3" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {mobilePrograms && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-l border-line pl-4"
                    >
                      {editions.map((e) => (
                        <Link key={e.slug} href={`/${e.slug}`} className="flex flex-col py-2.5">
                          <span className="text-[15px] font-medium text-ink">{e.name}</span>
                          <span className="text-[12px] text-ink-3">
                            {e.city} · {e.shortDateLabel}
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {[...LINKS, ...t.extraMobile].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "flex items-center justify-between border-b border-line py-4 text-[17px] font-medium",
                      isActive(l.href) ? "text-gate-gold" : "text-ink",
                    )}
                  >
                    {l.label}
                    <ArrowUpRight className="h-4 w-4 text-ink-3" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <YearSwitcher align="left" placement="top" />
                  <LanguageMenu align="left" placement="top" />
                </div>
                <Link href={APPLY_URL} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-ink text-[14px] font-semibold text-ivory">
                  {t.apply} <ArrowUpRight className="h-4 w-4" />
                </Link>
                {session ? (
                  <>
                    <NextLink href={dashboardHref} className="inline-flex h-12 items-center justify-center rounded-full border border-line text-[14px] font-semibold text-ink">
                      {t.dashboard}
                    </NextLink>
                    <SignOutButton className="inline-flex h-12 items-center justify-center rounded-full border border-line text-[14px] font-semibold text-ink-2">
                      {t.signOut}
                    </SignOutButton>
                  </>
                ) : (
                  <Link href={PARTNERS_URL} className="inline-flex h-12 items-center justify-center rounded-full border border-line text-[14px] font-semibold text-ink">
                    {t.partners}
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
