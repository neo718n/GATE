import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/brand/logo";

const EDITION_LINKS = [
  { href: "/#the-week", label: "The week" },
  { href: "/#papers", label: "Papers & answer keys" },
  { href: "/#partners", label: "Partners" },
  { href: "/#next-edition", label: "Next edition" },
];

const PROGRAMME_LINKS = [
  { href: "/about", label: "About G.A.T.E." },
  { href: "/onsite-assessment", label: "Onsite camp" },
  { href: "/structure", label: "Structure" },
  { href: "/subjects", label: "Subjects" },
  { href: "/awards", label: "Awards & certificates" },
  { href: "/academic-info", label: "Academic information" },
];

const TRUST_LINKS = [
  { href: "/verify", label: "Verify certificate" },
  { href: "/academic-integrity", label: "Academic integrity" },
  { href: "/rules", label: "Rules & regulations" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of participation" },
];

const BOTTOM_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/partnerships", label: "Partnerships" },
  { href: "/careers", label: "Careers" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/gate.assessment",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@gate-assessment",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20.07 12 20.07 12 20.07s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/gateassessment",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

function LinkColumn({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-white/55">
        {heading}
      </span>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] font-light text-gate-white/75 transition-colors hover:text-gate-gold-2"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-gate-800">
      <div className="h-0.5 bg-gradient-to-r from-gate-gold via-gate-gold-2 to-gate-gold" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Partnership row */}
        <div className="flex flex-wrap items-center justify-between gap-8 border-b border-gate-gold/20 py-8">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-white/55">
              In partnership with
            </span>
            <Image
              src="/partners/xidian-university.png"
              alt="Xidian University"
              width={96}
              height={96}
              className="h-12 w-auto brightness-0 invert opacity-85"
            />
            <Image
              src="/partners/edsquare-transparent.png"
              alt="EdSquare"
              width={128}
              height={30}
              className="h-[18px] w-auto brightness-0 invert opacity-85"
            />
          </div>
          <Link
            href="/verify"
            className="inline-flex h-11 items-center whitespace-nowrap rounded-xl border border-gate-gold/50 px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gate-gold-2 transition-colors hover:bg-gate-gold/12"
          >
            Verify a certificate
          </Link>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-5">
            <Logo size="sm" variant="dark" showTagline={false} />
            <p className="max-w-xs text-[13px] font-light leading-[1.9] text-gate-white/70">
              International academic diagnostic and educational programs, held with Xidian
              University, Hangzhou.
            </p>
            <a
              href="mailto:info@gate-assessment.org"
              className="text-[13px] font-light text-gate-white/70 transition-colors hover:text-gate-gold-2"
            >
              info@gate-assessment.org
            </a>
            <a
              href="https://t.me/gate_global_support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-fit items-center gap-2 rounded-full px-3.5 transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: "#2AABEE" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="text-xs font-semibold text-white">Telegram support</span>
            </a>
            <div className="flex items-center gap-5 pt-1">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-gate-white/40 transition-colors hover:text-gate-gold-2"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <LinkColumn heading="2026 Edition" links={EDITION_LINKS} />
          <LinkColumn heading="Programme" links={PROGRAMME_LINKS} />
          <LinkColumn heading="Trust & Legal" links={TRUST_LINKS} />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse items-center justify-between gap-5 border-t border-gate-gold/20 py-6 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <p className="text-[11px] font-light tracking-[0.12em] text-gate-white/55">
              © G.A.T.E. Assessment 2026
            </p>
            <p className="text-[11px] font-light tracking-[0.08em] text-gate-white/40">
              Global Academic &amp; Theoretical Excellence Assessment
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {BOTTOM_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] font-light tracking-[0.08em] text-gate-white/55 transition-colors hover:text-gate-gold-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
