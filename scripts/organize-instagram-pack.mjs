#!/usr/bin/env node
/**
 * Organiza todo o pack Instagram em Stories, Posts, Reels e Carousels.
 * Executar: node scripts/organize-instagram-pack.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("/workspace/public/instagram");
const OUT = path.resolve("/workspace/public/instagram-pack");

const DIRS = ["Stories", "Posts", "Reels", "Carousels", "Mockups", "Educational"];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copy(src, dest) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function listPng(dir, pattern = /\.png$/) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => pattern.test(f)).sort();
}

// Clean + create structure
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
for (const d of DIRS) ensureDir(path.join(OUT, d));

const manifest = { Stories: [], Posts: [], Reels: [], Carousels: {}, Mockups: [], Educational: [] };

// ── STORIES (9:16) ──
const storySrc = path.join(SRC, "stories");
for (const f of listPng(storySrc, /^story-.+\.png$/)) {
  const dest = path.join(OUT, "Stories", f);
  copy(path.join(storySrc, f), dest);
  manifest.Stories.push(f);
}

// ── POSTS (single feed 1:1) — curated standalone best shots ──
const postFiles = [
  // Série 1 highlights
  "03-athlete-hrv-track.png", "11-morning-handshake-sunrise.png", "12-celebration-pr-gym.png",
  "15-trail-runner-summit.png", "16-surf-coach-beach.png", "21-recovery-foam-roll.png",
  "32-ai-copilot-review.png",
  // Série 2 diversity highlights
  "v2-diverse/v2-01-black-sprint-coach.png", "v2-diverse/v2-05-afro-capoeira.png",
  "v2-diverse/v2-06-latina-soccer.png", "v2-diverse/v2-07-black-crossfit-pr.png",
  "v2-diverse/v2-12-indigenous-climbing.png", "v2-diverse/v2-18-black-hurdler-sunrise.png",
  "v2-diverse/v2-20-afro-caribbean-beach-volleyball.png", "v2-diverse/v2-22-black-wheelchair-basketball.png",
  "v2-diverse/v2-25-black-triathlete.png", "v2-diverse/v2-30-afro-latina-velodrome.png",
  // Série 3 devices
  "v3-devices/v3-04-black-marathon-wearos-macro.png", "v3-devices/v3-06-afro-caribbean-surf-phone.png",
  "v3-devices/v3-11-indigenous-archery-phone.png", "v3-devices/v3-16-asian-badminton-all-devices.png",
];

let postIdx = 1;
for (const rel of postFiles) {
  const src = path.join(SRC, rel);
  const name = `${String(postIdx).padStart(2, "0")}-${path.basename(rel)}`;
  if (copy(src, path.join(OUT, "Posts", name))) {
    manifest.Posts.push(name);
    postIdx++;
  }
}

// ── REELS (9:16 covers — stories + selected v3 vertical-friendly) ──
const reelSources = [
  ...listPng(path.join(SRC, "stories")).map((f) => ({ src: path.join(SRC, "stories", f), name: f.replace("story-", "reel-") })),
  { src: path.join(SRC, "v3-devices/v3-04-black-marathon-wearos-macro.png"), name: "reel-marathon-wearos.png" },
  { src: path.join(SRC, "v3-devices/v3-08-latina-climbing-wearos-pov.png"), name: "reel-climbing-wearos-pov.png" },
  { src: path.join(SRC, "16-surf-coach-beach.png"), name: "reel-surf-beach-cover.png" },
  { src: path.join(SRC, "v2-diverse/v2-18-black-hurdler-sunrise.png"), name: "reel-hurdler-sunrise-cover.png" },
];

let reelIdx = 1;
for (const { src, name } of reelSources) {
  const destName = `${String(reelIdx).padStart(2, "0")}-${name}`;
  if (copy(src, path.join(OUT, "Reels", destName))) {
    manifest.Reels.push(destName);
    reelIdx++;
  }
}

// ── CAROUSELS (max 10 slides each) ──
const carouselSets = {
  "01-coach-athlete-lifestyle": [
    "01-coach-tablet-track.png", "05-coach-athlete-sidelines.png", "08-swim-coach-poolside.png",
    "14-basketball-coach-timeout.png", "18-rowing-coach-dock.png", "22-night-stadium-coach.png",
    "27-master-athlete-coach.png", "v2-diverse/v2-11-black-coach-latina-swim.png",
    "v2-diverse/v2-31-black-golf-coach.png", "v2-diverse/v2-32-multiracial-rowing.png",
  ],
  "02-diversity-sports": [
    "v2-diverse/v2-01-black-sprint-coach.png", "v2-diverse/v2-02-latina-volleyball.png",
    "v2-diverse/v2-04-asian-figure-skating.png", "v2-diverse/v2-05-afro-capoeira.png",
    "v2-diverse/v2-08-south-asian-cricket.png", "v2-diverse/v2-12-indigenous-climbing.png",
    "v2-diverse/v2-15-black-rugby.png", "v2-diverse/v2-20-afro-caribbean-beach-volleyball.png",
    "v2-diverse/v2-23-middle-eastern-fencing.png", "v2-diverse/v2-26-pacific-rugby-sevens.png",
  ],
  "03-devices-mobile-tablet-wearos": [
    "v3-devices/v3-01-black-kickboxing-phone-selfie.png", "v3-devices/v3-02-latina-handball-wearos.png",
    "v3-devices/v3-03-south-asian-cricket-tablet-wide.png", "v3-devices/v3-04-black-marathon-wearos-macro.png",
    "v3-devices/v3-07-middle-eastern-weightlifting-tablet.png", "v3-devices/v3-08-latina-climbing-wearos-pov.png",
    "v3-devices/v3-12-latino-futsal-wearos.png", "v3-devices/v3-13-black-triathlon-tablet-rear.png",
    "v3-devices/v3-15-afro-latina-gymnastics-wearos.png", "v3-devices/v3-16-asian-badminton-all-devices.png",
  ],
  "04-multi-sport-training": [
    "06-yoga-coach-tablet.png", "07-bjj-coach-phone.png", "09-climbing-coach-phone.png",
    "10-crossfit-coach-tablet.png", "13-tennis-athlete-phone.png", "17-pilates-coach-tablet.png",
    "24-soccer-postmatch-phone.png", "25-boxing-coach-corner.png", "30-skate-coach-park.png",
    "31-gymnastics-coach-tablet.png",
  ],
  "05-athlete-recovery-performance": [
    "03-athlete-hrv-track.png", "04-cyclist-live-session.png", "11-morning-handshake-sunrise.png",
    "12-celebration-pr-gym.png", "15-trail-runner-summit.png", "19-marathon-group-coach.png",
    "20-powerlifter-phone-gym.png", "21-recovery-foam-roll.png", "v2-diverse/v2-07-black-crossfit-pr.png",
    "v2-diverse/v2-25-black-triathlete.png",
  ],
  "06-coach-tools-deep-dive": [
    "02-coach-phone-gym.png", "v2-diverse/v2-03-black-basketball-coach.png", "v2-diverse/v2-10-black-boxing-coach.png",
    "v2-diverse/v2-13-black-yoga-coach.png", "v2-diverse/v2-17-latina-dance-fitness.png", "v2-diverse/v2-19-south-asian-badminton.png",
    "v2-diverse/v2-21-latino-equestrian.png", "v2-diverse/v2-27-latina-pole-vault.png", "v2-diverse/v2-29-asian-taekwondo.png",
    "32-ai-copilot-review.png",
  ],
};

for (const [carouselId, files] of Object.entries(carouselSets)) {
  const carouselDir = path.join(OUT, "Carousels", carouselId);
  ensureDir(carouselDir);
  manifest.Carousels[carouselId] = [];
  files.forEach((rel, i) => {
    const slideName = `${String(i + 1).padStart(2, "0")}-${path.basename(rel)}`;
    if (copy(path.join(SRC, rel), path.join(carouselDir, slideName))) {
      manifest.Carousels[carouselId].push(slideName);
    }
  });
}

// Copy any Mockups/Educational that already exist
for (const sub of ["Mockups", "Educational"]) {
  const subDir = path.join(SRC, sub.toLowerCase());
  if (fs.existsSync(subDir)) {
    for (const f of listPng(subDir)) {
      copy(path.join(subDir, f), path.join(OUT, sub, f));
      manifest[sub].push(f);
    }
  }
}

fs.writeFileSync(
  path.join(OUT, "MANIFEST.json"),
  JSON.stringify(manifest, null, 2)
);

console.log("Instagram pack organized:");
console.log(`  Stories:   ${manifest.Stories.length}`);
console.log(`  Posts:     ${manifest.Posts.length}`);
console.log(`  Reels:     ${manifest.Reels.length}`);
console.log(`  Carousels: ${Object.keys(manifest.Carousels).length} sets (${Object.values(manifest.Carousels).flat().length} slides)`);
console.log(`  Mockups:   ${manifest.Mockups.length}`);
console.log(`  Educational: ${manifest.Educational.length}`);
console.log(`  Output: ${OUT}`);
