import { trackEvent } from "@/lib/observability/posthog";

export type IosInstallAnalyticsEvent =
  | "ios_page_view"
  | "ios_install_click"
  | "ios_qr_view"
  | "ios_copy_link"
  | "ios_testflight_click";

export function trackIosInstallEvent(
  name: IosInstallAnalyticsEvent,
  props?: Record<string, unknown>
) {
  trackEvent(name, { path: "/ios", ...props });
  if (typeof window === "undefined") return;
  void fetch("/api/v1/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, path: "/ios", props })
  }).catch(() => undefined);
}
