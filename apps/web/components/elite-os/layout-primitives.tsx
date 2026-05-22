import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BentoGridProps = HTMLAttributes<HTMLDivElement> & {
  cols?: 1 | 2 | 3 | 4 | 12;
};

const colClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  12: "grid-cols-1 md:grid-cols-6 xl:grid-cols-12"
};

/** Modular bento grid — 20px gap, responsive columns. */
export function BentoGrid({ className, cols = 3, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn("eos-bento-grid", colClass[cols], className)}
      style={{ gap: "var(--eos-bento-gap)" }}
      {...props}
    >
      {children}
    </div>
  );
}

export function AiInsightCard({
  title,
  body,
  action,
  className
}: {
  title: ReactNode;
  body: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--eos-radius-card)] border border-eos-iris/25 bg-eos-iris-glow/10 p-5",
        className
      )}
    >
      <p className="eos-label-caps text-eos-iris-soft">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-eos-on-surface-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function TelemetryShell({
  label,
  children,
  className
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("eos-bento-card p-5", className)}>
      {label ? <span className="eos-label-caps mb-3 block opacity-50">{label}</span> : null}
      <div className="eos-chart-glow rounded-[var(--eos-radius-nested)]">{children}</div>
    </div>
  );
}
