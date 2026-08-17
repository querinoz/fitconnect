export { MOTION_TOKENS } from "./motion";
export {
  resolveEffectiveReduced,
  parseStoredMotion,
  MOTION_STORAGE_KEY,
  type MotionPreference
} from "./src/motion-policy";
export {
  SPACING_TOKENS,
  RADIUS_TOKENS,
  ELEVATION_TOKENS,
  OPACITY_TOKENS,
  BORDER_TOKENS,
  GLASS_TOKENS,
  ATMOSPHERE_TOKENS,
  INSTRUMENT_TOKENS,
} from "./layout";
export { TYPE_TOKENS, type TypeToken } from "./typography";
export { SEMANTIC_TOKENS, CHART_TOKENS, GRADIENT_TOKENS } from "./semantic";

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
  instrumentFace: "#0a0e15",
  instrumentBezel: "#161a22",
  instrumentGroove: "#05070b",
  instrumentTrack: "#1a2028",
  onVolt: "#0f1400",
  instrumentMuted: "#8a93a0",

  // Progression only — never on HRV / strain / ring. ATIVO = telemetry, ELITE = voltline, FORTE = recovery.
  patentSteel: "#7a8899",
  onPatentSteel: "#14191f",
  patentMint: "#2fe3a0",
  onPatentMint: "#04241a",
  onPatentAmber: "#241700",
  patentLegend: "#b44bff",
  onPatentLegend: "#1b0729",
  onPatentCyan: "#04222b",
  patentEmber: "#ff8a3d",

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

  // ── Light surfaces (same obsidian-lavender family, lifted for daylight) ───
  // lightFloor = onSurface paper. lightOnSurface = floor. lightOnSurfaceMuted = carbon.
  lightFloor: "#e4e1ee",
  lightSurface: "#f3f1f8",
  lightSurfaceContainer: "#d8d4e6",
  lightOnSurface: "#070b14",
  lightOnSurfaceMuted: "#111827",
} as const;

export type ColorTokens = typeof COLOR_TOKENS;
