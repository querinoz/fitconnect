/**
 * FitConnect Elite OS — canonical design tokens (web).
 * Source of truth for CSS variables in app/voltline.css.
 */

export const ELITE_COLORS = {
  /** Deep Obsidian — primary environment */
  obsidian: "#090402",
  /** Canonical Voltline accent */
  voltline: "#C8FF00",
  voltlineSoft: "#E4FF80",
  voltlinePressed: "#9ECC00",
  voltlineGlow: "rgba(200,255,0,0.45)",
  /** Secondary Connect accent */
  connect: "#00DDB4",
  /** Semantic */
  danger: "#FF5470",
  warning: "#F5B844",
  success: "#2DD4BF",
  /** Ink scale */
  ink950: "#090402",
  ink900: "#0E0C0A",
  ink800: "#161310",
  ink700: "#211E1A",
  ink600: "#2E2A24",
  ink500: "#5B554D",
  ink400: "#8A8378",
  ink300: "#BFC3CC",
  ink100: "#F2F3F6",
  ink50: "#FAFBFC"
} as const;

export const ELITE_SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const ELITE_RADIUS = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999
} as const;

export const ELITE_MOTION = {
  fast: 120,
  medium: 240,
  slow: 400
} as const;

export const ELITE_TYPOGRAPHY = {
  display: { size: 48, weight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" },
  h1: { size: 36, weight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" },
  h2: { size: 28, weight: 700, lineHeight: 1.15, letterSpacing: "-0.01em" },
  h3: { size: 22, weight: 600, lineHeight: 1.2, letterSpacing: "-0.01em" },
  body: { size: 16, weight: 400, lineHeight: 1.55, letterSpacing: "0" },
  small: { size: 14, weight: 400, lineHeight: 1.5, letterSpacing: "0" },
  caption: { size: 12, weight: 500, lineHeight: 1.4, letterSpacing: "0.04em" },
  label: { size: 11, weight: 600, lineHeight: 1.3, letterSpacing: "0.12em" },
  metric: { size: 32, weight: 700, lineHeight: 1, letterSpacing: "-0.02em" },
  microLabel: { size: 10, weight: 700, lineHeight: 1.2, letterSpacing: "0.16em" }
} as const;

/** Telemetry zone colors — semantic, never overridden by user accent */
export const TELEMETRY_ZONES = {
  zone1: "#5B8DEF",
  zone2: "#2DD4BF",
  zone3: "#F5B844",
  zone4: "#FF8C42",
  zone5: "#FF5470"
} as const;
