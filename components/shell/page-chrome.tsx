"use client";

import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { DemoBanner } from "@/components/demo-banner";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";

/**
 * Wraps marketing pages that also live inside the authenticated app shell.
 * Logged-in users see only content (MobileShell provides chrome).
 * Guests see demo banner + marketing nav + footer.
 */
export function PageChrome({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);

  if (!hydrated) {
    return <div className="min-h-dvh bg-ink-950">{children}</div>;
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <>
      <DemoBanner />
      <Nav />
      {children}
      <Footer />
    </>
  );
}
