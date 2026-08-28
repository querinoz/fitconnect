import { describe, expect, it } from "vitest";
import {
  FITCONNECT_CONTACT_EMAIL,
  FITCONNECT_INSTAGRAM_HANDLE,
  FITCONNECT_INSTAGRAM_URL,
  mailto
} from "./contact";

describe("site contact", () => {
  it("uses canonical FitConnect email", () => {
    expect(FITCONNECT_CONTACT_EMAIL).toBe("fitconnectsports@gmail.com");
  });

  it("builds mailto links", () => {
    expect(mailto()).toBe("mailto:fitconnectsports@gmail.com");
  });

  it("points Instagram to @fitconnectsports", () => {
    expect(FITCONNECT_INSTAGRAM_HANDLE).toBe("fitconnectsports");
    expect(FITCONNECT_INSTAGRAM_URL).toContain("fitconnectsports");
  });
});
