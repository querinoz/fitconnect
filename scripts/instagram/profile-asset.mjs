#!/usr/bin/env node
/** Export 320×320 profile picture from official logo */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LOGO = path.join(ROOT, "apps/web/public/brand/fitconnect-logo-1024.png");
const OUT = path.join(ROOT, "content/instagram/profile");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const size = 320;
  const pad = 28;
  const logoSize = size - pad * 2;

  const logo = await sharp(LOGO).resize(logoSize, logoSize, { fit: "contain" }).png().toBuffer();
  const bg = await sharp({
    create: { width: size, height: size, channels: 4, background: "#070B14" }
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(path.join(OUT, "fitconnect-profile-320.png"));

  await sharp(path.join(OUT, "fitconnect-profile-320.png"))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(OUT, "fitconnect-profile-1024.png"));

  console.log("PROFILE_ASSET_OK", bg);
  console.log("Manual: Instagram app → Editar perfil → Alterar foto →", path.join(OUT, "fitconnect-profile-320.png"));
}

main();
