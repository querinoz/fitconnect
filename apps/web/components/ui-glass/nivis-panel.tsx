import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Elite OS glass surface — unified panel used across dashboard & landing.
 * Migrated from legacy Nivis glass to EOS bento system.
 */
export function NivisPanel({
  children,
  className,
  interactive = false,
  id
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "eos-bento-card relative rounded-[var(--eos-radius-card)] border border-[var(--eos-glass-border)]",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)]",
        "backdrop-blur-[24px] [backdrop-filter:blur(24px)_saturate(130%)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_80px_-40px_rgba(0,0,0,0.85)]",
        interactive && "transition hover:border-[var(--eos-voltline-dim)]",
        className
      )}
    >
      {children}
    </div>
  );
}

