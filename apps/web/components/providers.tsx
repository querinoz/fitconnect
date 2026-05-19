"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n-provider";
import { AuthStoreProvider } from "@/components/auth-store-provider";
import { AnalyticsBootstrap } from "@/components/observability/analytics-bootstrap";
import { ToastHost } from "@/components/ui/toast-host";
import { AppearanceProvider } from "@/lib/theme/appearance-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppearanceProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthStoreProvider>
            <DevServiceWorkerCleanup />
            <AnalyticsBootstrap />
            <ToastHost />
            {children}
          </AuthStoreProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AppearanceProvider>
  );
}
