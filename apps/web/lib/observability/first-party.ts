import { pgQuery } from "@/lib/db/pg-pool";
import { isDatabaseConfigured } from "@/lib/db/client";

const ALLOWED_EVENTS = new Set([
  "landing_view",
  "discover_view",
  "coach_profile",
  "book_intro",
  "signup",
  "email_capture",
  "session_start",
  "readiness_view",
  "wearable_connect",
  "community_map_view",
  "strava_connect",
  "onboarding_complete",
  "paid_session",
  "ios_page_view",
  "ios_install_click",
  "ios_qr_view",
  "ios_copy_link",
  "ios_testflight_click"
]);

export function isAllowedAnalyticsEvent(name: string): boolean {
  return ALLOWED_EVENTS.has(name);
}

export async function recordAnalyticsEvent(input: {
  name: string;
  path?: string;
  uid?: string | null;
  props?: Record<string, unknown>;
}): Promise<boolean> {
  if (!isAllowedAnalyticsEvent(input.name) || !isDatabaseConfigured()) return false;
  await pgQuery(
    `insert into public.analytics_events (name, path, uid, props) values ($1, $2, $3, $4::jsonb)`,
    [input.name, input.path ?? null, input.uid ?? null, JSON.stringify(input.props ?? {})]
  );
  return true;
}
