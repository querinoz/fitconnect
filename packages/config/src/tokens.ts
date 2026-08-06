import { COLOR_TOKENS } from "@fitconnect/design-tokens";

export const tokens = {
  colors: {
    brand: {
      400: COLOR_TOKENS.volt400,
      500: COLOR_TOKENS.voltline
    },
    accent: {
      400: COLOR_TOKENS.volt300,
      500: COLOR_TOKENS.voltline
    },
    signal: {
      500: COLOR_TOKENS.alert
    },
    recovery: {
      500: COLOR_TOKENS.recovery
    },
    connect: {
      500: COLOR_TOKENS.connect
    },
    telemetry: {
      500: COLOR_TOKENS.telemetry
    },
    plasma: {
      500: COLOR_TOKENS.iris
    },
    ink: {
      50: "#f8fafc",
      100: COLOR_TOKENS.onSurface,
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      700: "#334155",
      800: COLOR_TOKENS.carbon,
      900: "#0b0f19",
      950: COLOR_TOKENS.floor
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
    primary: `linear-gradient(135deg, ${COLOR_TOKENS.volt300}, ${COLOR_TOKENS.volt400})`,
    warm: `linear-gradient(135deg, ${COLOR_TOKENS.alert}, ${COLOR_TOKENS.iris})`,
    ambient: `radial-gradient(at top left, rgba(191,238,22,0.14), transparent 50%), radial-gradient(at bottom right, rgba(0,221,180,0.10), transparent 50%)`
  },
  animation: {
    easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    spring: "cubic-bezier(0.25, 1.5, 0.5, 1)"
  }
} as const;

export type FitConnectTokens = typeof tokens;
