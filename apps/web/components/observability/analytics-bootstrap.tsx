"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, trackEvent } from "@/lib/observability/posthog";
import { initSentryClient } from "@/lib/observability/sentry.client";

export function AnalyticsBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    const run = () => {
      initSentryClient();
      initPostHog();
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(run, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!pathname) return;
    if (pathname === "/") trackEvent("landing_view", { path: pathname });
    if (pathname === "/mobile") trackEvent("demo_open", { path: pathname });
    if (pathname.startsWith("/discover")) trackEvent("discover_view", { path: pathname });
    if (pathname.startsWith("/trainer/")) trackEvent("coach_profile", { path: pathname });
    if (pathname.includes("/signup")) trackEvent("signup", { path: pathname });
    if (pathname.includes("/dashboard")) trackEvent("readiness_view", { path: pathname });
  }, [pathname]);

  return null;
}
