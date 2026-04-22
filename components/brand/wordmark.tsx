import { cn } from "@/lib/utils";

type Variant = "dark" | "light" | "gold" | "mono-white" | "mono-dark";

const VARIANTS: Record<
  Variant,
  { text: string; dot: string }
> = {
  dark: { text: "text-gate-white", dot: "text-gate-gold" },
  light: { text: "text-gate-800", dot: "text-gate-gold" },
  gold: { text: "text-gate-800", dot: "text-gate-800/60" },
  "mono-white": { text: "text-gate-white", dot: "text-gate-white" },
  "mono-dark": { text: "text-gate-800", dot: "text-gate-800" },
};

export function Wordmark({
  variant = "dark",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const v = VARIANTS[variant];
  return (
    <span
      className={cn(
        "inline-flex font-sans font-black leading-none tracking-[0.22em] select-none",
        v.text,
        className,
      )}
    >
      G<span className={v.dot}>.</span>A<span className={v.dot}>.</span>T
      <span className={v.dot}>.</span>E<span className={v.dot}>.</span>
    </span>
  );
}
