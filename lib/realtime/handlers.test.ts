import { describe, it, expect, beforeEach } from "vitest";
import { applyMessage } from "./handlers";
import type { SessionStart } from "./types";
import { useDashboardStore } from "@/lib/dashboard-store";

describe("applyMessage", () => {
  beforeEach(() => {
    useDashboardStore.getState().resetDemo();
  });

  it("session-start opens a live session", () => {
    applyMessage({
      kind: "session-start",
      athleteId: "a-iris",
      sessionId: "s-1",
      at: new Date().toISOString()
    } satisfies SessionStart);
    expect(useDashboardStore.getState().liveSessions["a-iris"]).toBeTruthy();
  });

  it("live-tick appends ticks", () => {
    useDashboardStore.getState().startLiveSession("a-iris", "z2");
    applyMessage({
      kind: "live-tick",
      athleteId: "a-iris",
      hr: 145,
      pace: 4.2,
      cadence: 170,
      elapsedSec: 1,
      at: new Date().toISOString()
    });
    expect(useDashboardStore.getState().liveSessions["a-iris"].ticks.length).toBe(
      1
    );
  });

  it("ai-alert pushes once", () => {
    const a = {
      kind: "ai-alert" as const,
      id: "z",
      coachId: "c-marina",
      athleteId: "a-iris",
      rule: "hrv-down" as const,
      recommendation: "lighter-day" as const,
      body: "x",
      at: new Date().toISOString()
    };
    applyMessage(a);
    applyMessage(a);
    expect(useDashboardStore.getState().aiAlerts.length).toBe(1);
  });
});
