#!/usr/bin/env node
/**
 * Rebuild Instagram assets with official logo watermark + real app screenshots.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  ROOT,
  brandOverlay,
  phoneMockup,
  slideWithPhone,
  writePng,
  qa
} from "./lib.mjs";

const ASSETS = path.join(ROOT, "content/instagram/assets");
const ORIG = path.join(ROOT, "content/instagram/assets/_original");

/** Backup originals once, then rebuild */
function backupOriginal(name) {
  const src = path.join(ASSETS, name);
  const dest = path.join(ORIG, name);
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(ORIG, { recursive: true });
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
}

async function overlayExisting(name) {
  backupOriginal(name);
  const src = path.join(ORIG, name);
  const input = fs.existsSync(src) ? src : path.join(ASSETS, name);
  if (!fs.existsSync(input)) {
    console.warn("skip missing", name);
    return;
  }
  const buf = await brandOverlay(fs.readFileSync(input));
  await writePng(path.join(ASSETS, name), buf);
  console.log("branded", name);
}

async function buildPhoneSlide(name, screenshot, meta) {
  backupOriginal(name);
  const buf = await slideWithPhone({ screenshot, ...meta });
  await writePng(path.join(ASSETS, name), buf);
  console.log("built", name, "←", path.basename(screenshot));
}

async function buildQuadApps() {
  const shots = [
    qa("qa/evidence/cowork/native-run-2/android/12_athlete_home.png"),
    qa("qa/evidence/cowork/native-run-2/android/13_recovery.png"),
    qa("qa/evidence/cowork/native-run-2/android/21_activity_running.png"),
    qa("qa/evidence/cowork/native-run-2/android/60_coach_os.png")
  ];
  const cells = [];
  for (const s of shots) {
    cells.push(await phoneMockup(s, { phoneW: 240 }));
  }
  const grid = await sharp({
    create: { width: 1080, height: 1350, channels: 4, background: "#070B14" }
  })
    .composite([
      { input: cells[0], top: 200, left: 80 },
      { input: cells[1], top: 200, left: 560 },
      { input: cells[2], top: 720, left: 80 },
      { input: cells[3], top: 720, left: 560 }
    ])
    .png()
    .toBuffer();

  const titled = await sharp(grid)
    .composite([
      {
        input: Buffer.from(`<svg width="1080" height="200" xmlns="http://www.w3.org/2000/svg">
          <text x="90" y="80" font-family="monospace" font-size="22" fill="#C8FF00">MANUAL</text>
          <text x="90" y="150" font-family="Arial" font-size="58" font-weight="800" fill="#E8EDF4">Quatro apps. Zero conversa.</text>
        </svg>`),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toBuffer();

  await writePng(path.join(ASSETS, "post03_quatro_apps.png"), await brandOverlay(titled));
  console.log("built post03_quatro_apps.png");
}

const PHONE_SLIDES = [
  ["post07_p1.png", "qa/evidence/ultimate/android/final_home.png", { eyebrow: "MANUAL", title: "Hoje" }],
  ["post07_p2.png", "qa/evidence/cowork/native-run-2/android/13_recovery.png", { eyebrow: "MANUAL", title: "Prontidão" }],
  ["post07_p3.png", "qa/evidence/cowork/native-run-2/android/21_activity_running.png", { eyebrow: "MANUAL", title: "Treinar" }],
  ["post07_p4.png", "qa/evidence/cowork/native-run-2/android/17_profile.png", { eyebrow: "MANUAL", title: "Perfil" }],
  ["post07_p5.png", "qa/evidence/cowork/native-run-2/android/60_coach_os.png", { eyebrow: "COACH OS", title: "Comando" }],
  ["post08_treinador_adivinha.png", "qa/evidence/cowork/native-run-2/android/62_coach_athletes.png", { eyebrow: "COACH OS", title: "O treinador está a adivinhar?" }],
  ["post09_p1.png", "qa/evidence/cowork/native-run-2/android/60_coach_os.png", { eyebrow: "COACH OS", title: "Sala de comando" }],
  ["post09_p2.png", "qa/evidence/cowork/native-run-2/android/62_coach_athletes.png", { eyebrow: "COACH OS", title: "Roster" }],
  ["post09_p3.png", "qa/evidence/cowork/native-run-2/android/65_coach_more.png", { eyebrow: "COACH OS", title: "Calendário" }],
  ["post09_p4.png", "qa/evidence/cowork/native-run-2/android/60_coach_os.png", { eyebrow: "COACH OS", title: "Inbox" }],
  ["post09_p5.png", "qa/evidence/cowork/native-run-2/android/61_coach_ai.png", { eyebrow: "COACH OS", title: "Sinais" }],
  ["post14_marketplace.png", "qa/evidence/cowork/native-run-2/android/30_discover.png", { eyebrow: "COACH OS", title: "Marketplace" }],
  ["post11_consistencia.png", "qa/evidence/ultimate/android/final_recovery.png", { eyebrow: "ESPELHO", title: "Consistência bate intensidade" }],
  ["post17_manifesto.png", "qa/evidence/ultimate/android/10_athlete_home.png", { eyebrow: "MARCA", title: "Connect. Train. Perform." }]
];

const REEL_COVERS = [
  ["post01_capa_reel.png", "qa/evidence/ultimate/android/final_home.png"],
  ["post10_capa_reel.png", "qa/evidence/cowork/native-run-2/android/13_recovery.png"],
  ["post13_capa_reel.png", "qa/evidence/cowork/native-run-2/wear/03_workout.png"]
];

async function main() {
  // Export logos if missing
  if (!fs.existsSync(path.join(ROOT, "apps/web/public/brand/fitconnect-logo-256.png"))) {
    const { spawnSync } = await import("node:child_process");
    spawnSync("node", ["scripts/export-brand-logo.mjs"], { cwd: ROOT, stdio: "inherit" });
  }

  await buildQuadApps();

  for (const [name, shot, meta] of PHONE_SLIDES) {
    const p = qa(shot);
    if (!fs.existsSync(p)) {
      console.warn("missing qa", shot);
      await overlayExisting(name);
      continue;
    }
    await buildPhoneSlide(name, p, meta);
  }

  for (const [name, shot] of REEL_COVERS) {
    const p = qa(shot);
    if (!fs.existsSync(p)) continue;
    backupOriginal(name);
    const buf = await slideWithPhone({
      screenshot: p,
      eyebrow: "FITCONNECT",
      title: "Elite OS",
      format: "reel"
    });
    await writePng(path.join(ASSETS, name), buf);
    console.log("reel cover", name);
  }

  // Brand overlay on remaining carousel / text slides
  const skip = new Set([
    "post03_quatro_apps.png",
    ...PHONE_SLIDES.map(([n]) => n),
    ...REEL_COVERS.map(([n]) => n)
  ]);
  for (const f of fs.readdirSync(ASSETS).filter((x) => x.endsWith(".png") && !x.startsWith("_"))) {
    if (skip.has(f)) continue;
    await overlayExisting(f);
  }

  console.log("BUILD_PREMIUM_DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
