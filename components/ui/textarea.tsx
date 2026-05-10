import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-light text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-gate-gold focus-visible:ring-2 focus-visible:ring-gate-gold/15 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
