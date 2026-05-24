export const tokens = {
  colors: {
    brand: {
      400: "#d0ff33",
      500: "#c8ff00"
    },
    accent: {
      400: "#d4ff4d",
      500: "#c8ff00"
    },
    signal: {
      500: "#ff3a5c"
    },
    plasma: {
      500: "#a855f7"
    },
    ink: {
      50: "#f8fafc",
      100: "#eeeef2",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      700: "#334155",
      800: "#111827",
      900: "#0b0f19",
      950: "#070b14"
    }
  },
  typography: {
    display: "Syne",
    body: "Plus Jakarta Sans"
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    full: 9999
  },
  spacing: {
    sectionY: { desktop: 96, mobile: 64 },
    cardPadding: [20, 24, 32, 40] as const
  },
  gradients: {
    primary: "linear-gradient(135deg, #d4ff4d, #bfee16)",
    warm: "linear-gradient(135deg, #ff3a5c, #a855f7)",
    ambient:
      "radial-gradient(at top left, rgba(191,238,22,0.14), transparent 50%), radial-gradient(at bottom right, rgba(0,221,180,0.10), transparent 50%)"
  },
  animation: {
    easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    spring: "cubic-bezier(0.25, 1.5, 0.5, 1)"
  }
} as const;

export type FitConnectTokens = typeof tokens;
