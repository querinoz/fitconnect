#!/usr/bin/env node
/**
 * Copy NEXT_PUBLIC_FIREBASE_* from repo-root .env.local into apps/web/.env.local
 * when the web file is missing them. Next.js only inlines env from the app dir.
 * Never prints values. Does not invent credentials.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
];

function parse(file) {
  const keys = {};
  if (!fs.existsSync(file)) return keys;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    keys[k] = v;
  }
  return keys;
}

function usable(v) {
  return Boolean(v && !/PASTE_|your-|YOUR_|replace_me/i.test(v));
}

const rootEnv = parse(path.join(root, ".env.local"));
const webPath = path.join(root, "apps", "web", ".env.local");
const webEnv = parse(webPath);
const missing = KEYS.filter((k) => usable(rootEnv[k]) && !usable(webEnv[k]));

if (missing.length === 0) {
  console.log("sync-web-firebase-public-env: nothing to copy");
  process.exit(0);
}

if (!fs.existsSync(webPath)) {
  console.log("sync-web-firebase-public-env: apps/web/.env.local missing — not creating (human env)");
  process.exit(1);
}

const block = [
  "",
  "# Synced from repo-root .env.local so Next can inline Firebase public config (local only)",
  ...missing.map((k) => `${k}=${rootEnv[k]}`),
  ""
].join("\n");

fs.appendFileSync(webPath, block, "utf8");
console.log(`sync-web-firebase-public-env: copied ${missing.length} public Firebase keys (values not printed)`);
