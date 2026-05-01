"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/structure", label: "Structure" },
  { href: "/onsite-assessment", label: "Onsite" },
  { href: "/subjects", label: "Subjects" },
  { href: "/partnerships", label: "Partnerships" },
];

const MORE_LINKS = [
  { href: "/awards", label: "Awards & Certificates" },
  { href: "/careers", label: "Careers" },
  { href: "/academic-info", label: "Academic Information" },
  { href: "/contact", label: "Contact" },
];

const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

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
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const dashboardHref = session
    ? (ROLE_HOME[(session.user as any).role ?? "participant"] ?? "/participant")
    : "/participant";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [moreOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)}>
            <ThemeAwareLogo size="xs" showTagline={false} />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-7">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors",
                  isActive(link.href)
                    ? "text-gate-gold"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

            <div ref={moreRef} className="relative self-stretch flex items-center">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors",
                  MORE_LINKS.some((l) => isActive(l.href))
                    ? "text-gate-gold"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                More <span className="text-[8px] leading-none">▾</span>
              </button>
              {moreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "block border-b border-border/60 px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors last:border-0",
                        isActive(link.href)
                          ? "bg-muted text-gate-gold"
                          : "text-foreground/65 hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <>
                <span className="text-[11px] font-light text-foreground/50 max-w-[140px] truncate">
                  {session.user.name}
                </span>
                <Button variant="gold" size="sm" asChild>
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="gold" size="sm" asChild>
                  <Link href="/register">Apply Now</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className={cn("block h-px w-6 bg-foreground transition-transform duration-300", open && "translate-y-2.5 rotate-45")} />
            <span className={cn("block h-px w-6 bg-foreground transition-opacity duration-300", open && "opacity-0")} />
            <span className={cn("block h-px w-6 bg-foreground transition-transform duration-300", open && "-translate-y-2.5 -rotate-45")} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-5">
            {ALL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors",
                  isActive(link.href) ? "text-gate-gold" : "text-foreground/70",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <ThemeToggle />
              <div className="flex flex-col gap-2 flex-1">
                {session ? (
                  <>
                    <Button variant="gold" size="sm" asChild>
                      <Link href={dashboardHref} onClick={() => setOpen(false)}>Dashboard</Link>
                    </Button>
                    <SignOutButton className="inline-flex items-center justify-center h-9 px-4 rounded-xl border border-border text-xs font-semibold text-foreground/70 hover:bg-muted transition-colors w-full">
                      Sign Out
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
                    </Button>
                    <Button variant="gold" size="sm" asChild>
                      <Link href="/register" onClick={() => setOpen(false)}>Apply Now</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
