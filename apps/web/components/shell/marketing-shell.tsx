"use client";

import type { ReactNode } from "react";
import { LandingCanvas } from "@/components/marketing/landing-canvas";
import { MarketingNav } from "@/components/nav/marketing-nav";
import { Footer } from "@/components/footer";
import { DemoBanner } from "@/components/demo-banner";
import { GlobalInstallPrompt } from "@/components/shell/global-install-prompt";
import { cn } from "@/lib/utils";

type MarketingShellVariant = "default" | "auth" | "immersive";

type MarketingShellProps = {
  children: ReactNode;
  variant?: MarketingShellVariant;
  showFooter?: boolean;
  showInstallPrompt?: boolean;
  className?: string;
};

/**
 * Unified marketing shell — canvas, pill nav, demo banner, footer.
 * Replaces per-page Nav + Footer duplication.
 */
export function MarketingShell({
  children,
  variant = "default",
  showFooter = true,
  showInstallPrompt = true,
  className
}: MarketingShellProps) {
  const isAuth = variant === "auth";

  return (
    <>
      <DemoBanner />
      <MarketingNav minimal={isAuth} />
      <LandingCanvas subdued={variant !== "immersive"} />
      <div
        className={cn(
          "fc-marketing-main relative min-h-dvh text-ink-100",
          isAuth && "flex flex-col",
          className
        )}
      >
        {children}
        {showFooter && !isAuth ? <Footer /> : null}
      </div>
      {showInstallPrompt && !isAuth ? <GlobalInstallPrompt /> : null}
    </>
  );
}
