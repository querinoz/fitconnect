/**
 * FitConnect Elite OS — TypeScript design tokens (Stitch reference).
 * Colour values derive from @fitconnect/design-tokens (single source of truth).
 * CSS vars live in elite-os.css — keep in sync via tokens-sync.test.ts.
 */

import { COLOR_TOKENS } from "@fitconnect/design-tokens";

export const EOS_COLORS = {
  floor: COLOR_TOKENS.floor,
  carbon: COLOR_TOKENS.carbon,
  elevated: COLOR_TOKENS.elevated,
  surface: COLOR_TOKENS.surface,
  iris: COLOR_TOKENS.iris,
  irisSoft: COLOR_TOKENS.irisSoft,
  voltline: COLOR_TOKENS.voltline,
  telemetry: COLOR_TOKENS.telemetry,
  performance: COLOR_TOKENS.performance,
  recovery: COLOR_TOKENS.recovery,
  alert: COLOR_TOKENS.alert,
  onSurface: COLOR_TOKENS.onSurface,
  onSurfaceMuted: COLOR_TOKENS.onSurfaceMuted,
  glassBg: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.08)"
} as const;

export const EOS_RADIUS = {
  nested: 12,
  control: 18,
  card: 24,
  modal: 28,
  pill: 9999
} as const;

export const EOS_SPACING = {
  unit: 4,
  stackSm: 8,
  stackMd: 16,
  stackLg: 24,
  gutter: 24,
  bentoGap: 20,
  containerMargin: 32
} as const;

export const EOS_ELEVATION = {
  floor: 0,
  card: 1,
  active: 2,
  glass: "glass"
} as const;

export type EosElevation = 0 | 1 | 2 | "glass";

export const EOS_TYPOGRAPHY = {
  displayLg: { size: "48px", lineHeight: "56px", weight: 700, tracking: "-0.02em" },
  displayLgMobile: { size: "32px", lineHeight: "40px", weight: 700, tracking: "-0.02em" },
  headlineMd: { size: "24px", lineHeight: "32px", weight: 600, tracking: "-0.02em" },
  bodyLg: { size: "18px", lineHeight: "28px", weight: 400 },
  bodyMd: { size: "16px", lineHeight: "24px", weight: 400 },
  dataMetric: { size: "20px", lineHeight: "24px", weight: 500, tracking: "-0.01em" },
  labelCaps: { size: "12px", lineHeight: "16px", weight: 700, tracking: "0.1em" }
} as const;

export const EOS_MOTION = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeSpring: [0.25, 1.5, 0.5, 1] as const,
  duration: {
    micro: 0.15,
    ui: 0.22,
    screen: 0.4,
    data: 1.2
  },
  spring: {
    stiffness: 380,
    damping: 32,
    mass: 0.8
  }
} as const;

/** Bento grid column presets */
export const EOS_LAYOUT = {
  bentoCols: {
    mobile: 1,
    tablet: 2,
    desktop: 12
  },
  maxContent: "80rem"
} as const;
