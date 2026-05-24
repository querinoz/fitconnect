export type MotionPreference = "reduced" | "full" | null;

/** userOverride null = follow OS preference. Explicit override wins. */
export function resolveEffectiveReduced(
  osReduced: boolean,
  userOverride: MotionPreference
): boolean {
  if (userOverride === "reduced") return true;
  if (userOverride === "full") return false;
  return osReduced;
}

export const MOTION_STORAGE_KEY = "fitconnect:motion";

export function parseStoredMotion(value: string | null): MotionPreference {
  if (value === "reduced" || value === "full") return value;
  return null;
}
