"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LaptopFrameProps = {
  children: ReactNode;
  className?: string;
};

/** MacBook-style frame with thin bezels and soft keyboard deck. */
export function LaptopFrame({ children, className }: LaptopFrameProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[720px]", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 top-8 h-48 rounded-full bg-brand-500/8 blur-3xl"
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-t-[1.1rem]",
          "border border-ink-700/80 bg-gradient-to-b from-[#2a2e36] to-[#12151a]",
          "shadow-[0_36px_72px_-24px_rgba(0,0,0,0.85),0_0_40px_-12px_var(--volt-glow)]",
          "ring-1 ring-white/[0.06]"
        )}
      >
        <div className="flex items-center gap-2 border-b border-ink-800/80 bg-ink-950/90 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-500/70 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-500/70" />
          <span className="ml-2 text-[10px] font-mono text-ink-500">
            fitconnect.app / dashboard
          </span>
        </div>
        <div className="relative min-h-[340px] bg-ink-950 sm:min-h-[360px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent"
          />
          {children}
        </div>
      </div>
      {/* Hinge + deck */}
      <div
        aria-hidden
        className="mx-auto h-[6px] w-[94%] rounded-b-md bg-gradient-to-b from-ink-700 to-ink-800"
      />
      <div
        aria-hidden
        className="mx-auto h-3 w-[92%] rounded-b-xl bg-gradient-to-b from-[#2a2e36] via-[#1a1d24] to-[#0e1014] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.6)]"
      />
      <div
        aria-hidden
        className="mx-auto -mt-0.5 h-1.5 w-[36%] rounded-full bg-ink-700/80"
      />
    </div>
  );
}
