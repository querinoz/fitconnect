import {
  MOTION_STORAGE_KEY,
  parseStoredMotion,
  resolveEffectiveReduced
} from "@fitconnect/design-tokens/src/motion-policy";

/** True when effective motion preference disables animations. */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const override = parseStoredMotion(localStorage.getItem(MOTION_STORAGE_KEY));
  return resolveEffectiveReduced(osReduced, override);
}

export function getEffectiveMotionDataset(): "reduced" | "full" {
  return shouldReduceMotion() ? "reduced" : "full";
}
