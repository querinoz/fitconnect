#!/usr/bin/env node
/**
 * v2 Reels — 3-act motion (impact / proof / resolve) + immersive audio.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const V2 = path.join(ROOT, "content/instagram/v2");
const ASSETS = path.join(V2, "assets");
const GEN = path.join(V2, "generated");
const AUDIO = path.join(V2, "audio");

const REELS = [
  { id: "v2_01_hook", cover: "v2_01_hook_cover.png", audio: "track_energy.mp3", hook: "TREINAS. REGISTAS. RECOMEÇAS." },
  { id: "v2_04_app", cover: "v2_04_app_cover.png", audio: "track_pulse.mp3", hook: "O TEU TREINO. UM SISTEMA." },
  { id: "v2_06_wear", cover: "v2_06_wear_cover.png", audio: "track_drive.mp3", hook: "PULSO. TELEMÓVEL. SINCRONIZADO." },
  { id: "v2_09_cta", cover: "v2_09_cta_cover.png", audio: "track_anthem.mp3", hook: "LISTA DE ESPERA — BIO" }
];

function run(args) {
  const r = spawnSync(ffmpegPath, args, { stdio: "pipe" });
  if (r.status !== 0) throw new Error(r.stderr?.toString().slice(-500));
}

function segment(input, out, vf, seconds = 4) {
  run([
    "-y", "-loop", "1", "-i", input,
    "-vf", `${vf},format=yuv420p`,
    "-t", String(seconds),
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-an", out
  ]);
}

async function ensureAudio() {
  fs.mkdirSync(AUDIO, { recursive: true });
  const tracks = {
    "track_energy.mp3": "https://assets.mixkit.co/music/preview/mixkit-sport-drums-beat-1450.mp3",
    "track_pulse.mp3": "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
    "track_drive.mp3": "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
    "track_anthem.mp3": "https://assets.mixkit.co/music/preview/mixkit-gym-beats-137.mp3"
  };
  for (const [name, url] of Object.entries(tracks)) {
    const dest = path.join(AUDIO, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) continue;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`audio fetch ${name}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log("audio", name);
  }
}

function buildReel(spec) {
  const input = path.join(ASSETS, spec.cover);
  const out = path.join(GEN, `${spec.id}.mp4`);
  const audio = path.join(AUDIO, spec.audio);
  if (!fs.existsSync(input)) {
    console.warn("skip", spec.id, "missing cover");
    return;
  }
  fs.mkdirSync(GEN, { recursive: true });
  const tmp = path.join(GEN, `_tmp_${spec.id}`);
  fs.mkdirSync(tmp, { recursive: true });
  const s1 = path.join(tmp, "s1.mp4");
  const s2 = path.join(tmp, "s2.mp4");
  const s3 = path.join(tmp, "s3.mp4");
  const concat = path.join(tmp, "concat.mp4");

  // Act 1: punch zoom in
  segment(input, s1, "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.002,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1080x1920:fps=30");
  // Act 2: pan right
  segment(input, s2, "scale=1200:2133,crop=1080:1920,zoompan=z='1.05':x='(iw-ow)*on/120':y='(ih-oh)/2':d=120:s=1080x1920:fps=30");
  // Act 3: slow pull + fade feel via zoom out
  segment(input, s3, "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='if(lte(zoom,1.0),1.12,max(1.0,zoom-0.001))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1080x1920:fps=30");

  const list = path.join(tmp, "list.txt");
  fs.writeFileSync(list, [s1, s2, s3].map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"));
  run(["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", concat]);

  const withAudio = path.join(tmp, "final.mp4");
  if (fs.existsSync(audio)) {
    run([
      "-y", "-i", concat, "-i", audio,
      "-filter_complex", "[1:a]afade=t=in:st=0:d=0.4,afade=t=out:st=11:d=0.8,volume=0.55[a]",
      "-map", "0:v", "-map", "[a]",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
      "-movflags", "+faststart", withAudio
    ]);
  } else {
    run(["-y", "-i", concat, "-c", "copy", "-movflags", "+faststart", withAudio]);
  }

  if (fs.existsSync(out)) fs.unlinkSync(out);
  fs.renameSync(withAudio, out);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("reel", spec.id);
}

async function main() {
  await ensureAudio();
  for (const spec of REELS) buildReel(spec);
  console.log("REELS_V2_DONE");
}

main().catch((e) => { console.error(e); process.exit(1); });
