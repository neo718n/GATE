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
      "flex h-11 w-full border border-border bg-card px-3 py-2 text-sm font-light text-foreground placeholder:text-gate-gray focus-visible:outline-none focus-visible:border-gate-gold disabled:cursor-not-allowed disabled:opacity-50 rounded-none transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
