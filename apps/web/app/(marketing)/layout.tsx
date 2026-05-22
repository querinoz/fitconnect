"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MarketingShell } from "@/components/shell/marketing-shell";

const AUTH_PATHS = new Set(["/signin", "/signup"]);
const FOCUS_PATHS = new Set(["/mobile"]);

function isFocusPath(pathname: string) {
  return (
    AUTH_PATHS.has(pathname) ||
    FOCUS_PATHS.has(pathname) ||
    pathname.startsWith("/onboarding/")
  );
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFocus = isFocusPath(pathname);

  return (
    <MarketingShell
      variant={isFocus ? "auth" : "default"}
      showFooter={!isFocus}
      showInstallPrompt={!isFocus || pathname === "/mobile"}
    >
      {children}
    </MarketingShell>
  );
}
