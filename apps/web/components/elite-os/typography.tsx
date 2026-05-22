import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LabelCaps({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("eos-label-caps", className)} {...props}>
      {children}
    </span>
  );
}

export function MetricDisplay({
  value,
  unit,
  delta,
  className
}: {
  value: ReactNode;
  unit?: ReactNode;
  delta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline gap-1.5">
        <span className="eos-data-metric">{value}</span>
        {unit ? <span className="text-sm text-eos-on-surface-muted">{unit}</span> : null}
      </div>
      {delta ? <p className="text-xs font-medium text-eos-voltline">{delta}</p> : null}
    </div>
  );
}

export function DisplayTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn("eos-display text-eos-on-surface", className)} {...props}>
      {children}
    </h1>
  );
}

export function Headline({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("eos-headline text-eos-on-surface", className)} {...props}>
      {children}
    </h2>
  );
}

export function BodyText({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("eos-body", className)} {...props}>
      {children}
    </p>
  );
}
