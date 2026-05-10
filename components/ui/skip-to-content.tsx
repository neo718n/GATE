import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkipToContentProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  targetId?: string;
}

export const SkipToContent = React.forwardRef<
  HTMLAnchorElement,
  SkipToContentProps
>(({ className, targetId = "main-content", children, ...props }, ref) => {
  return (
    <a
      ref={ref}
      href={`#${targetId}`}
      className={cn(
        // Visually hidden by default - positioned off-screen
        "absolute left-0 top-0 -translate-y-full",
        // High z-index to appear above navigation
        "z-50",
        // Visible on focus with high contrast styling
        "focus:translate-y-0",
        // Typography and spacing
        "inline-flex items-center justify-center px-6 py-3",
        "font-sans font-semibold text-sm",
        // Brand styling - light theme
        "bg-gate-800 text-gate-white",
        // Brand styling - dark theme
        "dark:bg-gate-gold dark:text-gate-800",
        // Hover state (when navigating back with Shift+Tab)
        "hover:bg-gate-700 dark:hover:bg-gate-gold-2",
        // Focus styles matching button.tsx pattern
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Border radius matching design system
        "rounded-xl",
        // Smooth transitions
        "transition-all duration-200",
        className,
      )}
      {...props}
    >
      {children || "Skip to main content"}
    </a>
  );
});
SkipToContent.displayName = "SkipToContent";
