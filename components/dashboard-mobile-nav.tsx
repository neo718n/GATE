"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

export function DashboardMobileNav({
  links,
  roleLabel,
  email,
}: {
  links: NavLink[];
  roleLabel: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
        className="flex flex-col justify-center gap-[5px] w-8 h-8 p-1"
      >
        <span
          className={`block h-[2px] bg-gate-800 transition-transform origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`}
        />
        <span
          className={`block h-[2px] bg-gate-800 transition-opacity ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-[2px] bg-gate-800 transition-transform origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`}
        />
      </button>

      {open && (
        <div className="fixed inset-0 top-[57px] z-40 bg-white border-t border-gate-fog flex flex-col">
          <div className="px-5 py-3 border-b border-gate-fog">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
              {roleLabel}
            </p>
            <p className="text-xs font-light text-gate-800/50 mt-0.5 truncate">{email}</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-3">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] border-l-2 transition-colors ${
                    active
                      ? "border-gate-gold text-gate-gold"
                      : "border-transparent text-gate-800/50 hover:text-gate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
