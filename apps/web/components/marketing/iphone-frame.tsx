"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IphoneFrameProps = {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  minimal?: boolean;
};

/** Realistic iPhone 17 Pro–style chrome with soft 3D lighting. */
export function IphoneFrame({
  children,
  className,
  screenClassName,
  minimal = false
}: IphoneFrameProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[320px] sm:max-w-[340px]",
        className
      )}
    >
      {/* Ambient rim light */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[3.25rem] bg-gradient-to-br from-volt-500/20 via-transparent to-plasma-500/15 blur-2xl"
      />

      <div
        className={cn(
          "relative rounded-[3rem] p-[11px]",
          "bg-gradient-to-b from-[#3a3f4a] via-[#1a1d24] to-[#0a0c10]",
          "shadow-[0_40px_80px_-24px_rgba(0,0,0,0.85),0_0_60px_-16px_var(--volt-glow),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "ring-1 ring-white/[0.08]"
        )}
      >
        {/* Titanium edge highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/[0.06]"
        />

        {/* Side buttons */}
        <span
          aria-hidden
          className="absolute -left-[3px] top-[92px] h-9 w-[4px] rounded-l-md bg-gradient-to-r from-ink-600 to-ink-700"
        />
        <span
          aria-hidden
          className="absolute -left-[3px] top-[138px] h-14 w-[4px] rounded-l-md bg-gradient-to-r from-ink-600 to-ink-700"
        />
        <span
          aria-hidden
          className="absolute -right-[3px] top-[112px] h-[4.5rem] w-[4px] rounded-r-md bg-gradient-to-l from-ink-600 to-ink-700"
        />

        {!minimal && (
          <div
            aria-hidden
            className="absolute left-1/2 top-[19px] z-20 h-[28px] w-[112px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)] ring-1 ring-white/[0.04]"
          />
        )}

        <div
          className={cn(
            "relative overflow-hidden rounded-[2.35rem] bg-ink-950",
            "ring-1 ring-black/80",
            screenClassName
          )}
        >
          {/* Glass glare */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/[0.09] via-transparent to-transparent"
          />

          {!minimal && (
            <div
              aria-hidden
              className="relative z-10 flex items-center justify-between px-7 pt-3.5 pb-1 text-[10px] font-medium text-ink-400 tabular-nums"
            >
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-ink-500" />
                <span className="h-2.5 w-4 rounded-sm bg-ink-500" />
              </span>
            </div>
          )}
          <div className="relative z-10">{children}</div>
        </div>

        <div
          aria-hidden
          className="mx-auto mt-2.5 h-1 w-[118px] rounded-full bg-white/20"
        />
      </div>
    </div>
  );
}
