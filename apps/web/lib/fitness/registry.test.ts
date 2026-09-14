import { describe, expect, it } from "vitest";
import {
  constraintsFor,
  missingMetric,
  reconcileSamples,
  type NormalizedSample
} from "@fitconnect/types";

describe("fitness provider registry", () => {
  it("makes Health Connect core and Strava never social", () => {
    expect(constraintsFor("HEALTH_CONNECT").tier).toBe("core");
    expect(constraintsFor("STRAVA").shareable).toBe(false);
    expect(constraintsFor("STRAVA").mayTrainMl).toBe(false);
  });

  it("disables Terra/Spike/ROOK aggregators", () => {
    expect(constraintsFor("TERRA").enabled).toBe(false);
    expect(constraintsFor("SPIKE").enabled).toBe(false);
    expect(constraintsFor("ROOK").enabled).toBe(false);
  });

  it("reconciling prefers higher confidence and drops disabled aggregators", () => {
    const samples: NormalizedSample[] = [
      {
        athleteId: "a",
        metric: "hrv",
        value: 40,
        unit: "ms",
        capturedAt: "2026-09-14T08:00:00Z",
        providerId: "TERRA",
        externalId: "t1",
        provenance: "REAL",
        confidence: 0.99
      },
      {
        athleteId: "a",
        metric: "hrv",
        value: 62,
        unit: "ms",
        capturedAt: "2026-09-14T08:00:00Z",
        providerId: "HEALTH_CONNECT",
        externalId: "hc1",
        provenance: "REAL",
        confidence: 0.8
      }
    ];
    const out = reconcileSamples(samples);
    expect(out).toHaveLength(1);
    expect(out[0]?.providerId).toBe("HEALTH_CONNECT");
    expect(out[0]?.value).toBe(62);
  });

  it("missingMetric is explicit, not a fabricated number", () => {
    const m = missingMetric<number>();
    expect(m.value).toBeNull();
    expect(m.provenance).toBe("MISSING");
  });
});
