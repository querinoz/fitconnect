"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, trackEvent } from "@/lib/observability/posthog";
import { initSentryClient } from "@/lib/observability/sentry.client";
import { initFirebaseClient } from "@/lib/firebase";

export function AnalyticsBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    const run = () => {
      initSentryClient();
      initPostHog();
      void initFirebaseClient();
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
    const event =
      pathname === "/"
        ? "landing_view"
        : pathname.startsWith("/discover")
          ? "discover_view"
          : pathname.startsWith("/trainer/")
            ? "coach_profile"
            : pathname.includes("/signup")
              ? "signup"
              : pathname.includes("/dashboard")
                ? "readiness_view"
                : null;
    if (!event) return;
    trackEvent(event, { path: pathname });
    void fetch("/api/v1/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event, path: pathname })
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
