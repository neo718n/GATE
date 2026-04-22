import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const QUICK_LINKS = [
  { href: "/structure", label: "Competition Structure" },
  { href: "/subjects", label: "Subject Areas" },
  { href: "/contact", label: "Contact Us" },
];

const PORTAL_LINKS = [
  { href: "/register", label: "Apply Now" },
  { href: "/login", label: "Participant Login" },
  { href: "/dashboard", label: "My Dashboard" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-gate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 flex flex-col gap-6">
            <Logo size="sm" variant="dark" showTagline />
            <p className="text-sm font-light text-gate-white/50 leading-relaxed max-w-sm">
              An international academic competition uniting exceptional students
              across disciplines, culminating in a global onsite olympiad at
              Xidian University, Hangzhou Campus, China.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gate-gray">
              Navigate
            </span>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-gate-white/55 hover:text-gate-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gate-gray">
              Portal
            </span>
            <ul className="flex flex-col gap-3">
              {PORTAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-gate-white/55 hover:text-gate-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-light tracking-[0.1em] text-gate-white/30">
            © {new Date().getFullYear()} G.A.T.E. Olympiad. All rights reserved.
          </p>
          <p className="text-[10px] font-light tracking-[0.1em] text-gate-white/30">
            Hosted at Xidian University · Hangzhou Campus · China
          </p>
        </div>
      </div>
    </footer>
  );
}
