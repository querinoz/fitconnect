import { describe, expect, it } from "vitest";
import { DEFAULT_MAP_STYLE, getMapStyleUrl, isMapConfigured } from "@fitconnect/maps";

describe("OpenFreeMap config", () => {
  it("uses OpenFreeMap by default without API keys", () => {
    expect(isMapConfigured()).toBe(true);
    expect(getMapStyleUrl()).toBe(DEFAULT_MAP_STYLE);
    expect(getMapStyleUrl()).toContain("openfreemap.org");
  });
});
