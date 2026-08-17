"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { eliteButtonVariants, type EliteButtonVariants } from "@/lib/design-system/variants";

export type EliteButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  EliteButtonVariants & {
    asChild?: boolean;
    loading?: boolean;
  };

export const EliteButton = React.forwardRef<HTMLButtonElement, EliteButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(eliteButtonVariants({ variant, size }), "min-h-11", className)}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {asChild || !loading ? children : (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">…</span>
        )}
      </Comp>
    );
  }
);
EliteButton.displayName = "EliteButton";
