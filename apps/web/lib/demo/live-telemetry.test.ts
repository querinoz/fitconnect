import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  LIVE_TELEMETRY_SSR_SEED,
  hotspotMatchesFilter,
  liveAthletePosition,
  liveDemoMetrics,
  useLiveDemoTelemetry
} from "./live-telemetry";

function ReadinessProbe() {
  const live = useLiveDemoTelemetry();
  return createElement("span", null, live.readiness);
}

describe("live LOCAL_DEMO telemetry", () => {
  it("maps landing filters onto hotspot sports", () => {
    expect(hotspotMatchesFilter("Running", "Run")).toBe(true);
    expect(hotspotMatchesFilter("Cycling", "Ride")).toBe(true);
    expect(hotspotMatchesFilter("Swim", "Swim")).toBe(true);
    expect(hotspotMatchesFilter("Yoga", "Yoga")).toBe(true);
    expect(hotspotMatchesFilter("Climbing", "Run")).toBe(false);
    expect(hotspotMatchesFilter("Running", null)).toBe(true);
  });

  it("keeps the demo athlete near Lisbon", () => {
    const pos = liveAthletePosition(0);
    expect(pos.lat).toBeGreaterThan(38.7);
    expect(pos.lat).toBeLessThan(38.75);
    expect(pos.lng).toBeGreaterThan(-9.17);
    expect(pos.lng).toBeLessThan(-9.11);
  });

  it("emits bounded heart-rate and readiness", () => {
    const a = liveDemoMetrics(0);
    const b = liveDemoMetrics(1800);
    expect(a.hrBpm).toBeGreaterThanOrEqual(120);
    expect(a.hrBpm).toBeLessThanOrEqual(160);
    expect(a.readiness).toBeGreaterThanOrEqual(80);
    expect(a.readiness).toBeLessThanOrEqual(90);
    expect(a.hrBpm).not.toBe(b.hrBpm);
  });

  it("SSR HTML matches the first client paint for readiness", () => {
    const expected = String(liveDemoMetrics(LIVE_TELEMETRY_SSR_SEED).readiness);
    const html = renderToString(createElement(ReadinessProbe));
    expect(html).toBe(`<span>${expected}</span>`);
  });
});
