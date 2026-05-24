"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n-provider";
import { AuthStoreProvider } from "@/components/auth-store-provider";
import { AnalyticsBootstrap } from "@/components/observability/analytics-bootstrap";
import { ToastHost } from "@/components/ui/toast-host";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { AppearanceProvider } from "@/lib/theme/appearance-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { AppIntroSplash } from "@/components/brand/app-intro-splash";
import type { Lang } from "@/lib/i18n";

function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => void reg.unregister());
    });
  }, []);
  return null;
}

export function Providers({
  children,
  initialLang
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  return (
    <AppearanceProvider>
      <ThemeProvider>
        <ConvexClientProvider>
          <LanguageProvider initialLang={initialLang}>
            <LenisProvider>
              <AuthStoreProvider>
                <DevServiceWorkerCleanup />
                <AnalyticsBootstrap />
                <ToastHost />
                <AppIntroSplash />
                {children}
              </AuthStoreProvider>
            </LenisProvider>
          </LanguageProvider>
        </ConvexClientProvider>
      </ThemeProvider>
    </AppearanceProvider>
  );
}
