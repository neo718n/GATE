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
      "flex h-11 w-full border border-gate-800/20 bg-white px-3 py-2 text-sm font-light text-gate-800 placeholder:text-gate-800/30 focus-visible:outline-none focus-visible:border-gate-gold focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 rounded-none transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
