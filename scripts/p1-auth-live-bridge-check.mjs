#!/usr/bin/env node
/**
 * P1-AUTH live bridge check — uses real Firebase + Supabase. Never prints secrets/tokens.
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

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/") + "===".slice((parts[1].length + 3) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

async function refreshIdToken(refreshToken) {
  const res = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    },
  );
  const body = await res.json();
  if (!res.ok) return { ok: false, body };
  return { ok: true, idToken: body.id_token, body };
}

loadEnvFiles();

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\/$/, "");
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const testEmail =
  process.env.P1_AUTH_TEST_EMAIL?.trim() ||
  process.env.FITCONNECT_TEST_EMAIL?.trim() ||
  (() => {
    const marker = path.join(root, ".artifacts", "p1-auth-emulator-account.json");
    if (fs.existsSync(marker)) {
      try {
        return JSON.parse(fs.readFileSync(marker, "utf8")).email;
      } catch {
        /* fall through */
      }
    }
    return `p1auth.${Date.now()}@fitconnect-qa.invalid`;
  })();
const testPassword =
  process.env.P1_AUTH_TEST_PASSWORD?.trim() ||
  process.env.FITCONNECT_TEST_PASSWORD?.trim() ||
  (() => {
    const marker = path.join(root, ".artifacts", "p1-auth-emulator-account.json");
    if (fs.existsSync(marker)) {
      try {
        return JSON.parse(fs.readFileSync(marker, "utf8")).password;
      } catch {
        /* fall through */
      }
    }
    return `FcP1!${Date.now()}Aa9`;
  })();
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "fitconnect-5d2ba";
const keepTestUser =
  process.env.P1_AUTH_KEEP_TEST_USER === "1" || process.env.P1_AUTH_KEEP_TEST_USER === "true";
const isSyntheticTestEmail = testEmail.endsWith("@fitconnect-qa.invalid");

const report = {
  FIREBASE_SIGNUP: "BLOCKED",
  FIREBASE_SIGNIN: "BLOCKED",
  FIREBASE_UID: "BLOCKED",
  SUPABASE_BRIDGE: "BLOCKED",
  ROLE_AUTHENTICATED: "BLOCKED",
  IDENTITY_READ: "BLOCKED",
  CREDENTIALS_SOURCE: process.env.P1_AUTH_TEST_EMAIL || process.env.FITCONNECT_TEST_EMAIL ? "ENV" : "EPHEMERAL",
};

if (!apiKey || !supabaseUrl || !supabaseAnon) {
  console.log(JSON.stringify({ ...report, ERROR: "MISSING_CONFIG" }, null, 2));
  process.exit(2);
}

async function firebaseSignUp() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword, returnSecureToken: true }),
    },
  );
  const body = await res.json();
  return { ok: res.ok, body };
}

async function firebaseSignIn() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword, returnSecureToken: true }),
    },
  );
  const body = await res.json();
  return { ok: res.ok, body };
}

async function supabaseBootstrap(idToken, uid) {
  const res = await fetch(`${supabaseUrl}/rest/v1/identity_profiles?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: supabaseAnon,
      Authorization: `Bearer ${idToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: uid,
      email: testEmail,
      display_name: "P1 Auth Probe",
      updated_at: new Date().toISOString(),
    }),
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, bodyPrefix: text.slice(0, 120) };
}
async function firebaseDeleteAccount(idToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );
  return { ok: res.ok, status: res.status };
}

async function supabaseProbe(idToken) {
  const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnon, Authorization: `Bearer ${idToken}` },
  });
  const restRes = await fetch(`${supabaseUrl}/rest/v1/identity_profiles?select=id&limit=1`, {
    headers: {
      apikey: supabaseAnon,
      Authorization: `Bearer ${idToken}`,
      Accept: "application/json",
    },
  });
  const authText = await authRes.text();
  const restText = await restRes.text();
  return {
    authStatus: authRes.status,
    restStatus: restRes.status,
    authErrorPrefix: authText.slice(0, 160),
    restErrorPrefix: restText.slice(0, 160),
  };
}

