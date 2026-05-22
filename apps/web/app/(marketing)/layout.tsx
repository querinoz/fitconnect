"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MarketingShell } from "@/components/shell/marketing-shell";

const AUTH_PATHS = new Set(["/signin", "/signup"]);

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.has(pathname);

  return (
    <MarketingShell variant={isAuth ? "auth" : "default"} showFooter={!isAuth} showInstallPrompt={!isAuth}>
      {children}
    </MarketingShell>
  );
}
