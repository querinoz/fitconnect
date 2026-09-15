import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync } from "node:crypto";
import { nextBuildNumber, secretPresence, signAscJwt } from "./asc-testflight.mjs";
import { isAllowedTestFlightUrl, parseAllowedTestFlightUrl } from "./lib/testflight-join-url.mjs";

test("secretPresence is boolean-only and never echoes values", () => {
  const out = secretPresence({
    APPLE_TEAM_ID: "SECRETTEAM",
    APP_STORE_CONNECT_API_KEY_ID: "",
    APP_STORE_CONNECT_ISSUER_ID: "  ",
    APP_STORE_CONNECT_API_KEY_P8: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----",
    IOS_GOOGLE_SERVICE_INFO_PLIST: "<plist></plist>"
  });
  assert.equal(out.APPLE_TEAM_ID, true);
  assert.equal(out.APP_STORE_CONNECT_API_KEY_ID, false);
  assert.equal(out.APP_STORE_CONNECT_ISSUER_ID, false);
  assert.equal(out.APP_STORE_CONNECT_API_KEY_P8, true);
  assert.equal(JSON.stringify(out).includes("SECRETTEAM"), false);
  assert.equal(JSON.stringify(out).includes("BEGIN PRIVATE KEY"), false);
});

test("nextBuildNumber uses the greater of ASC max+1 and CI floor", () => {
  assert.equal(nextBuildNumber([], 1), 1);
  assert.equal(nextBuildNumber(["3", "12", "9"], 4), 13);
  assert.equal(nextBuildNumber(["2"], 40), 40);
  assert.equal(nextBuildNumber(["not-a-number"], 7), 7);
});

test("signAscJwt is ES256 and does not embed the PEM", () => {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const jwt = signAscJwt({
    keyId: "KEYID123",
    issuerId: "00000000-0000-4000-8000-000000000000",
    privateKeyPem: pem,
    nowSec: 1_700_000_000
  });
  const [headerB64, payloadB64, sig] = jwt.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  assert.equal(header.alg, "ES256");
  assert.equal(header.kid, "KEYID123");
  assert.equal(payload.aud, "appstoreconnect-v1");
  assert.equal(payload.exp - payload.iat, 20 * 60);
  assert.ok(sig.length > 20);
  assert.equal(jwt.includes("BEGIN PRIVATE KEY"), false);
});

test("public join URL allowlist matches the /ios hub rules", () => {
  assert.equal(parseAllowedTestFlightUrl("https://testflight.apple.com/join/Ab12Cd34"), "https://testflight.apple.com/join/Ab12Cd34");
  assert.equal(isAllowedTestFlightUrl("http://testflight.apple.com/join/Ab12Cd34"), false);
  assert.equal(isAllowedTestFlightUrl("https://testflight.apple.com/join/Ab12Cd34?x=1"), false);
  assert.equal(isAllowedTestFlightUrl("https://evil.example/join/Ab12Cd34"), false);
  assert.equal(isAllowedTestFlightUrl("https://testflight.apple.com/join/../join/Ab12Cd34"), false);
  assert.equal(isAllowedTestFlightUrl(""), false);
});
