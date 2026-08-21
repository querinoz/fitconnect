import { describe, expect, it } from "vitest";
import { demoRoleForPath, isAthleteAppPath } from "./demo-path";

describe("demo path role", () => {
  it("keeps coach on coach routes even with demo=1", () => {
    expect(demoRoleForPath("/coach/dashboard", "1")).toBe("coach");
    expect(demoRoleForPath("/coach/roster", "coach")).toBe("coach");
  });

  it("switches sticky coach session to athlete on /profile?demo=1", () => {
    expect(isAthleteAppPath("/profile")).toBe(true);
    expect(demoRoleForPath("/profile", "1")).toBe("athlete");
    expect(demoRoleForPath("/profile", "athlete")).toBe("athlete");
  });

  it("treats insights and map as athlete app surfaces", () => {
    expect(demoRoleForPath("/insights", null)).toBe("athlete");
    expect(demoRoleForPath("/map", "1")).toBe("athlete");
  });

  it("lets explicit demo=athlete win on a coach URL", () => {
    expect(demoRoleForPath("/coach/dashboard", "athlete")).toBe("athlete");
  });
});
