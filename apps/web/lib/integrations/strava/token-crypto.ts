import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getKey(): Buffer | null {
  const secret = process.env.STRAVA_TOKEN_ENCRYPTION_KEY?.trim();
  if (!secret) return null;
  return scryptSync(secret, "fitconnect-strava", 32);
}

/** Encrypt token at rest when STRAVA_TOKEN_ENCRYPTION_KEY is set. */
export function encryptToken(plain: string): string {
  const key = getKey();
  if (!key) return plain;

  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptToken(stored: string): string {
  if (!stored.startsWith("enc:")) return stored;
  const key = getKey();
  if (!key) return stored;

  const [, ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || !dataHex) return stored;

  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final()
  ]);
  return dec.toString("utf8");
}
