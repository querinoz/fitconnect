import { describe, it, expect } from "vitest";
import { evaluateRoster, type AthleteSnapshot } from "./rules";

const baseAthlete = (over: Partial<AthleteSnapshot> = {}): AthleteSnapshot => ({
  id: "a-iris",
  name: "Iris",
  hrvSeries: [70, 70, 70, 70, 70, 70, 70],
  sleepSeries: [7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5],
  missedSessions: 0,
  ...over
});

describe("evaluateRoster", () => {
  it("flags HRV-down when 3-day avg drops 15% vs 7-day", () => {
    const a = baseAthlete({
      hrvSeries: [70, 72, 68, 40, 38, 36, 35]
    });
    const alerts = evaluateRoster([a], "c-marina");
    expect(alerts.find((al) => al.rule === "hrv-down")?.athleteId).toBe("a-iris");
  });

  it("flags sleep-low when 3-day avg < 6", () => {
    const a = baseAthlete({
      sleepSeries: [7, 7, 7, 7, 5.5, 5.6, 5.4]
    });
    const alerts = evaluateRoster([a], "c-marina");
    expect(alerts.find((al) => al.rule === "sleep-low")).toBeTruthy();
  });

  it("flags missed-sessions when ≥3 missed in 14 days", () => {
    const a = baseAthlete({ missedSessions: 3 });
    const alerts = evaluateRoster([a], "c-marina");
    expect(alerts.find((al) => al.rule === "missed-sessions")).toBeTruthy();
  });

  it("returns empty when nothing fires", () => {
    expect(evaluateRoster([baseAthlete()], "c-marina")).toEqual([]);
  });

  it("alert id is stable per (athleteId, rule, day)", () => {
    const a = baseAthlete({ missedSessions: 3 });
    const today = "2026-05-17";
    const alerts1 = evaluateRoster([a], "c-marina", today);
    const alerts2 = evaluateRoster([a], "c-marina", today);
    expect(alerts1[0]?.id).toBe(alerts2[0]?.id);
  });
});
