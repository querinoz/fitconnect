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

/**
 * Atmosphere — theme chrome, not a product feature.
 * Honeycomb intensities: off | subtle only. No full. No confetti.
 */
export const ATMOSPHERE_TOKENS = {
  honeycombSubtle: 0.06,
  honeycombEmpty: 0.16,
  honeycombParallax: 0.04,
  honeycombPulse: 0.12,
  honeycombCellRadius: 28,
  honeycombDriftMs: 32000,
  honeycombMaxCells: 120,
  honeycombPulseCells: 3,
  honeycombCoverage: 0.58,
  honeycombBudgetMs: 1.5,
  honeycombSessionScale: 0.3,
} as const;

/**
 * Instrument ring — fractions of diameter D, plus hero sizes (dp).
 * Thicknesses must stay relative so 224dp and 160dp rings share weight.
 */
export const INSTRUMENT_TOKENS = {
  bezel: 0.085,
  groove: 0.045,
  halo: 0.065,
  stroke: 0.031,
  specular: 0.027,
  trackRadius: 0.405,
  haloAlpha: 0.18,
  specularAlpha: 0.05,
  heroDp: 224,
  profileDp: 160,
  inlineDp: 88,
  loadTimeoutMs: 8000,
  headerDp: 52,
  hexatarHeaderDp: 32,
  hexatarProfileDp: 104,
  hexatarFeedDp: 26,
  hexatarBadgeDp: 14,
  logoMarkDp: 24,
} as const;
