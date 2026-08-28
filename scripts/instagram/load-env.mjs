import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function loadEnvFiles() {
  for (const rel of [".env.local", "apps/web/.env.local"]) {
    const envPath = path.join(ROOT, rel);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

export function mediaBaseUrl() {
  return (
    process.env.INSTAGRAM_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, "") ??
    "https://fitconnect-phi.vercel.app/instagram/assets"
  );
}

export function videoBaseUrl() {
  return (
    process.env.INSTAGRAM_PUBLIC_VIDEO_BASE_URL?.replace(/\/$/, "") ??
    mediaBaseUrl().replace(/\/assets$/, "/generated")
  );
}
