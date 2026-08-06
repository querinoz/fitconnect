import { COLOR_TOKENS } from "@fitconnect/design-tokens";

/** Shared Recharts palette — sourced from @fitconnect/design-tokens COLOR_TOKENS */
export const rechartsTheme = {
  // Structural
  grid: "rgba(51, 65, 85, 0.25)",
  gridBorder: "#1e293b",
  axis: "#64748b",
  axisTick: "#94a3b8",
  tooltipBg: "#0f172a",
  tooltipBorder: "#1e293b",

  // Data series
  baseline: COLOR_TOKENS.alert,
  hrv: COLOR_TOKENS.alert,
  ink: COLOR_TOKENS.floor, /* legacy: dark background for tooltip/gradient */
  sleep: COLOR_TOKENS.connect,
  sleepFill: `rgba(0, 221, 180, 0.25)`,
  trend: COLOR_TOKENS.volt600,
  trendFill: `rgba(168, 215, 0, 0.2)`,
  revenue: COLOR_TOKENS.iris,
  revenueFill: `rgba(108, 99, 255, 0.2)`,
  retention: COLOR_TOKENS.connect,
  retentionFill: `rgba(0, 221, 180, 0.25)`,
  earnings: COLOR_TOKENS.voltline,
  earningsFill: `rgba(200, 255, 0, 0.25)`,
  load: COLOR_TOKENS.connect,
} as const;
