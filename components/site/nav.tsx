"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/structure", label: "Structure" },
  { href: "/onsite-olympiad", label: "Onsite" },
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

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gate-gold/15 bg-gate-800/97 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo size="xs" variant="dark" showTagline={false} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-[0.3em] transition-colors",
                  isActive(link.href)
                    ? "text-gate-gold"
                    : "text-gate-gray hover:text-gate-gold",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.3em] transition-colors",
                  MORE_LINKS.some((l) => isActive(l.href))
                    ? "text-gate-gold"
                    : "text-gate-gray hover:text-gate-gold",
                )}
              >
                More <span className="text-[7px] leading-none">▾</span>
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 w-52 border border-gate-gold/15 bg-gate-800 shadow-xl">
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "block border-b border-gate-gold/10 px-5 py-3.5 text-[9px] font-semibold uppercase tracking-[0.25em] transition-colors last:border-0",
                        isActive(link.href)
                          ? "bg-gate-700/30 text-gate-gold"
                          : "text-gate-gray hover:bg-gate-700/20 hover:text-gate-gold",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-gate-white/55 hover:text-gate-white">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link href="/register">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block h-px w-6 bg-gate-white transition-transform duration-300",
                open && "translate-y-2.5 rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-gate-white transition-opacity duration-300",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-gate-white transition-transform duration-300",
                open && "-translate-y-2.5 -rotate-45",
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gate-gold/15 bg-gate-900">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-5">
            {ALL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-[0.3em] transition-colors",
                  isActive(link.href) ? "text-gate-gold" : "text-gate-white/65",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-3 border-t border-gate-gold/15">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Apply Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
