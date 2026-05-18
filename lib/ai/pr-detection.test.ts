import { describe, it, expect } from "vitest";
import { detectPRs, type SessionRecord } from "./pr-detection";

const history: SessionRecord[] = [
  {
    athleteId: "a",
    at: "2026-05-10",
    distanceKm: 8.0,
    durationSec: 2400,
    avgHr: 140,
    maxHr: 162
  },
  {
    athleteId: "a",
    at: "2026-05-12",
    distanceKm: 9.0,
    durationSec: 2700,
    avgHr: 142,
    maxHr: 165
  }
];

describe("detectPRs", () => {
  it("flags a longest-distance PR", () => {
    const prs = detectPRs(
      {
        athleteId: "a",
        at: "2026-05-15",
        distanceKm: 12.0,
        durationSec: 3600,
        avgHr: 145,
        maxHr: 168
      },
      history
    );
    expect(prs.some((p) => p.metric === "distanceKm")).toBe(true);
    expect(prs.find((p) => p.metric === "distanceKm")?.value).toBe(12);
  });

  it("returns empty when nothing is best", () => {
    const prs = detectPRs(
      {
        athleteId: "a",
        at: "2026-05-15",
        distanceKm: 5.0,
        durationSec: 1800,
        avgHr: 138,
        maxHr: 160
      },
      history
    );
    expect(prs).toEqual([]);
  });

  it("flags maxHr PR", () => {
    const prs = detectPRs(
      {
        athleteId: "a",
        at: "2026-05-15",
        distanceKm: 5.0,
        durationSec: 1800,
        avgHr: 138,
        maxHr: 175
      },
      history
    );
    expect(prs.some((p) => p.metric === "maxHr")).toBe(true);
  });
});
