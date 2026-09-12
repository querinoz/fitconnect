import { afterEach, describe, expect, it, vi } from "vitest";
import {
  StravaTokenEncryptionError,
  decryptToken,
  encryptToken,
  isTokenEncryptionConfigured
} from "./token-crypto";

const KEY = "test-encryption-key-not-a-real-secret";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isTokenEncryptionConfigured", () => {
  it("is false when the key is absent or blank", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", "");
    expect(isTokenEncryptionConfigured()).toBe(false);

    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", "   ");
    expect(isTokenEncryptionConfigured()).toBe(false);
  });

  it("is true when the key is set", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", KEY);
    expect(isTokenEncryptionConfigured()).toBe(true);
  });
});

describe("encryptToken", () => {
  it("round-trips when the key is configured", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", KEY);
    const sealed = encryptToken("strava-access-token-value");
    expect(sealed.startsWith("enc:")).toBe(true);
    expect(sealed).not.toContain("strava-access-token-value");
    expect(decryptToken(sealed)).toBe("strava-access-token-value");
  });

  it("keeps the dev/demo passthrough when not in production security mode", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(encryptToken("plain")).toBe("plain");
  });

  it("keeps the passthrough in demo mode even when NODE_ENV is production", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(encryptToken("plain")).toBe("plain");
  });

  // Regression: the previous implementation returned the plaintext unchanged, so a
  // production deploy without STRAVA_TOKEN_ENCRYPTION_KEY wrote live Strava tokens
  // to public."StravaConnection" in the clear with nothing in the logs.
  it("refuses to downgrade to plaintext in production security mode", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    expect(() => encryptToken("strava-access-token-value")).toThrow(StravaTokenEncryptionError);
  });
});

describe("decryptToken", () => {
  it("returns non-encrypted values unchanged", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", KEY);
    expect(decryptToken("legacy-plaintext")).toBe("legacy-plaintext");
  });

  it("throws rather than returning ciphertext in production security mode", () => {
    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", KEY);
    const sealed = encryptToken("strava-access-token-value");

    vi.stubEnv("STRAVA_TOKEN_ENCRYPTION_KEY", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    expect(() => decryptToken(sealed)).toThrow(StravaTokenEncryptionError);
  });
});