try {
  let signUp = await firebaseSignUp();
  if (!signUp.ok && signUp.body?.error?.message?.includes("EMAIL_EXISTS")) {
    signUp = { ok: true, body: { localId: "existing" } };
  }
  report.FIREBASE_SIGNUP = signUp.ok ? "PASS" : "FAIL";

  const signIn = await firebaseSignIn();
  report.FIREBASE_SIGNIN = signIn.ok ? "PASS" : "FAIL";

  const idTokenInitial = signIn.body?.idToken;
  const refreshToken = signIn.body?.refreshToken;
  const localId = signIn.body?.localId;
  let idToken = idTokenInitial;
  if (refreshToken) {
    const refreshed = await refreshIdToken(refreshToken);
    if (refreshed.ok && refreshed.idToken) {
      idToken = refreshed.idToken;
      report.TOKEN_REFRESH = "PASS";
    } else {
      report.TOKEN_REFRESH = "FAIL";
    }
  } else {
    report.TOKEN_REFRESH = "SKIPPED";
  }
  if (idToken && localId) {
    report.FIREBASE_UID = "PASS";
    const claims = decodeJwtPayload(idToken);
    const issuer = claims?.iss ?? "";
    const isFirebaseIssuer = issuer.includes("securetoken.google.com");
    const sub = claims?.sub ?? localId;
    report.ISSUER_FIREBASE = isFirebaseIssuer ? "PASS" : "FAIL";
    report.SUB_MATCHES_UID = sub === localId ? "PASS" : "FAIL";
    report.JWT_AUD = claims?.aud === firebaseProjectId ? "PASS" : "FAIL";
    report.JWT_ROLE = claims?.role === "authenticated" ? "authenticated" : claims?.role ?? "MISSING";

    const probe = await supabaseProbe(idToken);
    const bootstrap = await supabaseBootstrap(idToken, localId);
    report.IDENTITY_BOOTSTRAP = bootstrap.status === 200 || bootstrap.status === 201 ? "PASS" : "FAIL";
    report.SUPABASE_AUTH_V1_STATUS = probe.authStatus;
    report.SUPABASE_REST_STATUS = probe.restStatus;
    report.SUPABASE_BRIDGE =
      probe.restStatus === 200 ? "PASS" : probe.authStatus === 200 ? "PARTIAL" : "FAIL";
    report.ROLE_AUTHENTICATED =
      claims?.role === "authenticated" && probe.restStatus === 200 ? "PASS" : "FAIL";
    report.IDENTITY_READ = probe.restStatus === 200 ? "PASS" : "FAIL";
    if (probe.restStatus !== 200) {
      report.SUPABASE_HINT = probe.restErrorPrefix.includes("JWT")
        ? "CHECK_THIRD_PARTY_FIREBASE_AND_ROLE_CLAIM"
        : "CHECK_SUPABASE_DATA_API";
    }
  }

  if (keepTestUser) {
    report.TEST_USER_CLEANUP = "KEPT";
  } else if (!isSyntheticTestEmail) {
    report.TEST_USER_CLEANUP = "SKIPPED_NON_SYNTHETIC";
  } else if (!idTokenInitial) {
    report.TEST_USER_CLEANUP = "SKIPPED_NO_TOKEN";
  } else {
    const deleted = await firebaseDeleteAccount(idTokenInitial);
    report.TEST_USER_CLEANUP = deleted.ok ? "DELETED" : "FAIL";
  }

  console.log(
    JSON.stringify(
      {
        ...report,
        TEST_EMAIL_PRESENT: Boolean(testEmail),
        TEST_EMAIL_DOMAIN: isSyntheticTestEmail ? "@fitconnect-qa.invalid" : "other",
        NOTE: "No tokens/passwords printed. Set P1_AUTH_KEEP_TEST_USER=1 to retain synthetic accounts.",
      },
      null,
      2,
    ),
  );
  const pass =
    report.FIREBASE_SIGNIN === "PASS" &&
    report.FIREBASE_UID === "PASS" &&
    report.JWT_ROLE === "authenticated" &&
    report.SUPABASE_BRIDGE === "PASS";
  process.exit(pass ? 0 : 1);
} catch (e) {
  console.log(JSON.stringify({ ...report, ERROR: String(e?.message ?? e) }, null, 2));
  process.exit(1);
}
