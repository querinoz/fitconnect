import { describe, expect, it } from "vitest";
import { canPublishRealtime, isPublicRealtimeChannel, realtimeEventKey } from "./channel-policy";

describe("realtime channel policy", () => {
  it("treats community/presence/chat as public", () => {
    expect(isPublicRealtimeChannel("community:feed")).toBe(true);
    expect(isPublicRealtimeChannel("presence:lobby")).toBe(true);
    expect(isPublicRealtimeChannel("session:abc")).toBe(false);
  });

  it("blocks biometric kinds on public channels", () => {
    expect(
      canPublishRealtime("community:feed", {
        kind: "vitals",
        athleteId: "a1",
        hrvMs: 62,
        at: "2026-09-14T09:00:00.000Z"
      })
    ).toBe(false);
    expect(
      canPublishRealtime("session:s1", {
        kind: "live-tick",
        athleteId: "a1",
        hr: 140,
        pace: 5,
        cadence: 170,
        elapsedSec: 12,
        at: "2026-09-14T09:00:00.000Z"
      })
    ).toBe(true);
  });

  it("keys events for duplicate suppression", () => {
    const a = {
      kind: "nudge" as const,
      athleteId: "a1",
      coachId: "c1",
      variant: "push" as const,
      at: "2026-09-14T09:00:00.000Z"
    };
    expect(realtimeEventKey(a)).toBe(realtimeEventKey({ ...a }));
  });
});
