import Link from "next/link";
import { ThemeAwareLogo } from "@/components/brand/theme-aware-logo";

const ASSESSMENT_LINKS = [
  { href: "/about", label: "About G.A.T.E." },
  { href: "/structure", label: "Assessment Structure" },
  { href: "/subjects", label: "Subjects" },
  { href: "/onsite-assessment", label: "Hangzhou Training Camp" },
  { href: "/awards", label: "Awards & Certificates" },
];

const PARTICIPATE_LINKS = [
  { href: "/register", label: "Apply Now" },
  { href: "/academic-info", label: "Academic Information" },
  { href: "/partnerships", label: "Partnerships" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/rules", label: "Rules & Regulations" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Participation" },
  { href: "/academic-integrity", label: "Academic Integrity" },
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

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Brand row */}
        <div className="pt-16 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border">
          <div className="flex flex-col gap-5">
            <ThemeAwareLogo size="sm" showTagline={false} />
            <p className="text-sm font-light text-foreground/55 max-w-xs leading-[1.9]">
              International academic diagnostic and educational programs —
              an online assessment across six disciplines, and an onsite
              training camp at Xidian University, Hangzhou.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <a
              href="mailto:info@gate-assessment.org"
              className="text-sm font-light text-foreground/65 hover:text-foreground transition-colors"
            >
              info@gate-assessment.org
            </a>
            <div className="flex items-center gap-5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-foreground/30 hover:text-foreground/65 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-3 gap-10">
          {[
            { heading: "Assessment", links: ASSESSMENT_LINKS },
            { heading: "Participate", links: PARTICIPATE_LINKS },
            { heading: "Legal", links: LEGAL_LINKS },
          ].map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
                {heading}
              </span>
              <ul className="flex flex-col gap-3.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-light text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] font-light tracking-[0.12em] text-foreground/40">
            © G.A.T.E. Assessment 2026
          </p>
          <p className="text-[10px] font-light tracking-[0.08em] text-foreground/35">
            Global Academic &amp; Theoretical Excellence Assessment
          </p>
        </div>

      </div>
    </footer>
  );
}
