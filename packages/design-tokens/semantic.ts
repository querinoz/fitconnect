/**
 * Semantic + chart colour roles — references COLOR_TOKENS keys (not new hues).
 * Kotlin generator resolves these to the same ARGB as the referenced colour.
 */
export const SEMANTIC_TOKENS = {
  success: "performance",
  warning: "recovery",
  danger: "alert",
  info: "telemetry",
  focus: "iris",
  cta: "voltline",
  trust: "connect",
} as const;

export const CHART_TOKENS = {
  hrv: "connect",
  heartRate: "alert",
  readiness: "voltline",
  sleep: "iris",
  recovery: "recovery",
  performance: "performance",
  trainingLoad: "telemetry",
  weight: "onSurfaceMuted",
  hydration: "cyan",
} as const;

export const GRADIENT_TOKENS = {
  floorFade: ["floor", "surface"],
  voltGlow: ["voltlineDim", "floor"],
  glass: ["surfaceContainer", "elevated"],
} as const;
