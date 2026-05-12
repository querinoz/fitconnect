import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem"
      },
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63"
        },
        accent: {
          200: "#d9f99d",
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f"
        },
        signal: {
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c"
        },
        plasma: {
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce"
        },
        surface: {
          low: "#020617",
          DEFAULT: "#070d1c",
          high: "#0f172a",
          higher: "#1e293b"
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34,211,238,0.4)" },
          "50%": { boxShadow: "0 0 0 14px rgba(34,211,238,0)" }
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "ring-progress": {
          from: { strokeDashoffset: "283" },
          to: { strokeDashoffset: "60" }
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "kinetic-drift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%, 100% 50%, 50% 0%"
          },
          "33%": {
            backgroundPosition: "60% 30%, 30% 70%, 70% 40%"
          },
          "66%": {
            backgroundPosition: "40% 70%, 70% 30%, 30% 60%"
          }
        },
        "stroke-trace": {
          from: { strokeDashoffset: "1200" },
          to: { strokeDashoffset: "0" }
        },
        "word-stagger": {
          from: { opacity: "0", transform: "translateY(40%) skewY(6deg)" },
          to: { opacity: "1", transform: "translateY(0) skewY(0deg)" }
        },
        "tick-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" }
        },
        flip: {
          "0%, 100%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        float: "float 6s ease-in-out infinite",
        "ring-progress": "ring-progress 1.6s ease-out forwards",
        "gradient-pan": "gradient-pan 12s ease infinite",
        "kinetic-drift": "kinetic-drift 28s ease-in-out infinite",
        "stroke-trace": "stroke-trace 8s ease-in-out infinite alternate",
        "word-stagger": "word-stagger 1s cubic-bezier(0.16, 1, 0.3, 1) both"
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        "radial-fade":
          "radial-gradient(ellipse at center, rgba(34,211,238,0.18), transparent 60%)"
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(34,211,238,0.5)",
        "glow-warm": "0 0 30px -5px rgba(244,63,94,0.4)",
        "glow-plasma": "0 0 30px -5px rgba(168,85,247,0.5)",
        elevated:
          "0 10px 40px -10px rgba(0,0,0,0.4), 0 4px 12px -2px rgba(34,211,238,0.15)"
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.25, 1.5, 0.5, 1)"
      }
    }
  },
  plugins: []
};

export default config;
