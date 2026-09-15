import assert from "node:assert/strict";
import test from "node:test";
import { assertXcode26Ready, parseSdkMajors, parseXcodeVersion } from "./ios-require-xcode26.mjs";

test("parses Xcode 26.6", () => {
  const v = parseXcodeVersion("Xcode 26.6\nBuild version 17F113\n");
  assert.equal(v.major, 26);
  assert.equal(v.minor, 6);
});

test("rejects Xcode 16.4 (macos-15 default)", () => {
  const gate = assertXcode26Ready(
    "Xcode 16.4\nBuild version 16F6\n",
    "iOS SDKs:\n\tiOS 18.5\t-sdk iphoneos18.5\nwatchOS SDKs:\n\twatchOS 11.5\t-sdk watchos11.5\n"
  );
  assert.equal(gate.ok, false);
  assert.ok(gate.errors.some((e) => /Xcode 16/.test(e)));
});

test("accepts Xcode 26.6 with iOS 26 and watchOS 26 SDKs", () => {
  const sdks = [
    "iOS SDKs:",
    "	iOS 26.6                      	-sdk iphoneos26.6",
    "	iOS 26.6 Simulator            	-sdk iphonesimulator26.6",
    "watchOS SDKs:",
    "	watchOS 26.6                  	-sdk watchos26.6",
    "	watchOS 26.6 Simulator        	-sdk watchsimulator26.6"
  ].join("\n");
  const gate = assertXcode26Ready("Xcode 26.6\nBuild version 17F113\n", sdks);
  assert.equal(gate.ok, true);
  assert.equal(gate.sdks.iosMax, 26);
  assert.equal(gate.sdks.watchMax, 26);
});

test("rejects Xcode 26 if only an old iOS SDK is listed", () => {
  const gate = assertXcode26Ready(
    "Xcode 26.0.1\n",
    "iOS SDKs:\n\tiOS 18.4\t-sdk iphoneos18.4\nwatchOS SDKs:\n\twatchOS 26.0\t-sdk watchos26.0\n"
  );
  assert.equal(gate.ok, false);
  assert.ok(gate.errors.some((e) => /iphoneos/.test(e)));
});

test("parseSdkMajors ignores simulator-only lines for the device SDK names we scan", () => {
  const parsed = parseSdkMajors("-sdk iphoneos26.5\n-sdk iphonesimulator26.5\n-sdk watchos26.5\n");
  assert.equal(parsed.iosMax, 26);
  assert.equal(parsed.watchMax, 26);
});
