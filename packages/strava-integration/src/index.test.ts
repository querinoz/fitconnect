import { describe, expect, it } from "vitest";
import {
  decodePolyline,
  encodePolyline,
  parseWebhookEvent,
  verifyWebhookChallenge,
  normalizeSummaryActivity,
  estimateTrainingLoad
} from "../src/index";

describe("decodePolyline", () => {
  it("round-trips coordinates", () => {
    const coords: [number, number][] = [
      [38.5, -122.5],
      [38.51, -122.49],
      [38.52, -122.48]
    ];
    const encoded = encodePolyline(coords);
    const decoded = decodePolyline(encoded);
    expect(decoded.length).toBe(3);
    expect(decoded[0]![0]).toBeCloseTo(38.5, 2);
  });
});

describe("parseWebhookEvent", () => {
  it("parses activity create events", () => {
    const event = parseWebhookEvent({
      aspect_type: "create",
      event_time: 123,
      object_id: 456,
      object_type: "activity",
      owner_id: 789,
      subscription_id: 1
    });
    expect(event?.aspect_type).toBe("create");
    expect(event?.object_id).toBe(456);
  });

  it("detects athlete.update authorized=false as revocation", async () => {
    const { isStravaAthleteRevocation, parseWebhookEvent } = await import("./client");
    const event = parseWebhookEvent({
      aspect_type: "update",
      event_time: 1,
      object_id: 9,
      object_type: "athlete",
      owner_id: 9,
      subscription_id: 1,
      updates: { authorized: "false" }
    });
    expect(event).not.toBeNull();
    expect(isStravaAthleteRevocation(event!)).toBe(true);
  });
});

describe("verifyWebhookChallenge", () => {
  it("accepts valid subscription challenge", () => {
    const result = verifyWebhookChallenge({
      mode: "subscribe",
      token: "secret",
      challenge: "abc123",
      verifyToken: "secret"
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.challenge).toBe("abc123");
  });
});

describe("normalizeSummaryActivity", () => {
  it("prefers sport_type over legacy type", () => {
    const n = normalizeSummaryActivity({
      id: 1,
      name: "Morning Run",
      sport_type: "TrailRun",
      type: "Run",
      distance: 5000,
      moving_time: 1800,
      elapsed_time: 1900,
      start_date: "2026-05-18T08:00:00Z",
      start_date_local: "2026-05-18T09:00:00Z"
    });
    expect(n.sportType).toBe("TrailRun");
    expect(n.legacyType).toBe("Run");
  });
});

describe("estimateTrainingLoad", () => {
  it("scales with duration and HR", () => {
    expect(estimateTrainingLoad(3600, 150)).toBeGreaterThan(estimateTrainingLoad(1800, 120));
  });
});

describe("matchStravaEndpoint", () => {
  it("allows athlete activities GET", async () => {
    const { matchStravaEndpoint } = await import("./endpoints");
    expect(matchStravaEndpoint("/athlete/activities", "GET")).not.toBeNull();
  });

  it("rejects unknown paths", async () => {
    const { matchStravaEndpoint } = await import("./endpoints");
    expect(matchStravaEndpoint("/admin/users", "GET")).toBeNull();
  });

  it("bans segment explore, club social lists, kudos and comments", async () => {
    const { matchStravaEndpoint, isBannedStravaPath } = await import("./endpoints");
    expect(isBannedStravaPath("/segments/explore")).toBe(true);
    expect(matchStravaEndpoint("/segments/explore", "GET")).toBeNull();
    expect(matchStravaEndpoint("/clubs/1/activities", "GET")).toBeNull();
    expect(matchStravaEndpoint("/clubs/1/admins", "GET")).toBeNull();
    expect(matchStravaEndpoint("/clubs/1/members", "GET")).toBeNull();
    expect(matchStravaEndpoint("/activities/9/kudos", "GET")).toBeNull();
    expect(matchStravaEndpoint("/activities/9/comments", "GET")).toBeNull();
  });
});
