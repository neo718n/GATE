"use client";

import { useTheme } from "@/components/theme-provider";
import { Logo } from "./logo";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

export function ThemeAwareLogo({
  size = "md",
  showTagline = true,
  className,
}: {
  size?: Size;
  showTagline?: boolean;
  className?: string;
}) {
  const { theme } = useTheme();
  return (
    <Logo
      size={size}
      variant={theme === "dark" ? "dark" : "light"}
      showTagline={showTagline}
      className={className}
    />
  );
}
