import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "@/lib/dashboard-store";

describe("dashboard store · realtime slices", () => {
  beforeEach(() => {
    useDashboardStore.getState().resetDemo();
  });

  it("startsLiveSession adds a session keyed by athleteId", () => {
    useDashboardStore.getState().startLiveSession("a-iris", "intervals");
    const s = useDashboardStore.getState().liveSessions["a-iris"];
    expect(s.intent).toBe("intervals");
    expect(s.startedAt).toBeTruthy();
  });

  it("appendLiveTick appends data points", () => {
    useDashboardStore.getState().startLiveSession("a-iris", "z2");
    useDashboardStore.getState().appendLiveTick("a-iris", {
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

  it("addReaction stores reactions per achievementId", () => {
    useDashboardStore.getState().addReaction("ach-1", {
      kind: "reaction",
      achievementId: "ach-1",
      athleteId: "a-iris",
      emoji: "🔥",
      fromName: "Marina",
      at: new Date().toISOString()
    });
    expect(useDashboardStore.getState().reactions["ach-1"].length).toBe(1);
  });

  it("pushAIAlert dedupes by id", () => {
    const base = {
      kind: "ai-alert" as const,
      id: "x",
      coachId: "c-marina",
      athleteId: "a-iris",
      rule: "hrv-down" as const,
      recommendation: "lighter-day" as const,
      body: "x",
      at: new Date().toISOString()
    };
    useDashboardStore.getState().pushAIAlert(base);
    useDashboardStore.getState().pushAIAlert(base);
    expect(useDashboardStore.getState().aiAlerts.length).toBe(1);
  });
});
