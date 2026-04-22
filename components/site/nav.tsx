"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/structure", label: "Structure" },
  { href: "/subjects", label: "Subjects" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-gate-900/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo size="xs" variant="dark" showTagline={false} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors",
                  pathname === link.href
                    ? "text-gate-gold"
                    : "text-gate-white/60 hover:text-gate-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link href="/register">Apply Now</Link>
            </Button>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block h-px w-6 bg-gate-white transition-transform",
                open && "translate-y-2.5 rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-gate-white transition-opacity",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-gate-white transition-transform",
                open && "-translate-y-2.5 -rotate-45",
              )}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-gate-900">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.3em]",
                  pathname === link.href ? "text-gate-gold" : "text-gate-white/70",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link href="/register" onClick={() => setOpen(false)}>Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
