import * as React from "react";
import { cn } from "@/lib/utils";
import { eliteInputVariants, type EliteInputVariants } from "@/lib/design-system/variants";

export type EliteInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  EliteInputVariants;

export const EliteInput = React.forwardRef<HTMLInputElement, EliteInputProps>(
  ({ className, size, state, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(eliteInputVariants({ size, state }), className)}
      {...props}
    />
  )
);
EliteInput.displayName = "EliteInput";
