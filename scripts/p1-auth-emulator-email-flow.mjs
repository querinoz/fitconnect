#!/usr/bin/env node
/**
 * Ensures a dedicated P1-AUTH emulator test Firebase account exists.
 * Never prints email/password/token values.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const marker = path.join(root, ".artifacts", "p1-auth-emulator-account.json");

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

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
const email =
  process.env.P1_AUTH_TEST_EMAIL?.trim() ||
  process.env.FITCONNECT_TEST_EMAIL?.trim() ||
  "p1auth.emulator.cert2@fitconnect-qa.invalid";
const password =
  process.env.P1_AUTH_TEST_PASSWORD?.trim() ||
  process.env.FITCONNECT_TEST_PASSWORD?.trim() ||
  "FcP1EmulatorCert9z";

if (!apiKey) {
  console.log(JSON.stringify({ READY: false, REASON: "MISSING_FIREBASE_API_KEY" }));
  process.exit(2);
}

async function signUp() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  return { ok: res.ok, body: await res.json() };
}

async function signIn() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  return { ok: res.ok, body: await res.json() };
}

const up = await signUp();
if (!up.ok && !up.body?.error?.message?.includes("EMAIL_EXISTS")) {
  console.log(JSON.stringify({ READY: false, REASON: "SIGNUP_FAILED" }));
  process.exit(1);
}
const in_ = await signIn();
if (!in_.ok || !in_.body?.localId) {
  console.log(JSON.stringify({ READY: false, REASON: "SIGNIN_FAILED" }));
  process.exit(1);
}

fs.mkdirSync(path.dirname(marker), { recursive: true });
fs.writeFileSync(
  marker,
  JSON.stringify({ email, password, uid: in_.body.localId, createdAt: new Date().toISOString() }, null, 2),
  { mode: 0o600 },
);
console.log(JSON.stringify({ READY: true, UID_PRESENT: true, MARKER: "PRESENT" }));
