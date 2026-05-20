"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/examPartner", label: "Dashboard" },
  { href: "/examPartner/exams", label: "Exams" },
  { href: "/examPartner/pool", label: "Pool" },
  { href: "/examPartner/results", label: "Results" },
  { href: "/examPartner/docs", label: "Docs" },
  { href: "/examPartner/settings", label: "Settings" },
];

export function PortalNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/examPartner"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  async function handleSignOut() {
    await signOut();
    window.location.href = "/examPartner-login";
  }

  return (
    <div className="flex items-center gap-1">
      <nav className="flex items-center gap-1">
        {LINKS.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors",
                active
                  ? "bg-gate-gold/12 text-gate-gold"
                  : "text-foreground/55 hover:text-foreground hover:bg-muted/60",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleSignOut}
        className="ml-1 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/55 transition-colors hover:bg-destructive/8 hover:text-destructive"
      >
        Sign out
      </button>
    </div>
  );
}
