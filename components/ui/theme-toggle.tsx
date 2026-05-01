"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDark ? "bg-gate-gold" : "bg-gate-800/20",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none flex h-5 w-5 items-center justify-center rounded-full shadow-sm ring-0 transition-transform duration-300",
          isDark
            ? "translate-x-5 bg-gate-800"
            : "translate-x-0 bg-gate-white",
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-gate-gold" />
        ) : (
          <Sun className="h-3 w-3 text-gate-800/60" />
        )}
      </span>
    </button>
  );
}
