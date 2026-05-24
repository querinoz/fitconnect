import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync, existsSync } from "node:fs";

const envFile = path.resolve(__dirname, ".vitest-db-env.json");
if (existsSync(envFile)) {
  const env = JSON.parse(readFileSync(envFile, "utf8")) as Record<string, string>;
  Object.assign(process.env, env);
}

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    globalSetup: ["./vitest.setup.db.ts"],
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["tests/**/*.integration.test.ts", "tests/integration/**/*.integration.test.ts"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    pool: "forks",
    testTimeout: 30_000,
    hookTimeout: 120_000
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") }
  }
});
