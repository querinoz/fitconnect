import { describe, expect, it, beforeEach } from "vitest";
import {
  normalizeMetric,
  resolveMetricConflict,
  listDeviceRegistry,
  __resetDeviceRegistry,
  computeFreshness
} from "./platform";

describe("V10.1 device platform", () => {
  beforeEach(() => {
    __resetDeviceRegistry();
  });

  it("lists devices as NOT_CONNECTED by default", () => {
    const list = listDeviceRegistry();
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((d) => d.status === "NOT_CONNECTED" || d.status === "UNSUPPORTED")).toBe(
      true
    );
  });

  it("computes freshness bands", () => {
    expect(computeFreshness(new Date().toISOString())).toBe("LIVE");
    expect(computeFreshness(new Date(Date.now() - 60_000).toISOString())).toBe("RECENT");
    expect(computeFreshness(new Date(Date.now() - 60 * 60_000).toISOString())).toBe("STALE");
    expect(computeFreshness(null)).toBe("UNKNOWN");
  });

  it("resolves conflicts without silent overwrite — records reason", () => {
    const a = normalizeMetric({
      metric: "heart_rate",
      value: 140,
      unit: "bpm",
      source: "STRAVA",
      timestamp: "2026-09-18T10:00:00.000Z"
    });
    const b = normalizeMetric({
      metric: "heart_rate",
      value: 145,
      unit: "bpm",
      source: "HEALTH_CONNECT",
      timestamp: "2026-09-18T10:00:01.000Z"
    });
    const { winner, conflict } = resolveMetricConflict(a, b);
    expect(winner.source).toBe("HEALTH_CONNECT");
    expect(conflict).not.toBeNull();
    expect(conflict!.reason).toContain("source_priority");
  });
});
