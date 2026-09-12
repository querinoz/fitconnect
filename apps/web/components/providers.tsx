"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n-provider";
import { AuthStoreProvider } from "@/components/auth-store-provider";
import { ToastHost } from "@/components/ui/toast-host";
import { AppearanceProvider } from "@/lib/theme/appearance-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { AppIntroSplash } from "@/components/brand/app-intro-splash";
import type { Lang } from "@/lib/i18n";

const ConvexClientProvider = dynamic(
  () => import("@/components/convex-client-provider").then((m) => m.ConvexClientProvider),
  { ssr: false }
);
const FirebaseProvider = dynamic(
  () => import("@/components/firebase/firebase-provider").then((m) => m.FirebaseProvider),
  { ssr: false }
);
const AnalyticsBootstrap = dynamic(
  () =>
    import("@/components/observability/analytics-bootstrap").then((m) => m.AnalyticsBootstrap),
  { ssr: false }
);

function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        const script =
          reg.active?.scriptURL ?? reg.waiting?.scriptURL ?? reg.installing?.scriptURL ?? "";
        if (script.includes("firebase-messaging-sw")) return;
        void reg.unregister();
      });
    });
  }, []);
  return null;
}

/**
 * Firebase, Convex and PostHog are not required to read the marketing landing page.
 * Keep them off `/` so Lighthouse does not download those SDKs on first paint.
 * Auth, dashboard and every other route still mount the full runtime.
 */
function OptionalRuntimeSdks({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") {
    return <>{children}</>;
  }
  return (
    <ConvexClientProvider>
      <FirebaseProvider>
        <AnalyticsBootstrap />
        {children}
      </FirebaseProvider>
    </ConvexClientProvider>
  );
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
        <LanguageProvider initialLang={initialLang}>
          <LenisProvider>
            <AuthStoreProvider>
              <OptionalRuntimeSdks>
                <DevServiceWorkerCleanup />
                <ToastHost />
                <AppIntroSplash />
                {children}
              </OptionalRuntimeSdks>
            </AuthStoreProvider>
          </LenisProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AppearanceProvider>
  );
}
