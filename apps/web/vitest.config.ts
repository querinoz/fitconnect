import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["lib/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.*",
        "**/types.ts",
        "lib/i18n/**",
        "lib/db/**",
        "lib/auth/**",
        "lib/api/**",
        "lib/ingestion/**",
        "lib/video/**",
        "lib/onboarding/**",
        "lib/hooks/**",
        "lib/i18n-provider.tsx",
        "lib/i18n.ts",
        "lib/auth-store.ts",
        "lib/use-auth-hydrated.ts",
        "lib/use-mounted.ts",
        "lib/use-entrance-motion.ts",
        "lib/observability/posthog.ts",
        "lib/observability/sentry.client.ts",
        "lib/platform/index.ts",
        "lib/platform/ports/**",
        "lib/coach/exercises.ts",
        "lib/coach/availability.ts",
        "lib/stripe/client.ts"
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        statements: 50
      }
    }
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
