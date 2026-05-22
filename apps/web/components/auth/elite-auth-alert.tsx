import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneClass = {
  error: "border-eos-alert/40 bg-eos-alert/10 text-eos-alert",
  success: "border-eos-performance/40 bg-emerald-500/10 text-emerald-400",
  info: "border-eos-iris/30 bg-eos-iris-glow/10 text-eos-iris-soft",
  warning: "border-eos-recovery/40 bg-amber-400/10 text-amber-300"
} as const;

export function EliteAuthAlert({
  children,
  tone = "error",
  className
}: {
  children: ReactNode;
  tone?: keyof typeof toneClass;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "rounded-[var(--eos-radius-nested)] border px-3 py-2 text-sm",
        toneClass[tone],
        className
      )}
    >
      {children}
    </div>
  );
}

export function EliteAuthDivider({ label }: { label: ReactNode }) {
  return (
    <div className="relative py-1">
      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-eos-outline" />
      <span className="relative mx-auto block w-fit bg-eos-floor px-3 text-[11px] uppercase tracking-widest text-eos-on-surface-subtle">
        {label}
      </span>
    </div>
  );
}
