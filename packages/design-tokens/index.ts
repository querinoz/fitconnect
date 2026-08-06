export { MOTION_TOKENS } from "./motion";
export {
  resolveEffectiveReduced,
  parseStoredMotion,
  MOTION_STORAGE_KEY,
  type MotionPreference
} from "./src/motion-policy";

/**
 * COLOR_TOKENS — cross-platform single source of truth for FitConnect colours.
 *
 * These values mirror the CSS variables in elite-os.css :root {}.
 * Web uses CSS vars directly; mobile (React Native) imports this object.
 * Any colour change must be reflected in BOTH this object AND elite-os.css.
 */
export const COLOR_TOKENS = {
  // ── Floor & Surface ──────────────────────────────────────────────────────
  floor: "#070b14",
  carbon: "#111827",
  elevated: "#151b2d",
  surface: "#13121b",
  surfaceContainer: "#1f1f28",
  surfaceContainerHigh: "#2a2933",
  surfaceContainerHighest: "#35343e",

  // ── Brand: Volt (primary CTA / athlete identity) ──────────────────────────
  voltline: "#c8ff00",
  voltlineDim: "rgba(200, 255, 0, 0.12)",
  voltlineGlow: "rgba(200, 255, 0, 0.4)",
  volt300: "#d4ff4d",
  volt400: "#d0ff33",
  volt600: "#a8d700",

  // ── Secondary: Iris (focus / interactive) ────────────────────────────────
  iris: "#6c63ff",
  irisSoft: "#c4c0ff",
  irisGlow: "rgba(108, 99, 255, 0.35)",

  // ── Telemetry & Data (coach, live data, integrations) ────────────────────
  telemetry: "#3cd7ff",
  telemetryDim: "rgba(60, 215, 255, 0.12)",

  // ── Connect / Trust (teal, secondary accent) ──────────────────────────────
  connect: "#00ddb4",
  connectDim: "rgba(0, 221, 180, 0.1)",

  // ── Semantic ──────────────────────────────────────────────────────────────
  performance: "#00e090",
  recovery: "#ffb020",
  alert: "#ff3a5c",
  cyan: "#00bfff",

  // ── Text ──────────────────────────────────────────────────────────────────
  onSurface: "#e4e1ee",
  onSurfaceMuted: "#c7c4d8",
  onSurfaceSubtle: "rgba(228, 225, 238, 0.52)",
} as const;

export type ColorTokens = typeof COLOR_TOKENS;
