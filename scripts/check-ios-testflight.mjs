#!/usr/bin/env node
/**
 * Static TestFlight pipeline gate. Never prints secret values.
 * Does not upload; does not require macOS.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

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

function mustContain(rel, needle) {
  const src = read(rel);
  if (src && !src.includes(needle)) errors.push(`${rel}: missing ${needle}`);
}

function mustNotContain(rel, needle) {
  const src = read(rel);
  if (src && src.includes(needle)) errors.push(`${rel}: must not contain ${needle}`);
}

for (const rel of [
  "iosApp/AppStore/ExportOptions.plist",
  "iosApp/AppStore/AppStoreMetadata.json",
  "iosApp/FitConnect/FitConnectRelease.entitlements",
  "iosApp/ci_scripts/ci_post_clone.sh",
  "iosApp/ci_scripts/ci_pre_xcodebuild.sh",
  "scripts/ios-inject-ci-secrets.py",
  "scripts/ios-testflight-archive.sh",
  ".github/workflows/ios-testflight.yml",
  "iosApp/TESTFLIGHT.md",
  "iosApp/FitConnect/Assets.xcassets/AppIcon.appiconset/AppIcon.png",
  "iosApp/FitConnectWatch/Assets.xcassets/AppIcon.appiconset/AppIcon.png",
]) {
  if (!exists(rel)) errors.push(`missing ${rel}`);
}

const icon = path.join(root, "iosApp/FitConnect/Assets.xcassets/AppIcon.appiconset/AppIcon.png");
if (fs.existsSync(icon)) {
  const buf = fs.readFileSync(icon);
  if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    errors.push("AppIcon.png is not a PNG");
  }
  if (buf.length < 10000) errors.push("AppIcon.png is too small for App Store 1024");
}

mustContain("iosApp/FitConnect/FitConnectRelease.entitlements", "<string>production</string>");
mustContain("iosApp/FitConnect/FitConnectRelease.entitlements", "com.apple.developer.healthkit");
mustContain("iosApp/FitConnect/FitConnectRelease.entitlements", "com.apple.developer.applesignin");
mustContain("iosApp/FitConnect/FitConnect.entitlements", "<string>development</string>");
mustContain("iosApp/project.yml", "FitConnectRelease.entitlements");
mustContain("iosApp/project.yml", "ASSETCATALOG_COMPILER_APPICON_NAME: AppIcon");
mustContain("iosApp/project.yml", "INFOPLIST_KEY_ITSAppUsesNonExemptEncryption: NO");
mustContain("iosApp/project.yml", "archive:");
mustContain("iosApp/AppStore/ExportOptions.plist", "app-store-connect");
mustContain("iosApp/AppStore/ExportOptions.plist", "APPLE_TEAM_ID");
mustContain("iosApp/AppStore/AppStoreMetadata.json", "com.fitconnect.ios");
mustContain(".github/workflows/ios-testflight.yml", "macos-15");
mustContain(".github/workflows/ios-testflight.yml", "ios-testflight-archive.sh");
mustContain("iosApp/ci_scripts/ci_post_clone.sh", "xcodegen generate");
mustContain(".gitignore", "AuthKey_*.p8");
mustContain(".gitignore", "GoogleService-Info.plist");
mustNotContain("iosApp/AppStore/ExportOptions.plist", "-----BEGIN PRIVATE KEY-----");
mustNotContain(".github/workflows/ios-testflight.yml", "-----BEGIN PRIVATE KEY-----");

const trackedPlist = spawnSync("git", ["ls-files", "--error-unmatch", "iosApp/GoogleService-Info.plist"], {
  cwd: root,
  encoding: "utf8",
});
if (trackedPlist.status === 0) {
  errors.push("iosApp/GoogleService-Info.plist must stay gitignored — CI injects it from IOS_GOOGLE_SERVICE_INFO_PLIST");
}
if (exists("iosApp/Config/Local.xcconfig")) {
  const local = fs.readFileSync(path.join(root, "iosApp/Config/Local.xcconfig"), "utf8");
  if (local.includes("BEGIN PRIVATE KEY")) errors.push("Local.xcconfig must not contain API keys");
}

function runPython(scriptRel, extraEnv) {
  const env = {
    ...process.env,
    FITCONNECT_REQUIRE_UPLOAD_SECRETS: "1",
    APPLE_TEAM_ID: "",
    APP_STORE_CONNECT_API_KEY_ID: "",
    APP_STORE_CONNECT_ISSUER_ID: "",
    APP_STORE_CONNECT_API_KEY_P8: "",
    IOS_GOOGLE_SERVICE_INFO_PLIST: "",
    ...extraEnv,
  };
  const attempts = process.platform === "win32"
    ? [
        ["python", [scriptRel]],
        ["py", ["-3", scriptRel]],
      ]
    : [
        ["python3", [scriptRel]],
        ["python", [scriptRel]],
      ];
  for (const [cmd, args] of attempts) {
    const res = spawnSync(cmd, args, { cwd: root, encoding: "utf8", env });
    if (res.error && res.error.code === "ENOENT") continue;
    return res;
  }
  return { status: 127, stdout: "", stderr: "python not found" };
}

const failClosed = runPython("scripts/ios-inject-ci-secrets.py", {});
if (failClosed.status === 127) {
  errors.push("python3/python required to verify ios-inject-ci-secrets.py fail-closed");
} else if (failClosed.status === 0) {
  errors.push("ios-inject-ci-secrets.py must fail closed when upload secrets are missing");
} else if (!String(failClosed.stdout || failClosed.stderr).includes("APPLE_TEAM_ID")) {
  errors.push("ios-inject-ci-secrets.py must name missing APPLE_TEAM_ID without printing values");
}

if (errors.length) {
  console.error("iOS TestFlight check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("iOS TestFlight pipeline static OK — upload still needs GitHub Secrets + Apple account.");
