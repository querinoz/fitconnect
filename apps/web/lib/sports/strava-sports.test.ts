import { describe, expect, it } from "vitest";
import {
  demoSportVolume,
  formatStravaSportLabel,
  sportSysCode
} from "./strava-sports";

describe("Strava sport labels", () => {
  it("shortens the names that overflow tiles", () => {
    expect(formatStravaSportLabel("MountainBikeRide")).toBe("MTB");
    expect(formatStravaSportLabel("EMountainBikeRide")).toBe("E-MTB");
    expect(formatStravaSportLabel("EBikeRide")).toBe("E-Bike");
    expect(formatStravaSportLabel("HighIntensityIntervalTraining")).toBe("HIIT");
  });

  it("splits remaining camelCase ids", () => {
    expect(formatStravaSportLabel("TrailRun")).toBe("Trail Run");
    expect(formatStravaSportLabel("Yoga")).toBe("Yoga");
  });

  it("keeps demo volume stable across server and client", () => {
    expect(demoSportVolume("Ride")).toBe(demoSportVolume("Ride"));
    expect(demoSportVolume("Ride")).not.toBe(demoSportVolume("Run"));
  });

  it("compresses SYS codes so telemetry labels stay short", () => {
    expect(sportSysCode("MountainBikeRide")).toBe("MTB");
    expect(sportSysCode("EMountainBikeRide")).toBe("EMTB");
    expect(sportSysCode("Ride")).toBe("RIDE");
    expect(sportSysCode("HighIntensityIntervalTraining")).toBe("HIIT");
  });
});
