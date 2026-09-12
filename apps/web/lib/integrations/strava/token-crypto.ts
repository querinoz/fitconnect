import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { isProductionSecurityMode } from "@/lib/security/runtime";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;

/**
 * Raised instead of silently falling back to plaintext.
 *
 * The previous behaviour was fail-open: with STRAVA_TOKEN_ENCRYPTION_KEY unset,
 * encryptToken() returned its input unchanged and the caller wrote a live Strava
 * access/refresh token to public."StravaConnection" in the clear, with nothing in
 * the logs to say so. .env.example ships that variable empty, so an environment
 * that never ran `pnpm env:setup-prod` hit that path by default. AGENTS.md 3
 * requires tokens to be encrypted at rest, so in production security mode a
 * missing key is now an error rather than a downgrade.
 *
 * Outside production security mode (dev, demo, tests) the passthrough is kept —
 * those environments hold no real tokens.
 */
export class StravaTokenEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StravaTokenEncryptionError";
  }
}

function getKey(): Buffer | null {
  const secret = process.env.STRAVA_TOKEN_ENCRYPTION_KEY?.trim();
  if (!secret) return null;
  return scryptSync(secret, "fitconnect-strava", 32);
}

/** True when tokens can actually be encrypted at rest. */
export function isTokenEncryptionConfigured(): boolean {
  return Boolean(process.env.STRAVA_TOKEN_ENCRYPTION_KEY?.trim());
}

/** Encrypt token at rest. Throws in production security mode when unconfigured. */
export function encryptToken(plain: string): string {
  const key = getKey();
  if (!key) {
    if (isProductionSecurityMode()) {
      throw new StravaTokenEncryptionError(
        "STRAVA_TOKEN_ENCRYPTION_KEY is not set; refusing to store a Strava token in plaintext"
      );
    }
    return plain;
  }

  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptToken(stored: string): string {
  if (!stored.startsWith("enc:")) return stored;
  const key = getKey();
  if (!key) {
    if (isProductionSecurityMode()) {
      // Returning the ciphertext would send `enc:...` upstream as a bearer token
      // and surface as a confusing 401 instead of a configuration error.
      throw new StravaTokenEncryptionError(
        "STRAVA_TOKEN_ENCRYPTION_KEY is not set; stored Strava token cannot be decrypted"
      );
    }
    return stored;
  }

  const [, ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || !dataHex || tagHex.length !== AUTH_TAG_LEN * 2) return stored;

  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"), {
    authTagLength: AUTH_TAG_LEN
  });
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final()
  ]);
  return dec.toString("utf8");
}
