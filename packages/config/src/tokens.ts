export const tokens = {
  colors: {
    brand: {
      400: "#22d3ee",
      500: "#06b6d4"
    },
    accent: {
      400: "#a3e635",
      500: "#84cc16"
    },
    signal: {
      500: "#f43f5e"
    },
    plasma: {
      500: "#a855f7"
    },
    ink: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617"
    }
  },
  typography: {
    display: "Space Grotesk",
    body: "Inter"
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999
  },
  spacing: {
    sectionY: { desktop: 96, mobile: 64 },
    cardPadding: [20, 24, 32, 40] as const
  },
  gradients: {
    primary: "linear-gradient(135deg, #22d3ee, #84cc16)",
    warm: "linear-gradient(135deg, #f43f5e, #a855f7)",
    ambient:
      "radial-gradient(at top left, rgba(34,211,238,0.22), transparent 50%), radial-gradient(at bottom right, rgba(132,204,22,0.18), transparent 50%), radial-gradient(at 70% 20%, rgba(168,85,247,0.10), transparent 40%)"
  },
  animation: {
    easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    spring: "cubic-bezier(0.25, 1.5, 0.5, 1)"
  }
} as const;

export type FitConnectTokens = typeof tokens;
