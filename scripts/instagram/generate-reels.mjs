#!/usr/bin/env node
/**
 * Generate motion reels from static PNG covers using ffmpeg-static.
 * Creates Ken Burns zoom clips for reel posts without a pre-made MP4.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CONTENT = path.join(ROOT, "content/instagram");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(CONTENT, "manifest.json"), "utf8"));

const REEL_SPECS = {
  reel04_hexatar_design: { image: "post04_capa_reel.png", seconds: 25 },
  reel06_desafio7: { image: "post06_capa_reel.png", seconds: 15 },
  reel10_prontidao: { image: "post10_capa_reel.png", seconds: 8 },
  reel13_wearos: { image: "post13_capa_reel.png", seconds: 8 },
  reel16_public: { image: "post16_capa_reel.png", seconds: 8 }
};

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit", shell: false });
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}

function makeReel(name, imageFile, seconds) {
  const input = path.join(CONTENT, "assets", imageFile);
  const outDir = path.join(CONTENT, "generated");
  const output = path.join(outDir, `${name}.mp4`);
  if (!fs.existsSync(input)) {
    console.warn(`skip ${name}: missing ${imageFile}`);
    return false;
  }
  if (fs.existsSync(output)) {
    console.log(`exists ${name}.mp4`);
    return true;
  }
  fs.mkdirSync(outDir, { recursive: true });
  const vf = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0008,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${seconds * 30}:s=1080x1920:fps=30`;
  runFfmpeg([
    "-y",
    "-loop",
    "1",
    "-i",
    input,
    "-vf",
    vf,
    "-t",
    String(seconds),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    output
  ]);
  console.log(`generated ${name}.mp4 (${seconds}s)`);
  const publicGen = path.join(ROOT, "apps/web/public/instagram/generated");
  fs.mkdirSync(publicGen, { recursive: true });
  fs.copyFileSync(output, path.join(publicGen, `${name}.mp4`));
  return true;
}

function main() {
  if (!ffmpegPath) {
    console.error("ffmpeg-static not found — run pnpm install");
    process.exit(1);
  }
  let made = 0;
  for (const [name, spec] of Object.entries(REEL_SPECS)) {
    if (makeReel(name, spec.image, spec.seconds)) made++;
  }
  const reel01 = path.join(CONTENT, "generated/reel01_hexatar.mp4");
  if (!fs.existsSync(reel01) && fs.existsSync(path.join(ROOT, "reel01_hexatar.mp4"))) {
    fs.mkdirSync(path.dirname(reel01), { recursive: true });
    fs.copyFileSync(path.join(ROOT, "reel01_hexatar.mp4"), reel01);
    console.log("copied reel01_hexatar.mp4");
    made++;
  }
  console.log(`INSTAGRAM_REELS_OK (${made} videos ready)`);
}

main();
