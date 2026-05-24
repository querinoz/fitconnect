"use client";

import type { ReactNode } from "react";
import { CrosshairBg } from "@/components/elite-os";

/** Elite OS landing shell — no editorial gate, EOS floor + crosshair. */
export function LandingShellV2({ children }: { children: ReactNode }) {
  return (
    <CrosshairBg className="eos-floor relative min-h-dvh text-eos-on-surface">
      <main id="main" className="relative flex w-full flex-col">
        {children}
      </main>
    </CrosshairBg>
  );
}
