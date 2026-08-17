/** Spacing, radius, elevation, opacity — Elite Surface layout scale (dp / unitless). */
export const SPACING_TOKENS = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  inset: 20,
  xl: 24,
  xxl: 32,
  section: 40,
  xxxl: 48,
  huge: 64,
} as const;

export const RADIUS_TOKENS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/** Elevation levels map to Compose tonal elevation (dp). */
export const ELEVATION_TOKENS = {
  none: 0,
  low: 1,
  mid: 3,
  high: 6,
  overlay: 12,
} as const;

export const OPACITY_TOKENS = {
  disabled: 0.38,
  muted: 0.52,
  subtle: 0.72,
  glass: 0.72,
  scrim: 0.56,
  border: 0.16,
} as const;

export const BORDER_TOKENS = {
  hairline: 1,
  thin: 1.5,
  thick: 2,
} as const;

/**
 * Glass ladder — opacity + optional localized blur (dp).
 * L2 matches OPACITY_TOKENS.glass. Never fullscreen blur.
 */
export const GLASS_TOKENS = {
  l1: 0.88,
  l2: 0.72,
  l3: 0.64,
  l4: 0.52,
  l5: 0.42,
  highlight: 0.18,
  blurL3: 8,
  blurL4: 12,
  blurL5: 20,
} as const;
