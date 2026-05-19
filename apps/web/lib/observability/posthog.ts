type PostHogEvent =
  | "landing_view"
  | "demo_open"
  | "discover_view"
  | "coach_profile"
  | "book_intro"
  | "signup"
  | "email_capture"
  | "session_start"
  | "readiness_view"
  | "wearable_connect"
  | "community_map_view"
  | "strava_connect";

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
      identify: (id: string, props?: Record<string, unknown>) => void;
    };
  }
}

let initialized = false;

export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === "undefined" || initialized) return;

  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      capture_pageview: false,
      persistence: "localStorage"
    });
    window.posthog = posthog;
    initialized = true;
  });
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

export function identifyUser(id: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.identify(id, properties);
  }
}
