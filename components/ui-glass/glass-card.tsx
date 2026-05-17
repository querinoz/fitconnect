import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "active" | "live";

const toneClass: Record<Tone, string> = {
  default: "bg-glass-md border-glass-border",
  active: "bg-glass-volt border-volt-500/30",
  live: "bg-glass-volt border-volt-500/40 shadow-volt-glow"
};

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone };

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ tone = "default", className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-glass border backdrop-blur-glass p-5 transition-colors",
        toneClass[tone],
        className
      )}
      {...rest}
    />
  )
);
GlassCard.displayName = "GlassCard";
