import Link from "next/link";

const ORG_LINKS = [
  { href: "/about", label: "About G.A.T.E." },
  { href: "/structure", label: "Structure" },
  { href: "/onsite-olympiad", label: "China Final" },
  { href: "/awards", label: "Awards" },
];

const LEGAL_LINKS = [
  { href: "/rules", label: "Rules & Regulations" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Participation" },
  { href: "/academic-integrity", label: "Academic Integrity Policy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gate-gold/10 bg-gate-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Column 1 — Organization */}
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-gate-gray/60">Organization</span>
            <ul className="flex flex-col gap-3">
              {ORG_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs font-light text-gate-white/35 hover:text-gate-white/60 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Legal & Academic */}
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-gate-gray/60">Legal & Academic</span>
            <ul className="flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs font-light text-gate-white/35 hover:text-gate-white/60 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div className="flex flex-col gap-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-gate-gray/60">Contact</span>
            <div className="flex flex-col gap-3">
              <a href="mailto:info@gate-olympiad.com" className="text-xs font-light text-gate-white/35 hover:text-gate-white/60 transition-colors">
                info@gate-olympiad.com
              </a>
              <span className="text-xs font-light text-gate-white/25">
                Operating from Kazakhstan
              </span>
              <div className="flex items-center gap-4 mt-1">
                <a
                  href="https://linkedin.com/company/gate-olympiad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gate-white/30 hover:text-gate-white/55 transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="https://t.me/gate_olympiad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gate-white/30 hover:text-gate-white/55 transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-gate-gold/8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[9px] font-light tracking-[0.15em] text-gate-white/20">
            © G.A.T.E. Olympiad 2026
          </p>
          <p className="text-[9px] font-light tracking-[0.1em] text-gate-white/20">
            Global Academic & Theoretical Excellence Olympiad
          </p>
        </div>
      </div>
    </footer>
  );
}
