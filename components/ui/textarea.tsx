import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full border border-border bg-card px-3 py-2 text-sm font-light text-foreground placeholder:text-gate-gray focus-visible:outline-none focus-visible:border-gate-gold disabled:cursor-not-allowed disabled:opacity-50 rounded-none transition-colors resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
