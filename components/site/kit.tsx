import { Link } from "@/lib/i18n/client";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SplitHeading } from "@/components/site/motion/reveal";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gate-gold",
        className,
      )}
    >
      <span className="h-px w-8 bg-gate-gold/60" />
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-14 flex flex-col gap-5 md:mb-20",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <SplitHeading
        text={title}
        className={cn(
          "font-serif text-4xl font-medium leading-[1.05] tracking-[-0.01em] text-ink md:text-6xl",
          align === "center" && "max-w-4xl",
        )}
      />
      {lead && (
        <Reveal delay={0.15}>
          <p className={cn("text-base leading-[1.75] text-ink-2 md:text-lg", align === "center" ? "max-w-2xl" : "max-w-xl")}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}

const BUTTON_BASE =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[13px] font-semibold tracking-[0.04em] transition-all duration-300 active:scale-[0.97]";

const BUTTON_VARIANTS = {
  ink: "bg-ink text-ivory shadow-[0_12px_30px_-12px_rgba(11,31,58,0.55)] hover:bg-gate-700 hover:shadow-[0_18px_40px_-14px_rgba(11,31,58,0.6)]",
  gold: "bg-gate-gold text-ink shadow-[0_12px_30px_-12px_rgba(201,153,58,0.7)] hover:bg-gate-gold-2",
  outline: "border border-ink/15 bg-white/50 text-ink backdrop-blur hover:border-gate-gold hover:bg-white",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "ink",
  className,
  arrow = true,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof BUTTON_VARIANTS;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}>
      {children}
      {arrow && (
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

/** Shared hero for inner pages: ivory field, gold aura, faint tech grid. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line px-6 pb-20 pt-36 md:pb-28 md:pt-44">
      <div className="gold-aura pointer-events-none absolute inset-0" />
      <div className="tech-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <SplitHeading
          as="h1"
          text={title}
          className="max-w-5xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.015em] text-ink md:text-7xl lg:text-8xl"
        />
        {lead && (
          <Reveal delay={0.2}>
            <p className="max-w-2xl text-base leading-[1.75] text-ink-2 md:text-lg">{lead}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.3}>{children}</Reveal>}
      </div>
    </section>
  );
}

export function Section({
  id,
  children,
  className,
  tone = "ivory",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "ivory" | "ivory-2" | "white";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-20 px-6 py-24 md:py-36",
        tone === "ivory" && "bg-ivory",
        tone === "ivory-2" && "bg-ivory-2",
        tone === "white" && "bg-white",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
