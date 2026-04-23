import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-800/65 mb-2",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";
