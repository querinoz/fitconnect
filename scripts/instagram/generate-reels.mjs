#!/usr/bin/env node
/**
 * Generate motion reels from branded PNG covers (Ken Burns + AAC audio).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CONTENT = path.join(ROOT, "content/instagram");
const FORCE = process.argv.includes("--force");

const REEL_SPECS = {
  reel01_hexatar: { image: "post01_capa_reel.png", seconds: 8 },
  reel04_hexatar_design: { image: "post04_capa_reel.png", seconds: 8 },
  reel06_desafio7: { image: "post06_capa_reel.png", seconds: 8 },
  reel10_prontidao: { image: "post10_capa_reel.png", seconds: 8 },
  reel13_wearos: { image: "post13_capa_reel.png", seconds: 8 },
  reel16_public: { image: "post16_capa_reel.png", seconds: 8 }
};

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "pipe", shell: false });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed: ${result.stderr?.toString().slice(-400)}`);
  }
}

function ensureAudio(file) {
  const probe = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" });
  if (/Audio:/.test(probe.stderr)) return;
  const tmp = `${file}.tmp.mp4`;
  runFfmpeg([
    "-y", "-i", file,
    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest",
    "-movflags", "+faststart", tmp
  ]);
  fs.renameSync(tmp, file);
}

function makeReel(name, imageFile, seconds) {
  const input = path.join(CONTENT, "assets", imageFile);
  const outDir = path.join(CONTENT, "generated");
  const output = path.join(outDir, `${name}.mp4`);
  const publicOut = path.join(ROOT, "apps/web/public/instagram/generated", `${name}.mp4`);

  if (!fs.existsSync(input)) {
    console.warn(`skip ${name}: missing ${imageFile}`);
    return false;
  }
  if (fs.existsSync(output) && !FORCE) {
    ensureAudio(output);
    fs.copyFileSync(output, publicOut);
    console.log(`exists ${name}.mp4`);
    return true;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(publicOut), { recursive: true });
  const tmp = path.join(outDir, `${name}.work.mp4`);
  const vf = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0004,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${seconds * 30}:s=1080x1920:fps=30`;
  runFfmpeg([
    "-y", "-loop", "1", "-i", input,
    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-vf", vf, "-t", String(seconds),
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-shortest",
    "-movflags", "+faststart", tmp
  ]);
  if (fs.existsSync(output)) fs.unlinkSync(output);
  fs.renameSync(tmp, output);
  console.log(`generated ${name}.mp4 (${seconds}s)`);
  return true;
}

function main() {
  if (!ffmpegPath) {
    console.error("ffmpeg-static not found");
    process.exit(1);
  }
  let made = 0;
  for (const [name, spec] of Object.entries(REEL_SPECS)) {
    if (makeReel(name, spec.image, spec.seconds)) made++;
  }
  console.log(`INSTAGRAM_REELS_OK (${made} videos)`);
}

main();
