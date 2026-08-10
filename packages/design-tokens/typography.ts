/**
 * Elite Surface type scale.
 * Families: display = Syne, body = Plus Jakarta Sans, mono = JetBrains Mono.
 * Sizes in sp; weight 400–700; tracking in sp-ish em*100 for Kotlin emission.
 */
export const TYPE_TOKENS = {
  displayXl: { size: 40, lineHeight: 44, weight: 700, tracking: -0.8, family: "display" },
  displayL: { size: 32, lineHeight: 36, weight: 700, tracking: -0.6, family: "display" },
  headline: { size: 24, lineHeight: 30, weight: 700, tracking: -0.4, family: "display" },
  title: { size: 20, lineHeight: 26, weight: 600, tracking: -0.2, family: "body" },
  subtitle: { size: 16, lineHeight: 22, weight: 600, tracking: 0, family: "body" },
  body: { size: 15, lineHeight: 22, weight: 400, tracking: 0, family: "body" },
  caption: { size: 12, lineHeight: 16, weight: 500, tracking: 0.2, family: "body" },
  overline: { size: 11, lineHeight: 14, weight: 600, tracking: 1.2, family: "body" },
  metric: { size: 28, lineHeight: 32, weight: 600, tracking: -0.4, family: "mono" },
  monospace: { size: 13, lineHeight: 18, weight: 500, tracking: 0, family: "mono" },
} as const;

export type TypeToken = (typeof TYPE_TOKENS)[keyof typeof TYPE_TOKENS];
