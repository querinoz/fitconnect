import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "volt" | "live" | "amber" | "coral" | "neutral";

const variantClass: Record<Variant, string> = {
  volt: "bg-volt-500 text-ink-950",
  live: "bg-coral-500 text-ink-50 animate-pulse",
  amber: "bg-amber-400 text-ink-950",
  coral: "bg-coral-500 text-ink-50",
  neutral: "bg-glass-md text-ink-300 border border-glass-border"
};

export type PillProps = HTMLAttributes<HTMLSpanElement> & { variant?: Variant };

export function Pill({ variant = "volt", className, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 text-[9px] uppercase tracking-[0.12em] font-extrabold rounded-full",
        variantClass[variant],
        className
      )}
      {...rest}
    />
  );
}
