import { describe, expect, it, vi } from "vitest";
import { athleteAppEntryHref, coachAppEntryHref } from "./app-entry-href";

describe("app entry hrefs", () => {
  it("uses ONE LOGIN destinations when demo is off", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    expect(athleteAppEntryHref()).toBe("/signin?next=/dashboard");
    expect(coachAppEntryHref()).toBe("/signin?next=/coach/dashboard");
    vi.unstubAllEnvs();
  });

  it("keeps LOCAL_DEMO query shortcuts only when demo is on", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(athleteAppEntryHref()).toBe("/dashboard?demo=athlete");
    expect(coachAppEntryHref()).toBe("/coach/dashboard?demo=coach");
    vi.unstubAllEnvs();
  });
});
