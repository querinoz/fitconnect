#!/usr/bin/env node
/**
 * Safe P1-AUTH config diagnostic — never prints secrets.
 * Usage: node scripts/p1-auth-config-diagnostic.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFiles() {
  for (const rel of [".env.local", "apps/web/.env.local"]) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

function present(key) {
  const v = process.env[key]?.trim();
  return Boolean(
    v && !v.includes("PASTE_") && !v.includes("your-") && !v.includes("YOUR_") && v.length > 0
  );
}

function firebaseWebComplete() {
  return (
    present("NEXT_PUBLIC_FIREBASE_API_KEY") &&
    present("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") &&
    present("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
    present("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") &&
    present("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") &&
    present("NEXT_PUBLIC_FIREBASE_APP_ID")
  );
}

loadEnvFiles();

const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const gs = fs.existsSync(path.join(root, "android", "app", "google-services.json"));
const web = firebaseWebComplete();

const report = {
  AUTH_PROVIDER: "FIREBASE",
  DEMO_MODE: demo ? "ENABLED" : "DISABLED",
  FIREBASE_WEB_CONFIG: web ? "PRESENT" : "MISSING",
  FIREBASE_ADMIN: "NOT_REQUIRED",
  ANDROID_GOOGLE_SERVICES: gs ? "PRESENT" : "MISSING",
  SUPABASE_DATA_API:
    present("NEXT_PUBLIC_SUPABASE_URL") && present("NEXT_PUBLIC_SUPABASE_ANON_KEY")
      ? "PRESENT"
      : "MISSING",
  PRODUCTION_AUTH_READY: web && !demo,
  EXPO_APPS_MOBILE: "FROZEN_NOT_AUTH_IDP",
  NOTE: "Session verify uses Google JWKS; no firebase-admin required for requireAuth."
};

console.log(JSON.stringify(report, null, 2));
process.exit(web && !demo ? 0 : 2);
