#!/usr/bin/env node
/**
 * Provision a verified @fitconnect-qa.invalid user for Android instrumentation tests.
 * Requires ADC (gcloud auth application-default login) or GOOGLE_APPLICATION_CREDENTIALS.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_EMAIL = "p1auth.instrumentation@fitconnect-qa.invalid";
const DEFAULT_PASSWORD = "P1AuthInstr!2026";

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

const email = process.env.P1_AUTH_ANDROID_TEST_EMAIL?.trim() || DEFAULT_EMAIL;
const password = process.env.P1_AUTH_ANDROID_TEST_PASSWORD?.trim() || DEFAULT_PASSWORD;
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
  console.log(JSON.stringify({ PROVISION: "BLOCKED", REASON: "CREDENTIALS_MISSING" }, null, 2));
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
let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, {
    emailVerified: true,
    password,
    customClaims: { ...user.customClaims, role: "authenticated" },
  });
} catch (e) {
  if (e?.code !== "auth/user-not-found") throw e;
  user = await auth.createUser({
    email,
    password,
    emailVerified: true,
    displayName: "P1 Android Instrumentation",
  });
  await auth.setCustomUserClaims(user.uid, { role: "authenticated" });
}

console.log(
  JSON.stringify(
    {
      PROVISION: "PASS",
      EMAIL: email,
      UID_LEN: user.uid.length,
      EMAIL_VERIFIED: true,
      ROLE: "authenticated",
      NOTE: "Password not printed. Use P1_AUTH_ANDROID_TEST_PASSWORD env or default in test source.",
    },
    null,
    2,
  ),
);
