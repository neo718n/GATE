import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-12 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-light text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-gate-gold focus-visible:ring-2 focus-visible:ring-gate-gold/15 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
