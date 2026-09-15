#!/usr/bin/env node
/**
 * Fail closed unless this Mac is Xcode 26+ with iOS 26 and watchOS 26 SDKs.
 * App Store Connect rejected older toolchains on 28 Apr 2026:
 * https://developer.apple.com/news/upcoming-requirements/
 *
 * Never prints secrets. Safe to run on Windows (exit 2 = BLOCKED, not a silent pass).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function parseXcodeVersion(text) {
  const m = String(text || "").match(/Xcode\s+(\d+)(?:\.(\d+))?(?:\.(\d+))?/i);
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2] || 0),
    patch: Number(m[3] || 0),
    label: m[0].replace(/\s+/g, " ")
  };
}

export function parseSdkMajors(sdksText) {
  const text = String(sdksText || "");
  const ios = [];
  const watch = [];
  for (const m of text.matchAll(/-sdk\s+iphoneos(\d+)(?:\.\d+)*/gi)) {
    ios.push(Number(m[1]));
  }
  for (const m of text.matchAll(/-sdk\s+watchos(\d+)(?:\.\d+)*/gi)) {
    watch.push(Number(m[1]));
  }
  return {
    iosMax: ios.length ? Math.max(...ios) : 0,
    watchMax: watch.length ? Math.max(...watch) : 0
  };
}

export function assertXcode26Ready(versionText, sdksText) {
  const errors = [];
  const version = parseXcodeVersion(versionText);
  if (!version) {
    errors.push("could not parse `xcodebuild -version` (Xcode N.N expected)");
  } else if (version.major < 26) {
    errors.push(
      `Xcode ${version.major}.${version.minor} is too old. App Store Connect requires Xcode 26+ and the iOS 26 SDK (since 28 Apr 2026).`
    );
  }
  const sdks = parseSdkMajors(sdksText);
  if (sdks.iosMax < 26) {
    errors.push(
      `iOS SDK iphoneos${sdks.iosMax || "?"} is too old. Need iphoneos26 or later.`
    );
  }
  if (sdks.watchMax < 26) {
    errors.push(
      `watchOS SDK watchos${sdks.watchMax || "?"} is too old. Need watchos26 or later (Watch companion is embedded).`
    );
  }
  return { ok: errors.length === 0, errors, version, sdks };
}

function run(cmd, args) {
  return spawnSync(cmd, args, { encoding: "utf8" });
}

export function inspectLocalXcode() {
  if (process.platform !== "darwin") {
    return { blocked: true, reason: "not Darwin — cannot verify Xcode/SDK on this host" };
  }
  const ver = run("xcodebuild", ["-version"]);
  if (ver.status !== 0) {
    return { blocked: true, reason: "xcodebuild -version failed", detail: (ver.stderr || ver.stdout || "").slice(0, 400) };
  }
  const sdks = run("xcodebuild", ["-showsdks"]);
  if (sdks.status !== 0) {
    return { blocked: true, reason: "xcodebuild -showsdks failed", detail: (sdks.stderr || sdks.stdout || "").slice(0, 400) };
  }
  const gate = assertXcode26Ready(ver.stdout, sdks.stdout);
  return { blocked: false, versionText: ver.stdout.trim(), sdksText: sdks.stdout, gate };
}

function main() {
  const result = inspectLocalXcode();
  if (result.blocked) {
    console.log(`BLOCKED: ${result.reason}`);
    if (result.detail) console.log(result.detail);
    process.exit(2);
  }
  const { gate, versionText } = result;
  console.log(versionText.split("\n")[0]);
  console.log(`iOS SDK max: iphoneos${gate.sdks.iosMax}`);
  console.log(`watchOS SDK max: watchos${gate.sdks.watchMax}`);
  if (!gate.ok) {
    for (const err of gate.errors) console.error(`FAIL: ${err}`);
    process.exit(1);
  }
  console.log("XCODE 26 + iOS 26 + watchOS 26 SDK OK");
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) main();
