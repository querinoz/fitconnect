/**
 * Web has no WidgetKit / Live Activity. Classify workloads so the PWA
 * never pretends the tab can stay alive 24/7.
 */
export type BackgroundClass =
  | "CONTINUOUS_SESSION"
  | "EVENT_DRIVEN"
  | "PERIODIC_SYNC"
  | "PUSH_DRIVEN"
  | "USER_INITIATED"
  | "NOT_NEEDED";

export const KEEP_ENTIRE_APP_ALIVE = false;

export const BACKGROUND_CATALOG = [
  {
    feature: "TRAIN / Fight Mode",
    classification: "CONTINUOUS_SESSION" as BackgroundClass,
    mechanism: "Foreground tab + Page Visibility. No service worker keep-alive.",
  },
  {
    feature: "Provider sync",
    classification: "PUSH_DRIVEN" as BackgroundClass,
    mechanism: "Server webhook → store → optional Web Push.",
  },
  {
    feature: "Feed / Zenith / MCP",
    classification: "NOT_NEEDED" as BackgroundClass,
    mechanism: "none",
  },
] as const;

export function webCanRunInBackground(feature: string): boolean {
  const row = BACKGROUND_CATALOG.find((item) => item.feature === feature);
  return row?.classification === "CONTINUOUS_SESSION" || row?.classification === "PUSH_DRIVEN";
}
