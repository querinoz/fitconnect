/** Shared motion tokens — web + mobile. */
export const MOTION_TOKENS = {
  micro: 0.18,
  screen: 0.28,
  entrance: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
  gsapZones: ["hero-immersive", "marketing-demos", "device-showcase"] as const
} as const;
