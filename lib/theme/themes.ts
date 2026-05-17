export type ThemeId = "voltline" | "pulse" | "tide" | "solar" | "aurora";

export type ThemeTokens = Record<
  "--volt-300" | "--volt-400" | "--volt-500" | "--volt-600" | "--volt-glow",
  string
>;

export type Theme = {
  id: ThemeId;
  label: string;
  description: string;
  tokens: ThemeTokens;
};

export const THEMES: Record<ThemeId, Theme> = {
  voltline: {
    id: "voltline",
    label: "Voltline",
    description: "Default — electric lime on charcoal",
    tokens: {
      "--volt-300": "#E9FFB5",
      "--volt-400": "#DAFE7E",
      "--volt-500": "#C7FB3A",
      "--volt-600": "#9CD81A",
      "--volt-glow": "rgba(199,251,58,.45)"
    }
  },
  pulse: {
    id: "pulse",
    label: "Pulse",
    description: "Coral heat for high-output athletes",
    tokens: {
      "--volt-300": "#FFC2C2",
      "--volt-400": "#FF9090",
      "--volt-500": "#FF5470",
      "--volt-600": "#D43959",
      "--volt-glow": "rgba(255,84,112,.45)"
    }
  },
  tide: {
    id: "tide",
    label: "Tide",
    description: "Deep teal for endurance and recovery",
    tokens: {
      "--volt-300": "#9EF5E2",
      "--volt-400": "#56E5C9",
      "--volt-500": "#2DD4BF",
      "--volt-600": "#1AAE9C",
      "--volt-glow": "rgba(45,212,191,.45)"
    }
  },
  solar: {
    id: "solar",
    label: "Solar",
    description: "Amber sunrise for morning sessions",
    tokens: {
      "--volt-300": "#FFE3A1",
      "--volt-400": "#FFCB69",
      "--volt-500": "#F5B844",
      "--volt-600": "#D69727",
      "--volt-glow": "rgba(245,184,68,.45)"
    }
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    description: "Violet glow for late-night training",
    tokens: {
      "--volt-300": "#D5C2FF",
      "--volt-400": "#B68FFF",
      "--volt-500": "#9466FF",
      "--volt-600": "#714AD9",
      "--volt-glow": "rgba(148,102,255,.45)"
    }
  }
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
export const DEFAULT_THEME: ThemeId = "voltline";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && v in THEMES;
}
