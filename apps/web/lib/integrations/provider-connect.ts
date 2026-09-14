import type { WearableProvider } from "@fitconnect/types";

export type ProviderConnectState = {
  id: WearableProvider;
  status: string;
  oauth: boolean;
  configured: boolean;
};

export type ProviderConnectAction =
  | { kind: "strava_oauth" }
  | { kind: "strava_disconnect" }
  | { kind: "health_connect" }
  | { kind: "apple_health" }
  | { kind: "oauth_not_configured"; provider: WearableProvider }
  | { kind: "oauth_not_live"; provider: WearableProvider };

export function providerConfiguredFromEnv(
  id: WearableProvider,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  switch (id) {
    case "strava":
      return Boolean(env.STRAVA_CLIENT_ID);
    case "whoop":
      return Boolean(env.WHOOP_CLIENT_ID);
    case "oura":
      return Boolean(env.OURA_CLIENT_ID);
    case "garmin":
      return Boolean(env.GARMIN_CONSUMER_KEY);
    case "apple_health":
    case "health_connect":
      return false;
    default:
      return false;
  }
}

/**
 * Web cannot complete Health Connect / HealthKit / WHOOP / Oura / Garmin OAuth.
 * Never return a "connected" shortcut — callers must not fake success.
 */
export function resolveProviderConnectAction(
  p: ProviderConnectState
): ProviderConnectAction {
  if (p.id === "strava") {
    if (p.status === "connected") return { kind: "strava_disconnect" };
    if (p.configured) return { kind: "strava_oauth" };
    return { kind: "oauth_not_configured", provider: "strava" };
  }
  if (p.id === "health_connect") return { kind: "health_connect" };
  if (p.id === "apple_health") return { kind: "apple_health" };
  if (!p.configured) return { kind: "oauth_not_configured", provider: p.id };
  return { kind: "oauth_not_live", provider: p.id };
}
