#!/usr/bin/env node
/**
 * Cross-platform iOS diagnostic for TestFlight (primary) and Mac USB (optional).
 * Never prints secrets, tokens, or plist API keys.
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
if (!yml.includes("PRODUCT_BUNDLE_IDENTIFIER: com.fitconnect.ios")) errors.push("iOS bundle id missing");
for (const id of [
  "com.fitconnect.ios.watchkitapp",
  "com.fitconnect.ios.widgets",
  "com.fitconnect.ios.tests",
  "com.fitconnect.ios.watchkitapp.tests",
]) {
  if (!yml.includes(id)) errors.push(`project.yml missing ${id}`);
}
if (!yml.includes("GoogleService-Info.plist")) errors.push("project.yml must copy GoogleService-Info.plist as optional resource");
if (!yml.includes("FitConnectRelease.entitlements")) errors.push("Release entitlements path missing");
if (!yml.includes("ITSAppUsesNonExemptEncryption")) errors.push("export compliance key missing");
if (!read("iosApp/FitConnect/FitConnect.entitlements").includes("aps-environment")) {
  errors.push("FitConnect.entitlements missing aps-environment");
}
if (!read("iosApp/FitConnect/FitConnectRelease.entitlements").includes("production")) {
  errors.push("FitConnectRelease.entitlements must use aps-environment production");
}
if (!yml.includes("remote-notification")) errors.push("UIBackgroundModes must include remote-notification");
if (!yml.includes("FitConnectWatchTests")) errors.push("missing watch test target");
if (!yml.includes("Config/Debug.xcconfig")) errors.push("missing Debug.xcconfig wiring");

const gitignore = read(".gitignore");
if (!gitignore.includes("GoogleService-Info.plist")) errors.push(".gitignore must exclude live Firebase plist");
if (!gitignore.includes("AuthKey_*.p8")) errors.push(".gitignore must exclude App Store Connect .p8 keys");
if (!gitignore.includes("Local.xcconfig")) warns.push(".gitignore should exclude iosApp/Config/Local.xcconfig");

if (!exists("iosApp/GoogleService-Info.plist.example")) errors.push("missing Firebase plist example");
if (exists("iosApp/GoogleService-Info.plist")) ok.push("GoogleService-Info.plist present locally (not printed)");
else warns.push("GoogleService-Info.plist ABSENT locally — TestFlight CI injects IOS_GOOGLE_SERVICE_INFO_PLIST");

if (exists("iosApp/Config/Local.xcconfig")) {
  ok.push("Local.xcconfig present (Team ID not printed)");
} else {
  warns.push("Local.xcconfig ABSENT locally — GitHub Actions writes it from APPLE_TEAM_ID");
}

if (!exists(".github/workflows/ios-testflight.yml")) errors.push("missing TestFlight workflow");
if (!exists("iosApp/TESTFLIGHT.md")) errors.push("missing iosApp/TESTFLIGHT.md");

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
  else warns.push("xcodegen missing on this Mac — brew install xcodegen (CI installs it)");
  const xcode = spawnSync("xcode-select", ["-p"], { encoding: "utf8" });
  if (xcode.status === 0) ok.push(`xcode-select ${xcode.stdout.trim()}`);
  else warns.push("xcode-select missing on this Mac — cloud CI still works");
} else {
  ok.push("Host is Windows/Linux — USB Xcode install BLOCKED; TestFlight cloud path is the supported route");
}

console.log("FitConnect iOS device / TestFlight check");
console.log(`host: ${process.platform}`);
for (const line of ok) console.log(`OK    ${line}`);
for (const line of warns) console.log(`WARN  ${line}`);
for (const line of errors) console.log(`FAIL  ${line}`);

if (!darwin) {
  console.log("\nNEXT (no Mac required):");
  console.log("  Follow iosApp/TESTFLIGHT.md click-by-click");
  console.log("  Add the five GitHub Actions secrets");
  console.log("  GitHub → Actions → iOS TestFlight → Run workflow");
  console.log("  iPhone 14 Pro → TestFlight → Install FitConnect");
}

if (errors.length) process.exit(1);
console.log("\nSTATIC READY — TestFlight upload still needs Apple program + GitHub Secrets.");
