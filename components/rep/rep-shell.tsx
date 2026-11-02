"use client";

import { Link, useLocale } from "@/lib/i18n/client";
import { localizePath } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { CookieConsent } from "@/components/site/cookie-consent";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { Toaster } from "sonner";
import { LayoutGrid, Link2, LogOut, Plus, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { repSignOut } from "@/lib/actions/applications";
import { cn } from "@/lib/utils";

const NAV_LABELS = {
  en: { overview: "Overview", students: "Students", links: "Registration links", add: "Add student", signOut: "Sign out", badge: "Partners" },
  ru: { overview: "Обзор", students: "Ученики", links: "Ссылки для регистрации", add: "Добавить ученика", signOut: "Выйти", badge: "Партнёрам" },
};

const NAV_ITEMS = [
  { href: "/dashboard", key: "overview", icon: LayoutGrid },
  { href: "/students", key: "students", icon: Users },
  { href: "/links", key: "links", icon: Link2 },
] as const;

export function RepShell({
  rep,
  children,
}: {
  rep: { name: string; email: string; organization: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const L = NAV_LABELS[locale];
  const NAV = NAV_ITEMS.map((n) => ({ ...n, label: L[n.key] }));
  const router = useRouter();
  const [pending, start] = useTransition();
  // Pathname may arrive with or without the internal /rep prefix.
  const active = (href: string) => pathname === href || pathname.endsWith(href) || pathname.includes(`${href}/`);
  const initials = rep.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const signOut = () =>
    start(async () => {
      await repSignOut();
      router.replace(localizePath("/", locale));
      router.refresh();
    });

  return (
    <div className="site flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-line bg-white p-5 lg:flex">
        <div className="flex items-center gap-3 px-2 pb-8 pt-2">
          <Logo size="xs" variant="light" showTagline={false} />
          <span className="rounded-full bg-gate-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gate-gold">{L.badge}</span>
        </div>
        <Link
          href="/students/new"
          className="mb-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-ink text-[14px] font-semibold text-ivory transition-colors hover:bg-gate-700"
        >
          <Plus className="h-4 w-4" /> {L.add}
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "relative isolate flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium transition-colors",
                active(n.href) ? "text-ink" : "text-ink-3 hover:text-ink",
              )}
            >
              {active(n.href) && <motion.span layoutId="rep-nav" className="absolute inset-0 -z-10 rounded-2xl bg-ivory-2" />}
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher className="mt-auto mb-3 w-fit self-center" />
        <div className="flex items-center gap-3 rounded-2xl bg-ivory p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-gate-gold-2">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{rep.organization ?? rep.name}</p>
            <p className="truncate text-[12px] text-ink-3">{rep.email}</p>
          </div>
          <button type="button" onClick={signOut} disabled={pending} aria-label={L.signOut} className="rounded-xl p-2 text-ink-3 transition-colors hover:bg-white hover:text-ink">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo size="xs" variant="light" showTagline={false} />
          <div className="flex items-center gap-1">
            <LanguageSwitcher className="mr-1" />
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-label={n.label}
                className={cn("rounded-xl p-2.5", active(n.href) ? "bg-ivory-2 text-ink" : "text-ink-3")}
              >
                <n.icon className="h-[18px] w-[18px]" />
              </Link>
            ))}
            <button type="button" onClick={signOut} aria-label={L.signOut} className="rounded-xl p-2.5 text-ink-3">
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>
        <main className="flex-1 bg-ivory px-4 py-8 md:px-10 md:py-10">{children}</main>
      </div>
      <Toaster position="top-right" richColors closeButton />
      <CookieConsent />
    </div>
  );
}

export function PageTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gate-gold">{eyebrow}</span>
        <h1 className="font-serif text-4xl font-medium text-ink md:text-5xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
