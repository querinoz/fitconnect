import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: [
      "lib/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}"
    ],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.*",
        "**/types.ts",
        "lib/i18n/**",
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
        "lib/auth/supabase/**",
        "lib/auth/use-supabase-auth-sync.ts",
        "lib/auth/supabase-browser-auth.ts",
        "lib/auth/demo-tab-storage.ts",
        "lib/api/hooks/**",
        "lib/stripe/server.ts",
      ],
      thresholds: {
        statements: 47,
        branches: 45,
        functions: 61,
        lines: 47,
        "lib/readiness/compute.ts": { statements: 85, branches: 65, functions: 90 },
        "lib/auth/middleware-auth.ts": { statements: 90, branches: 85, functions: 90 },
        "lib/auth/map-supabase-user.ts": { statements: 85, branches: 50, functions: 85 },
        "lib/auth/demo-session.ts": { statements: 85, branches: 55, functions: 85 },
        "lib/api/require-auth.ts": { statements: 40, branches: 20, functions: 40 },
        "lib/stripe/webhook-handler.ts": { statements: 90, branches: 50, functions: 95 }
      }
    }
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
