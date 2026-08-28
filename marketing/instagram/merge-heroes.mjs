#!/usr/bin/env node
/** Composite AI lifestyle heroes with official logo watermark */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { brandOverlay, writePng, ROOT } from "./lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURSOR_ASSETS = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor/projects/d-fitconnect/assets"
);

const HERO_MAP = [
  ["post01_capa_reel.png", "post01_athlete_hero.png", "reel"],
  ["post08_treinador_adivinha.png", "post08_coach_hero.png", "feed"],
  ["post11_consistencia.png", "post11_consistency_hero.png", "feed"],
  ["post17_manifesto.png", "post17_manifesto_hero.png", "feed"]
];

async function main() {
  for (const [dest, src, format] of HERO_MAP) {
    const heroPath = path.join(CURSOR_ASSETS, src);
    if (!fs.existsSync(heroPath)) {
      console.warn("skip hero", src);
      continue;
    }
    const buf = await brandOverlay(fs.readFileSync(heroPath), { format });
    await writePng(path.join(ROOT, "content/instagram/assets", dest), buf);
    console.log("hero →", dest);
  }
}

main();
