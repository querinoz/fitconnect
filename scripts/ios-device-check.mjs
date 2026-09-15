#!/usr/bin/env node
/**
 * Cross-platform iOS device-enablement diagnostic.
 * Never prints secrets, tokens, or plist API keys.
 * xcodebuild / device install are BLOCKED on non-darwin hosts.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const darwin = process.platform === "darwin";
const errors = [];
const warns = [];
const ok = [];

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    errors.push(`missing ${rel}`);
    return "";
  }
  return fs.readFileSync(p, "utf8");
}

function which(cmd) {
  const probe = process.platform === "win32" ? "where" : "which";
  const res = spawnSync(probe, [cmd], { encoding: "utf8" });
  return res.status === 0;
}

function walkSwift(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkSwift(p, acc);
    else if (ent.name.endsWith(".swift")) acc.push(p);
  }
  return acc;
}

const yml = read("iosApp/project.yml");
if (!yml.includes("PRODUCT_BUNDLE_IDENTIFIER: com.fitconnect.ios\n") && !yml.includes("PRODUCT_BUNDLE_IDENTIFIER: com.fitconnect.ios\r\n")) {
  if (!yml.includes("PRODUCT_BUNDLE_IDENTIFIER: com.fitconnect.ios")) errors.push("iOS bundle id missing");
}
for (const id of [
  "com.fitconnect.ios.watchkitapp",
  "com.fitconnect.ios.widgets",
  "com.fitconnect.ios.tests",
  "com.fitconnect.ios.watchkitapp.tests",
]) {
  if (!yml.includes(id)) errors.push(`project.yml missing ${id}`);
}
if (!yml.includes("GoogleService-Info.plist")) errors.push("project.yml must copy GoogleService-Info.plist as optional resource");
if (!yml.includes("aps-environment") && !read("iosApp/FitConnect/FitConnect.entitlements").includes("aps-environment")) {
  errors.push("missing aps-environment (Push Notifications)");
}
if (!read("iosApp/FitConnect/FitConnect.entitlements").includes("aps-environment")) {
  errors.push("FitConnect.entitlements missing aps-environment");
}
if (!yml.includes("remote-notification")) errors.push("UIBackgroundModes must include remote-notification");
if (!yml.includes("FitConnectWatchTests")) errors.push("missing watch test target");
if (!yml.includes("Config/Debug.xcconfig")) errors.push("missing Debug.xcconfig wiring");

const gitignore = read(".gitignore");
if (!gitignore.includes("GoogleService-Info.plist")) errors.push(".gitignore must exclude live Firebase plist");
if (!gitignore.includes("Local.xcconfig")) warns.push(".gitignore should exclude iosApp/Config/Local.xcconfig");

if (!exists("iosApp/GoogleService-Info.plist.example")) errors.push("missing Firebase plist example");
if (exists("iosApp/GoogleService-Info.plist")) ok.push("GoogleService-Info.plist present (not printed)");
else warns.push("GoogleService-Info.plist ABSENT — copy the example and paste Firebase Apple values (gitignored)");

if (exists("iosApp/Config/Local.xcconfig")) {
  const local = fs.readFileSync(path.join(root, "iosApp/Config/Local.xcconfig"), "utf8");
  if (local.includes("YOURTEAMID")) warns.push("Local.xcconfig still has YOURTEAMID — paste the Apple Team ID");
  else ok.push("Local.xcconfig present (Team ID not printed)");
} else {
  warns.push("Local.xcconfig ABSENT — copy iosApp/Config/Local.xcconfig.example");
}

const runtime = read("iosApp/FitConnect/SharedAdapters/FitRuntime.swift");
if (!runtime.includes("isAllowedOnDevice")) errors.push("FitRuntime must reject localhost on device");
if (!runtime.includes("fitconnect-phi.vercel.app")) errors.push("default API must be production HTTPS");

const demo = read("iosApp/FitConnect/SharedAdapters/AuthContract.swift");
if (!demo.includes("FitRuntime.localDemoAllowed")) errors.push("LOCAL_DEMO must be gated by FitRuntime");

for (const file of walkSwift(path.join(root, "iosApp/FitConnect"))) {
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("http://localhost") || src.includes("127.0.0.1:3001")) {
    errors.push(`${path.relative(root, file)} hardcodes localhost`);
  }
}

if (darwin) {
  if (which("xcodegen")) ok.push("xcodegen installed");
  else errors.push("xcodegen missing — brew install xcodegen");
  const xcode = spawnSync("xcode-select", ["-p"], { encoding: "utf8" });
  if (xcode.status === 0) ok.push(`xcode-select ${xcode.stdout.trim()}`);
  else errors.push("xcode-select missing — xcode-select --install");
} else {
  warns.push("Host is not macOS — xcodebuild / Simulator / iPhone install are BLOCKED here");
}

console.log("FitConnect iOS device check");
console.log(`host: ${process.platform}`);
for (const line of ok) console.log(`OK    ${line}`);
for (const line of warns) console.log(`WARN  ${line}`);
for (const line of errors) console.log(`FAIL  ${line}`);

if (!darwin) {
  console.log("\nNEXT ON A MAC:");
  console.log("  xcode-select --install && brew install xcodegen");
  console.log("  cp iosApp/Config/Local.xcconfig.example iosApp/Config/Local.xcconfig   # paste Team ID");
  console.log("  cp iosApp/GoogleService-Info.plist.example iosApp/GoogleService-Info.plist  # paste Firebase Apple app");
  console.log("  ./scripts/ios-device-check && ./scripts/ios-sim-test && ./scripts/ios-device-install");
}

if (errors.length) process.exit(1);
console.log(errors.length ? "" : "\nSTATIC READY — physical iPhone still requires Mac + Team + Firebase plist.");
