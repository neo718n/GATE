import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-sans font-semibold uppercase tracking-[0.25em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gate-800 text-gate-white hover:bg-gate-700 border border-transparent",
        gold:
          "bg-gate-gold text-gate-800 hover:bg-gate-gold-2 border border-transparent",
        outline:
          "bg-transparent text-current border border-current/30 hover:border-current",
        ghost:
          "bg-transparent text-current hover:bg-current/5",
      },
      size: {
        sm: "h-9 px-4 text-[10px]",
        md: "h-11 px-6 text-[11px]",
        lg: "h-14 px-10 text-[12px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
