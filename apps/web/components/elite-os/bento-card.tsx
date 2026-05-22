import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { bentoCardVariants, type BentoCardVariants } from "@/lib/design-system/variants";

export type BentoCardProps = HTMLAttributes<HTMLDivElement> &
  BentoCardVariants & {
    label?: ReactNode;
    headerAction?: ReactNode;
  };

/** Telemetry bento cell — 24px radius, machined edge, optional label-caps header. */
export function BentoCard({
  className,
  elevation,
  interactive,
  padding,
  label,
  headerAction,
  children,
  ...props
}: BentoCardProps) {
  return (
    <div
      data-elevation={elevation === "glass" ? "glass" : elevation}
      className={cn(bentoCardVariants({ elevation, interactive, padding }), className)}
      {...props}
    >
      {(label || headerAction) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          {label ? <span className="eos-label-caps opacity-60">{label}</span> : null}
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}
