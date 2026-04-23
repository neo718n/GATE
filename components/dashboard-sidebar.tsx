"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

export function DashboardSidebar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href.length > 1 && pathname.startsWith(href + "/"));

  return (
    <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors border-l-2",
            isActive(link.href)
              ? "text-gate-800 bg-gate-fog border-gate-gold pl-[10px]"
              : "text-gate-800/50 hover:text-gate-800 hover:bg-gate-fog/60 border-transparent",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
