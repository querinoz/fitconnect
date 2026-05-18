"use client";

import { MotionConfig } from "framer-motion";
import { LanguageProvider } from "@/lib/i18n-provider";
import { AuthStoreProvider } from "@/components/auth-store-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { useMounted } from "@/lib/use-mounted";

export function Providers({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();

  return (
    <MotionConfig
      reducedMotion="user"
      // SSR não anima — só após hidratação o cliente anima
      transition={mounted ? undefined : { duration: 0 }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <AuthStoreProvider>
            {children}
          </AuthStoreProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}