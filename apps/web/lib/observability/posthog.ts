type PostHogEvent =
  | "signup"
  | "session_start"
  | "readiness_view"
  | "wearable_connect"
  | "community_map_view";

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === "undefined") return;
  if (window.posthog) return;
  if (process.env.NODE_ENV === "development") {
    console.info("[observability] PostHog key configured (load posthog-js in layout to enable)");
  }
}

export function trackEvent(event: PostHogEvent, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.capture(event, properties);
    return;
  }
  if (process.env.NODE_ENV === "development") {
    console.debug("[posthog]", event, properties);
  }
}
