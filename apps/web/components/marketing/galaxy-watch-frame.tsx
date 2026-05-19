"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GalaxyWatchFrameProps = {
  children: ReactNode;
  className?: string;
  /** `apple-ultra` — flat titanium case with action button + digital crown */
  variant?: "galaxy" | "apple-ultra";
};

/** Wearable frame — Galaxy or Apple Watch Ultra styling. */
export function GalaxyWatchFrame({
  children,
  className,
  variant = "galaxy"
}: GalaxyWatchFrameProps) {
  const isApple = variant === "apple-ultra";

  return (
    <div
      className={cn(
        "relative mx-auto",
        isApple ? "w-[min(100%,230px)]" : "w-[240px]",
        className
      )}
    >
      {/* Top band */}
      <div
        aria-hidden
        className={cn(
          "mx-auto rounded-t-[2rem] border border-b-0 border-ink-600/40 bg-gradient-to-b from-[#2a2e36] via-[#1c1f26] to-[#12151a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          isApple ? "h-16 w-[88px]" : "h-[4.5rem] w-[92px]"
        )}
      />

      {/* Case */}
      <div className={cn("relative mx-auto", isApple ? "w-[210px]" : "w-[220px]")}>
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-volt-500/10 blur-2xl"
        />
        <div
          className={cn(
            "relative p-[10px]",
            isApple
              ? "aspect-[4/5] rounded-[2.4rem]"
              : "aspect-square rounded-[2.85rem]",
            "bg-gradient-to-br from-[#3d424c] via-[#22262e] to-[#0e1014]",
            "shadow-[0_32px_64px_-20px_rgba(0,0,0,0.9),0_0_48px_-12px_var(--volt-glow),inset_0_1px_0_rgba(255,255,255,0.14)]",
            "ring-1 ring-white/[0.1]"
          )}
        >
          {isApple ? (
            <>
              <span
                aria-hidden
                className="absolute -left-[4px] top-[38%] h-8 w-[5px] rounded-l-md bg-gradient-to-r from-orange-500/90 to-orange-600/70 shadow-[0_0_8px_rgba(249,115,22,0.35)]"
              />
              <span
                aria-hidden
                className="absolute -right-[4px] top-[32%] h-10 w-[6px] rounded-r-md bg-gradient-to-l from-ink-500 to-ink-600 ring-1 ring-white/10"
              />
            </>
          ) : (
            <span
              aria-hidden
              className="absolute -right-[3px] top-1/2 h-11 w-[5px] -translate-y-1/2 rounded-r-md bg-gradient-to-l from-ink-600 to-ink-700"
            />
          )}
          <div
            className={cn(
              "relative h-full w-full overflow-hidden bg-black ring-1 ring-ink-800/90",
              isApple ? "rounded-[1.85rem]" : "rounded-[2.35rem]"
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent"
            />
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
              <span
                className={cn(
                  "rounded-full bg-ink-700/90",
                  isApple ? "h-1 w-14" : "h-1 w-12"
                )}
                aria-hidden
              />
            </div>
            <div className="relative h-full pt-3">{children}</div>
          </div>
        </div>
      </div>

      {/* Bottom band */}
      <div
        aria-hidden
        className={cn(
          "mx-auto rounded-b-[2rem] border border-t-0 border-ink-600/40 bg-gradient-to-b from-[#12151a] via-[#1c1f26] to-[#2a2e36] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]",
          isApple ? "h-[4.5rem] w-[88px]" : "h-[5rem] w-[92px]"
        )}
      />
    </div>
  );
}
