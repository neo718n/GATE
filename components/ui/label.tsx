import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-[9px] font-semibold uppercase tracking-[0.3em] text-gate-gray mb-2",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";
