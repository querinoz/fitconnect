import { describe, expect, it } from "vitest";
import { listActivitiesForCoach } from "./service";

describe("listActivitiesForCoach", () => {
  it("hard-fails instead of returning roster Strava rows", async () => {
    await expect(listActivitiesForCoach("coach-a", 20)).rejects.toThrow("strava_not_shareable");
  });
});
