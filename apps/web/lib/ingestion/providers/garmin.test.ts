import { describe, expect, it } from "vitest";
import { ingestGarminHealthPayload } from "./garmin";

describe("Garmin Health mapper", () => {
  it("does not invent Body Battery without partner approval", () => {
    const result = ingestGarminHealthPayload({
      bodyBatteryChargedValue: 88,
      restingHeartRateInBeatsPerMinute: 52
    });
    expect(result.blocked).toBe(true);
    expect(result.events).toEqual([]);
  });

  it("maps numeric fields only when partnerApproved is true", () => {
    const result = ingestGarminHealthPayload({
      partnerApproved: true,
      userId: "athlete-1",
      restingHeartRateInBeatsPerMinute: 52,
      bodyBatteryChargedValue: 71
    });
    expect(result.blocked).toBe(false);
    expect(result.events.map((e) => e.metric).sort()).toEqual(["body_battery", "resting_hr"]);
  });
});
