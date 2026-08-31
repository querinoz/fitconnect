#!/usr/bin/env node
/**
 * One-time / maintenance: assign role:authenticated to all Firebase users.
 * Credentials (first match wins):
 *   1. GOOGLE_APPLICATION_CREDENTIALS → service-account JSON (gitignored)
 *   2. Application Default Credentials (gcloud auth application-default login)
 * Never prints secrets or full UIDs.
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

loadEnvFiles();

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
  "fitconnect-5d2ba";

const hasKeyFile = Boolean(credPath && fs.existsSync(credPath));
const adcPath = process.env.APPDATA
  ? path.join(process.env.APPDATA, "gcloud", "application_default_credentials.json")
  : null;
const hasAdc = Boolean(adcPath && fs.existsSync(adcPath));

if (!hasKeyFile && !hasAdc) {
  console.log(
    JSON.stringify(
      {
        BACKFILL: "BLOCKED",
        REASON: "CREDENTIALS_MISSING",
        HINT:
          "Use gcloud auth application-default login (preferred) OR set GOOGLE_APPLICATION_CREDENTIALS to a gitignored service-account JSON.",
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

const { initializeApp, cert, applicationDefault, getApps } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");

if (getApps().length === 0) {
  initializeApp({
    credential: hasKeyFile ? cert(credPath) : applicationDefault(),
    projectId,
  });
}

const auth = getAuth();
let nextPageToken;
let updated = 0;
let skipped = 0;
let failed = 0;

do {
  const page = await auth.listUsers(1000, nextPageToken);
  nextPageToken = page.pageToken;
  for (const user of page.users) {
    const role = user.customClaims?.role;
    if (role === "authenticated") {
      skipped += 1;
      continue;
    }
    try {
      await auth.setCustomUserClaims(user.uid, { ...user.customClaims, role: "authenticated" });
      updated += 1;
    } catch {
      failed += 1;
    }
  }
} while (nextPageToken);

console.log(
  JSON.stringify(
    {
      BACKFILL: failed === 0 ? "PASS" : "PARTIAL",
      UPDATED: updated,
      SKIPPED: skipped,
      FAILED: failed,
      PROJECT_ID: projectId,
      CREDENTIALS: hasKeyFile ? "SERVICE_ACCOUNT_JSON" : "APPLICATION_DEFAULT",
      NOTE: "Users must sign in again or refresh ID token to pick up new claims.",
    },
    null,
    2,
  ),
);

process.exit(failed > 0 ? 1 : 0);
