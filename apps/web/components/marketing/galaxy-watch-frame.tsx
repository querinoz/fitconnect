"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GalaxyWatchFrameProps = {
  children: ReactNode;
  className?: string;
};

/** Galaxy Watch Ultra–style frame — rounded square case + sport band. */
export function GalaxyWatchFrame({ children, className }: GalaxyWatchFrameProps) {
  return (
    <div className={cn("relative mx-auto w-[240px]", className)}>
      {/* Top band */}
      <div
        aria-hidden
        className="mx-auto h-[4.5rem] w-[92px] rounded-t-[2rem] border border-b-0 border-ink-600/40 bg-gradient-to-b from-[#2a2e36] via-[#1c1f26] to-[#12151a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      />

      {/* Case */}
      <div className="relative mx-auto w-[220px]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-volt-500/10 blur-2xl"
        />
        <div
          className={cn(
            "relative aspect-square rounded-[2.85rem] p-[10px]",
            "bg-gradient-to-br from-[#3d424c] via-[#22262e] to-[#0e1014]",
            "shadow-[0_32px_64px_-20px_rgba(0,0,0,0.9),0_0_48px_-12px_var(--volt-glow),inset_0_1px_0_rgba(255,255,255,0.14)]",
            "ring-1 ring-white/[0.1]"
          )}
        >
          <span
            aria-hidden
            className="absolute -right-[3px] top-1/2 h-11 w-[5px] -translate-y-1/2 rounded-r-md bg-gradient-to-l from-ink-600 to-ink-700"
          />
          <div className="relative h-full w-full overflow-hidden rounded-[2.35rem] bg-black ring-1 ring-ink-800/90">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent"
            />
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2.5">
              <span className="h-1 w-12 rounded-full bg-ink-700/90" aria-hidden />
            </div>
            <div className="relative h-full pt-3">{children}</div>
          </div>
        </div>
      </div>

      {/* Bottom band */}
      <div
        aria-hidden
        className="mx-auto h-[5rem] w-[92px] rounded-b-[2rem] border border-t-0 border-ink-600/40 bg-gradient-to-b from-[#12151a] via-[#1c1f26] to-[#2a2e36] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
      />
    </div>
  );
}
