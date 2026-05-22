import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { eliteChipVariants, type EliteChipVariants } from "@/lib/design-system/variants";

export type EliteChipProps = ButtonHTMLAttributes<HTMLButtonElement> &
  EliteChipVariants & {
    as?: "button" | "span";
  };

export function EliteChip({
  className,
  tone,
  as = "button",
  ...props
}: EliteChipProps) {
  const Comp = as;
  return (
    <Comp
      className={cn(eliteChipVariants({ tone }), className)}
      {...(as === "button" ? { type: "button" } : {})}
      {...props}
    />
  );
}
