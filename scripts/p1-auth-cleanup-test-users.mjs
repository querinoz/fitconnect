#!/usr/bin/env node
/**
 * List or delete Firebase Auth accounts with @fitconnect-qa.invalid emails.
 * Dry-run by default — pass --confirm to delete.
 *
 * Credentials (same as backfill):
 *   1. GOOGLE_APPLICATION_CREDENTIALS → service-account JSON (gitignored)
 *   2. Application Default Credentials (gcloud auth application-default login)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMAIL_SUFFIX = "@fitconnect-qa.invalid";
const confirm = process.argv.includes("--confirm");

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
        CLEANUP: "BLOCKED",
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
const matches = [];
let nextPageToken;

do {
  const page = await auth.listUsers(1000, nextPageToken);
  nextPageToken = page.pageToken;
  for (const user of page.users) {
    if (user.email?.endsWith(EMAIL_SUFFIX)) {
      matches.push({
        uid: user.uid,
        email: user.email,
        created: user.metadata.creationTime,
      });
    }
  }
} while (nextPageToken);

if (!confirm) {
  console.log(
    JSON.stringify(
      {
        CLEANUP: "DRY_RUN",
        PROJECT_ID: projectId,
        MATCH_COUNT: matches.length,
        EMAIL_SUFFIX,
        ACCOUNTS: matches,
        HINT: "Review the list, then re-run with --confirm to delete.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

let deleted = 0;
let failed = 0;
const errors = [];

for (const account of matches) {
  try {
    await auth.deleteUser(account.uid);
    deleted += 1;
  } catch (e) {
    failed += 1;
    errors.push({ email: account.email, error: String(e?.message ?? e) });
  }
}

console.log(
  JSON.stringify(
    {
      CLEANUP: failed === 0 ? "PASS" : "PARTIAL",
      PROJECT_ID: projectId,
      MATCH_COUNT: matches.length,
      DELETED: deleted,
      FAILED: failed,
      ERRORS: errors.length ? errors : undefined,
    },
    null,
    2,
  ),
);

process.exit(failed > 0 ? 1 : 0);
