import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "dark" | "light" | "gold" | "mono-white" | "mono-dark";

const SIZES: Record<
  Size,
  { wm: string; rule: string; tag: string; gap: string; showTag: boolean }
> = {
  xs: { wm: "text-base", rule: "w-20", tag: "text-[6px]", gap: "gap-1", showTag: false },
  sm: { wm: "text-xl", rule: "w-32", tag: "text-[7px]", gap: "gap-2", showTag: true },
  md: { wm: "text-3xl", rule: "w-48", tag: "text-[8px]", gap: "gap-2.5", showTag: true },
  lg: { wm: "text-5xl", rule: "w-72", tag: "text-[9px]", gap: "gap-3", showTag: true },
  xl: { wm: "text-5xl sm:text-7xl md:text-8xl", rule: "w-full", tag: "text-[8px] sm:text-[10px] md:text-xs", gap: "gap-4", showTag: true },
};

const RULE_COLORS: Record<Variant, string> = {
  dark: "from-transparent via-gate-gold to-transparent",
  light: "from-transparent via-gate-gold to-transparent",
  gold: "from-transparent via-gate-800 to-transparent",
  "mono-white": "from-transparent via-gate-white to-transparent",
  "mono-dark": "from-transparent via-gate-800 to-transparent",
};

const TAG_COLORS: Record<Variant, string> = {
  dark: "text-gate-white/55",
  light: "text-gate-800/55",
  gold: "text-gate-800/65",
  "mono-white": "text-gate-white/55",
  "mono-dark": "text-gate-800/55",
};

export function Logo({
  size = "md",
  variant = "dark",
  showTagline = true,
  className,
}: {
  size?: Size;
  variant?: Variant;
  showTagline?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  const renderTag = showTagline && s.showTag;

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center",
        s.gap,
        className,
      )}
    >
      <Wordmark variant={variant} className={s.wm} />
      {renderTag && (
        <>
          <div
            className={cn(
              "h-px bg-gradient-to-r opacity-60",
              s.rule,
              RULE_COLORS[variant],
            )}
          />
          <span
            className={cn(
              "text-center font-sans font-light uppercase tracking-[0.4em]",
              s.tag,
              TAG_COLORS[variant],
            )}
          >
            Global Academic &amp; Theoretical Excellence Olympiad
          </span>
        </>
      )}
    </div>
  );
}
