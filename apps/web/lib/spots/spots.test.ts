import { describe, expect, it } from "vitest";
import {
  assertValidLatLng,
  parseCertification,
  parseSkillLevel,
  parseSpotKind,
  toPublicSummary,
} from "@/lib/spots/types";
import { spotIntelligenceUnavailable } from "@/lib/spots/repository";

describe("Sports Intelligence Spot domain", () => {
  it("validates latitude/longitude ranges", () => {
    expect(assertValidLatLng(38.7, -9.1)).toBe(true);
    expect(assertValidLatLng(90, 180)).toBe(true);
    expect(assertValidLatLng(-91, 0)).toBe(false);
    expect(assertValidLatLng(0, 181)).toBe(false);
    expect(assertValidLatLng(Number.NaN, 0)).toBe(false);
  });

  it("parses filters and rejects junk", () => {
    expect(parseSpotKind("master")).toBe("MASTER");
    expect(parseSpotKind("ALL")).toBe("ALL");
    expect(parseSpotKind("nope")).toBeNull();
    expect(parseSkillLevel("professional")).toBe("PROFESSIONAL");
    expect(parseCertification("community")).toBe("COMMUNITY");
  });

  it("public summary never carries exact coordinates", () => {
    const summary = toPublicSummary({
      id: "1",
      name: "Foz",
      slug: "foz",
      sport_key: "SURF",
      spot_kind: "MASTER",
      certification_status: "MASTER",
      skill_level: "PROFESSIONAL",
      difficulty: "EXPERT",
      approx_lat: 41.1,
      approx_lng: -8.6,
      region: "Porto",
      country: "PT",
      rating_avg: null,
      review_count: 0,
    });
    expect(summary.exactLat).toBeNull();
    expect(summary.exactLng).toBeNull();
    expect(summary.ratingAvg).toBeNull();
    expect(summary.spotKind).toBe("MASTER");
  });

  it("intelligence stub never invents recommendations", () => {
    const out = spotIntelligenceUnavailable("missing readiness");
    expect(out.status).toBe("NOT_AVAILABLE");
    expect(out.recommendations).toEqual([]);
  });
});

describe("Geo providers config", () => {
  it("returns null providers without GEOAPIFY_API_KEY", async () => {
    const prev = process.env.GEOAPIFY_API_KEY;
    delete process.env.GEOAPIFY_API_KEY;
    const { createGeoProvider, createRoutingProvider } = await import("@/lib/geo/providers");
    expect(createGeoProvider()).toBeNull();
    expect(createRoutingProvider()).toBeNull();
    if (prev !== undefined) process.env.GEOAPIFY_API_KEY = prev;
  });
});
