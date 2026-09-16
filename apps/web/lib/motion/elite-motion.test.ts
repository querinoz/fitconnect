import { describe, expect, it } from "vitest";
import { MOTION_TOKENS } from "@fitconnect/design-tokens";
import {
  eliteMetricLand,
  eliteRoutePanel,
  eliteSheet,
  eliteStagger,
  muteEliteMotion,
  zenithMotion,
  zenithSpring
} from "./elite-motion";

describe("elite-motion / zenith ladder", () => {
  it("exposes zenith duration ladder", () => {
    expect(zenithMotion.instant).toBe(MOTION_TOKENS.zenith.instant);
    expect(zenithMotion.fast).toBe(MOTION_TOKENS.micro);
    expect(zenithMotion.normal).toBe(MOTION_TOKENS.ui);
    expect(zenithMotion.slow).toBeLessThanOrEqual(MOTION_TOKENS.screen);
    expect(zenithMotion.cinematic).toBeGreaterThan(zenithMotion.slow);
  });

  it("exposes named springs without relying on snap overshoot for telemetry", () => {
    expect(zenithSpring.navigation.stiffness).toBeGreaterThan(0);
    expect(zenithSpring.telemetry.damping).toBeGreaterThanOrEqual(
      zenithSpring.soft.damping
    );
  });

  it("uses 28ms stagger", () => {
    expect(
      (eliteStagger.animate.transition as { staggerChildren: number }).staggerChildren
    ).toBe(MOTION_TOKENS.stagger);
  });

  it("metric land uses settle ease not snap overshoot", () => {
    expect(eliteMetricLand.transition).toMatchObject({
      ease: MOTION_TOKENS.ease.kinetic
    });
  });

  it("returns sheet preset for sheet modals", () => {
    expect(eliteRoutePanel("sheet")).toEqual(eliteSheet);
  });

  it("mutes transforms when reduced motion is preferred", () => {
    const muted = muteEliteMotion(eliteMetricLand, true);
    expect(muted.transition).toEqual({ duration: 0 });
    expect(muted.initial).toMatchObject({ opacity: 1, y: 0 });
  });
});
