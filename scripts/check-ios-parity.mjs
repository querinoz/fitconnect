#!/usr/bin/env node
/**
 * Windows-safe iOS first-class parity gate. Does not run xcodebuild.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    errors.push(`missing ${rel}`);
    return "";
  }
  return fs.readFileSync(p, "utf8");
}

function mustContain(rel, needle, label = needle) {
  const src = read(rel);
  if (src && !src.includes(needle)) errors.push(`${rel}: missing ${label}`);
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

function mustNotContain(rel, needle, label = needle) {
  const p = path.join(root, rel);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    for (const file of walkSwift(p)) {
      const src = fs.readFileSync(file, "utf8");
      if (src.includes(needle)) errors.push(`${path.relative(root, file)}: forbidden ${label}`);
    }
    return;
  }
  const src = read(rel);
  if (src.includes(needle)) errors.push(`${rel}: forbidden ${label}`);
}

const combat = read("iosApp/FitConnect/Train/CombatContract.swift");
const disciplines = [
  "boxing", "muay_thai", "kickboxing", "mma", "bjj", "judo", "karate", "taekwondo",
  "wrestling", "sambo", "sanda", "wushu", "savate", "capoeira", "silat", "pencak_silat",
  "lethwei", "hapkido", "aikido", "kung_fu", "taijiquan", "kendo", "iaido", "taekkyeon",
  "kun_lbokator", "chidaoba", "kalaripayattu", "krav_maga", "wing_chun", "jeet_kune_do", "sumo",
  "catch_wrestling", "luta_livre"
];
for (const id of disciplines) {
  if (!combat.includes(`"${id}"`)) errors.push(`CombatContract missing discipline ${id}`);
}

const yml = read("iosApp/project.yml");
const nameHits = yml.match(/^name:\s*FitConnect\s*$/m) ? yml.split(/^name:\s*FitConnect\s*$/m).length - 1 : 0;
if (nameHits !== 1) errors.push(`project.yml must be a single XcodeGen document (name: FitConnect count=${nameHits})`);
if (!yml.includes("FitConnectWatch")) errors.push("project.yml missing FitConnectWatch");
if (!yml.includes("FitConnectTests")) errors.push("project.yml missing FitConnectTests");
if (!yml.includes("NSHealthShareUsageDescription")) errors.push("project.yml missing HealthKit usage description");

mustContain("iosApp/FitConnect/Navigation/AthleteShell.swift", "case feed");
mustContain("iosApp/FitConnect/Navigation/AthleteShell.swift", "case ascend");
mustContain("iosApp/FitConnect/Navigation/AthleteShell.swift", "case train");
mustContain("iosApp/FitConnect/Navigation/AthleteShell.swift", "case dashboard");
mustContain("iosApp/FitConnect/Navigation/AthleteShell.swift", "case profile");
mustContain("iosApp/FitConnect/SharedAdapters/AuthContract.swift", "ONE LOGIN");
mustContain("iosApp/FitConnect/Train/TrainStateMachine.swift", "case rest");
mustContain("iosApp/FitConnect/Train/TrainStateMachine.swift", "case paused");
mustContain("iosApp/FitConnect/Train/CombatContract.swift", "forceFromWatchImuIsInvalid");
mustContain("iosApp/FitConnect/Health/SensorHonesty.swift", "watchImuCanMeasureForce");
mustContain("iosApp/FitConnect/FitConnect.entitlements", "com.apple.developer.healthkit");
mustContain("iosApp/FitConnectWatch/FitConnectWatch.entitlements", "com.apple.developer.healthkit");
mustContain("iosApp/FitConnectWatch/FitConnectWatchApp.swift", "LiveWorkoutController");
mustContain("iosApp/FitConnect/Health/LiveWorkoutSession.swift", "HKLiveWorkoutBuilder");
mustContain("iosApp/FitConnect/Health/CoreMotionSession.swift", "CMDeviceMotion");
mustContain("iosApp/FitConnect/Auth/FirebaseBootstrap.swift", "FirebaseApp.configure");
mustContain("iosApp/FitConnect/Auth/FirebaseBootstrap.swift", "rawNonce");
mustContain("iosApp/GoogleService-Info.plist.example", "REPLACE_ME");
mustContain(".github/workflows/ios.yml", "macos-15");

mustNotContain("iosApp/FitConnect/Athlete/TelemetryView.swift", "164 bpm", "fabricated HR");
mustNotContain("iosApp/FitConnect", "DemoSessionStore", "legacy two-role store");
mustNotContain("iosApp/FitConnect/Auth/AuthView.swift", "Continue as Athlete", "two-role login");
mustNotContain("iosApp/FitConnect", "Path A", "Path A demo shell");
mustNotContain("iosApp/FitConnect/SharedAdapters/DemoCatalog.swift", "82%", "fabricated readiness");
mustNotContain("iosApp/FitConnect/SharedAdapters/DemoCatalog.swift", "EUR 8.2k", "fabricated revenue");

if (!fs.existsSync(path.join(root, "iosApp/FitConnectTests/FitConnectDomainTests.swift"))) {
  errors.push("missing iOS unit tests");
}

if (errors.length) {
  console.error("iOS parity check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log("iOS first-class parity OK");
