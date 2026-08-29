/** FitConnect social reactions — feed + celebrations */
export const FITCONNECT_REACTIONS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "⚡", label: "Beast" },
  { emoji: "💚", label: "Proud" },
  { emoji: "🏆", label: "Elite" },
  { emoji: "🚀", label: "Go" },
  { emoji: "💪", label: "Strong" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🫡", label: "Respect" }
] as const;

export type FitConnectReactionEmoji =
  (typeof FITCONNECT_REACTIONS)[number]["emoji"];
