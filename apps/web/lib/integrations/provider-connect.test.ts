import { describe, expect, it } from "vitest";
import {
  providerConfiguredFromEnv,
  resolveProviderConnectAction
} from "./provider-connect";

describe("resolveProviderConnectAction", () => {
  it("never marks WHOOP as locally connectable", () => {
    expect(
      resolveProviderConnectAction({
        id: "whoop",
        status: "disconnected",
        oauth: true,
        configured: false
      })
    ).toEqual({ kind: "oauth_not_configured", provider: "whoop" });
    expect(
      resolveProviderConnectAction({
        id: "whoop",
        status: "disconnected",
        oauth: true,
        configured: true
      })
    ).toEqual({ kind: "oauth_not_live", provider: "whoop" });
  });

  it("sends Strava to OAuth only when configured", () => {
    expect(
      resolveProviderConnectAction({
        id: "strava",
        status: "disconnected",
        oauth: true,
        configured: true
      })
    ).toEqual({ kind: "strava_oauth" });
    expect(
      resolveProviderConnectAction({
        id: "strava",
        status: "disconnected",
        oauth: true,
        configured: false
      })
    ).toEqual({ kind: "oauth_not_configured", provider: "strava" });
  });

  it("points Health Connect and Apple Health at native apps", () => {
    expect(
      resolveProviderConnectAction({
        id: "health_connect",
        status: "disconnected",
        oauth: false,
        configured: false
      })
    ).toEqual({ kind: "health_connect" });
    expect(
      resolveProviderConnectAction({
        id: "apple_health",
        status: "disconnected",
        oauth: false,
        configured: false
      })
    ).toEqual({ kind: "apple_health" });
  });
});

describe("providerConfiguredFromEnv", () => {
  it("reads only the matching credential", () => {
    expect(providerConfiguredFromEnv("strava", { STRAVA_CLIENT_ID: "x" })).toBe(true);
    expect(providerConfiguredFromEnv("whoop", { STRAVA_CLIENT_ID: "x" })).toBe(false);
    expect(providerConfiguredFromEnv("health_connect", { STRAVA_CLIENT_ID: "x" })).toBe(
      false
    );
  });
});
