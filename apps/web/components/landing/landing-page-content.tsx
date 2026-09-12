"use client";

import { type ReactNode } from "react";
import { LandingShellV2 } from "@/components/landing/landing-shell-v2";
import { HeroEliteOs } from "@/components/marketing/landing-v2/hero-elite-os";
import { BelowFoldAfterHero } from "@/components/landing/below-fold-after-hero";

/** Elite OS landing — hero paints first; remaining acts hydrate after. */
export function LandingPageContent({ children }: { children?: ReactNode }) {
  return (
    <LandingShellV2 withBootGate>
      <HeroEliteOs />
      {children ?? <BelowFoldAfterHero />}
    </LandingShellV2>
  );
}
