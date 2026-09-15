#!/usr/bin/env node
/**
 * Presence/format matrix. Never prints secret values.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFiles() {
  const env = { ...process.env };
  for (const rel of [".env.local", "apps/web/.env.local"]) {
    const envPath = path.join(root, rel);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!env[key]) env[key] = val;
    }
  }
  return env;
}

const KEYS = [
  { variable: "NEXT_PUBLIC_FIREBASE_API_KEY", required: true, service: "Firebase", environment: "web+ios", security: "public" },
  { variable: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", required: true, service: "Firebase", environment: "web+ios", security: "public" },
  { variable: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", required: true, service: "Firebase", environment: "web+ios", security: "public" },
  { variable: "NEXT_PUBLIC_FIREBASE_APP_ID", required: true, service: "Firebase", environment: "web+ios", security: "public" },
  { variable: "DATABASE_URL", required: true, service: "Postgres", environment: "server", security: "secret" },
  { variable: "DIRECT_URL", required: true, service: "Postgres", environment: "migrations", security: "secret" },
  { variable: "STRIPE_SECRET_KEY", required: true, service: "Stripe", environment: "server", security: "secret" },
  { variable: "STRIPE_WEBHOOK_SECRET", required: true, service: "Stripe", environment: "server", security: "secret" },
  { variable: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, service: "Stripe", environment: "web", security: "public" },
  { variable: "UPSTASH_REDIS_REST_URL", required: true, service: "Upstash", environment: "server", security: "secret" },
  { variable: "UPSTASH_REDIS_REST_TOKEN", required: true, service: "Upstash", environment: "server", security: "secret" },
  { variable: "OPENAI_API_KEY", required: false, service: "OpenAI", environment: "server", security: "secret" },
  { variable: "WHOOP_CLIENT_ID", required: false, service: "WHOOP", environment: "server", security: "secret" },
  { variable: "OURA_CLIENT_ID", required: false, service: "Oura", environment: "server", security: "secret" },
  { variable: "GARMIN_CLIENT_ID", required: false, service: "Garmin", environment: "server", security: "secret" },
  { variable: "STRAVA_CLIENT_ID", required: false, service: "Strava", environment: "server", security: "secret" },
  { variable: "STRAVA_CLIENT_SECRET", required: false, service: "Strava", environment: "server", security: "secret" },
  { variable: "NEXT_PUBLIC_DEMO_MODE", required: true, service: "Auth", environment: "web", security: "public" },
  { variable: "FITCONNECT_APPLY_PRODUCTION", required: false, service: "Migrations", environment: "ops", security: "flag" }
];

function present(value) {
  if (!value || !String(value).trim()) return false;
  if (String(value).includes("PASTE_")) return false;
  return true;
}

function formatOk(variable, value) {
  if (!present(value)) return false;
  if (variable.includes("STRIPE") && variable.includes("PUBLISHABLE")) return String(value).startsWith("pk_");
  if (variable === "DATABASE_URL" || variable === "DIRECT_URL") return String(value).startsWith("postgres");
  if (variable === "NEXT_PUBLIC_DEMO_MODE") return value === "true" || value === "false";
  if (variable.includes("URL") && variable.includes("UPSTASH")) return String(value).startsWith("http");
  return true;
}

const env = loadEnvFiles();
const rows = KEYS.map((row) => {
  const value = env[row.variable];
  const isPresent = present(value);
  return {
    VARIABLE: row.variable,
    REQUIRED: row.required,
    SERVICE: row.service,
    ENVIRONMENT: row.environment,
    SECURITY: row.security,
    VALIDATED: isPresent && formatOk(row.variable, value),
    PRESENT: isPresent
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  demoMode: env.NEXT_PUBLIC_DEMO_MODE === "true" ? "LOCAL_DEMO" : "production-like",
  rows
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log("VARIABLE\tREQUIRED\tSERVICE\tPRESENT\tVALIDATED");
  for (const row of payload.rows) {
    console.log(`${row.VARIABLE}\t${row.REQUIRED}\t${row.SERVICE}\t${row.PRESENT}\t${row.VALIDATED}`);
  }
}

const missingRequired = rows.filter((r) => r.REQUIRED && !r.PRESENT);
if (process.argv.includes("--strict") && missingRequired.length) {
  console.error(`missing required configuration (${missingRequired.length} keys)`);
  process.exit(2);
}
