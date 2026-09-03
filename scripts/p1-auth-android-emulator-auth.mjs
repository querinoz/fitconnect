#!/usr/bin/env node
/**
 * Android emulator email/password auth flow via ADB. Never logs credentials/tokens.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const marker = path.join(root, ".artifacts", "p1-auth-emulator-account.json");
const adb =
  process.env.ADB ||
  path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk", "platform-tools", "adb.exe");
const serial = process.env.ANDROID_SERIAL || "emulator-5554";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function tap(x, y) {
  run(`"${adb}" -s ${serial} shell input tap ${x} ${y}`);
}

function adbText(text) {
  const escaped = text.replace(/ /g, "%s").replace(/(['"\\])/g, "\\$1");
  run(`"${adb}" -s ${serial} shell input text "${escaped}"`);
}

function logcatAuth() {
  const out = run(
    `"${adb}" -s ${serial} logcat -d -t 300 FitConnectApplication:V FirebaseAuth:V AndroidRuntime:E *:S`,
  );
  const lines = out
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .slice(-40);
  return lines.map((l) => l.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[REDACTED_JWT]"));
}

if (!fs.existsSync(marker)) {
  console.log(JSON.stringify({ EMAIL_PASSWORD: "BLOCKED", REASON: "NO_TEST_ACCOUNT" }));
  process.exit(2);
}

const { email, password } = JSON.parse(fs.readFileSync(marker, "utf8"));

run(`"${adb}" -s ${serial} shell am start -a android.intent.action.VIEW -d "fitconnect://app/auth" -p com.fitconnect.android`);
await new Promise((r) => setTimeout(r, 2500));

tap(540, 1355); // Continue with Email
await new Promise((r) => setTimeout(r, 1500));

run(`"${adb}" -s ${serial} shell uiautomator dump /sdcard/window_dump.xml`);
const xml = run(`"${adb}" -s ${serial} shell cat /sdcard/window_dump.xml`);

const emailMatch = xml.match(/auth_email|Email address|email/i);
const submitMatch = xml.match(/content-desc="Sign in"|text="Sign in"|auth_submit/i);

// Tap first EditText region (email)
const editMatches = [...xml.matchAll(/class="android\.widget\.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)];
if (editMatches.length >= 1) {
  const [, x1, y1, x2, y2] = editMatches[0];
  tap(Math.floor((+x1 + +x2) / 2), Math.floor((+y1 + +y2) / 2));
  run(`"${adb}" -s ${serial} shell input keyevent KEYCODE_CTRL_A`);
  run(`"${adb}" -s ${serial} shell input keyevent KEYCODE_DEL`);
  adbText(email);
}

await new Promise((r) => setTimeout(r, 800));

if (editMatches.length >= 2) {
  const [, x1, y1, x2, y2] = editMatches[1];
  tap(Math.floor((+x1 + +x2) / 2), Math.floor((+y1 + +y2) / 2));
  adbText(password);
} else {
  run(`"${adb}" -s ${serial} shell input keyevent 61`); // TAB
  adbText(password);
}

await new Promise((r) => setTimeout(r, 800));

// Submit button
const signInBtn = xml.match(/text="Sign in"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
if (signInBtn) {
  tap(
    Math.floor((+signInBtn[1] + +signInBtn[3]) / 2),
    Math.floor((+signInBtn[2] + +signInBtn[4]) / 2),
  );
} else {
  tap(540, 1700);
}

await new Promise((r) => setTimeout(r, 8000));

run(`"${adb}" -s ${serial} shell uiautomator dump /sdcard/window_dump.xml`);
const afterXml = run(`"${adb}" -s ${serial} shell cat /sdcard/window_dump.xml`);
const logs = logcatAuth();

const signedIn =
  !/Identity verification|Continue with Email/i.test(afterXml) &&
  (/Athlete|Coach|HOME|Today|Hoje|Role|onboarding/i.test(afterXml) ||
    logs.some((l) => /signInWithEmailAndPassword.*not allowed/i.test(l) === false && /FirebaseAuth.*success/i.test(l)));

const authError = logs.some((l) => /FirebaseAuth.*error|AUTH_UNAVAILABLE|invalid credential/i.test(l));
const fatal = logs.some((l) => /FATAL EXCEPTION/.test(l));

console.log(
  JSON.stringify(
    {
      EMAIL_PASSWORD: signedIn ? "PASS" : authError ? "FAIL" : "PENDING",
      FATAL_CRASH: fatal ? "YES" : "NO",
      UI_LEFT_AUTH: !/Continue with Email/.test(afterXml),
      LOG_SIGNALS: logs.slice(-8),
      EMAIL_FIELD_FOUND: editMatches.length > 0,
      SUBMIT_FOUND: Boolean(signInBtn || submitMatch),
    },
    null,
    2,
  ),
);

process.exit(signedIn ? 0 : 1);
