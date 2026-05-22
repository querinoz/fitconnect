import { describe, expect, it } from "vitest";
import {
  eliteModal,
  eliteRoutePanel,
  eliteSheet,
  muteEliteMotion
} from "./elite-motion";

describe("elite-motion", () => {
  it("returns sheet preset for sheet modals", () => {
    expect(eliteRoutePanel("sheet")).toEqual(eliteSheet);
  });

  it("returns modal preset for center modals", () => {
    expect(eliteRoutePanel("center")).toEqual(eliteModal);
  });

  it("mutes transforms when reduced motion is preferred", () => {
    const muted = muteEliteMotion(eliteModal, true);
    expect(muted.transition).toEqual({ duration: 0 });
    expect(muted.initial).toMatchObject({ opacity: 1, y: 0, scale: 1 });
    expect(muted.exit).toMatchObject({ opacity: 1, y: 0, scale: 1 });
  });

  it("preserves preset when motion is enabled", () => {
    expect(muteEliteMotion(eliteModal, false)).toEqual(eliteModal);
  });
});
