#!/usr/bin/env node
/**
 * Copy Instagram kit PNGs from Cursor assets cache into content/instagram/assets/.
 * Matches filenames like *post01_capa_reel*.png → post01_capa_reel.png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "content/instagram/assets");
const CURSOR_ASSETS = path.join(
  process.env.USERPROFILE ?? process.env.HOME ?? "",
  ".cursor/projects/d-fitconnect/assets"
);

function extractCanonicalName(filename) {
  const match = filename.match(/images_(post\d+[^-]+)/i);
  if (!match) return null;
  return `${match[1]}.png`;
}

function main() {
  if (!fs.existsSync(CURSOR_ASSETS)) {
    console.error("CURSOR_ASSETS_NOT_FOUND", CURSOR_ASSETS);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const PUBLIC_OUT = path.join(ROOT, "apps/web/public/instagram/assets");
  fs.mkdirSync(PUBLIC_OUT, { recursive: true });
  let copied = 0;
  for (const entry of fs.readdirSync(CURSOR_ASSETS)) {
    if (!entry.toLowerCase().includes("post") || !entry.endsWith(".png")) continue;
    const canonical = extractCanonicalName(entry);
    if (!canonical) continue;
    const src = path.join(CURSOR_ASSETS, entry);
    const dest = path.join(OUT, canonical);
    fs.copyFileSync(src, dest);
    fs.copyFileSync(src, path.join(PUBLIC_OUT, canonical));
    copied++;
    console.log(`copy ${canonical}`);
  }
  const reelSrc = path.join(ROOT, "reel01_hexatar.mp4");
  const reelDest = path.join(ROOT, "content/instagram/generated/reel01_hexatar.mp4");
  const publicGen = path.join(ROOT, "apps/web/public/instagram/generated");
  if (fs.existsSync(reelSrc)) {
    fs.mkdirSync(path.dirname(reelDest), { recursive: true });
    fs.mkdirSync(publicGen, { recursive: true });
    fs.copyFileSync(reelSrc, reelDest);
    fs.copyFileSync(reelSrc, path.join(publicGen, "reel01_hexatar.mp4"));
    console.log("copy reel01_hexatar.mp4");
  }
  console.log(`INSTAGRAM_ASSETS_SYNC_OK (${copied} images)`);
}

main();
