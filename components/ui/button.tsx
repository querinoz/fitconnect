"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 hover:opacity-90 shadow-lg shadow-brand-500/10",
        secondary:
          "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100 hover:bg-ink-200 dark:hover:bg-ink-700",
        outline:
          "border border-ink-200 dark:border-ink-700 bg-transparent hover:bg-ink-100/60 dark:hover:bg-ink-800/60",
        ghost:
          "bg-transparent hover:bg-ink-100/60 dark:hover:bg-ink-800/60 text-ink-700 dark:text-ink-200",
        danger: "bg-red-500 hover:bg-red-600 text-white"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
