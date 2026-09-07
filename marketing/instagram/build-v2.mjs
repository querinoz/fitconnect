#!/usr/bin/env node
/**
 * Build all v2 Instagram static assets — 1080×1440 commercial grade.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import {
  ROOT,
  TOKENS,
  FEED,
  brandOverlay,
  phoneMockup,
  slideWithPhone,
  writePng,
  qa
} from "./lib.mjs";

const V2 = path.join(ROOT, "content/instagram/v2");
const ASSETS = path.join(V2, "assets");
const HEROES = path.join(V2, "heroes");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(V2, "manifest.json"), "utf8"));

function hero(name) {
  const p = path.join(HEROES, name);
  return fs.existsSync(p) ? p : null;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

async function commercialSlide({ eyebrow, headline, sub, kicker, heroImage }) {
  const { w, h } = FEED;
  let base = sharp({
    create: { width: w, height: h, channels: 4, background: TOKENS.floor }
  });

  const layers = [];
  if (heroImage && fs.existsSync(heroImage)) {
    const photo = await sharp(heroImage)
      .resize(w, Math.round(h * 0.62), { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    layers.push({ input: photo, top: 200, left: 0 });
    const grad = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${TOKENS.floor}" stop-opacity="0.1"/>
        <stop offset="45%" stop-color="${TOKENS.floor}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${TOKENS.floor}" stop-opacity="1"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>`);
    layers.push({ input: grad, top: 0, left: 0 });
  }

  const text = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="90" y="120" font-family="monospace" font-size="22" font-weight="600" letter-spacing="4" fill="${TOKENS.voltline}">${esc(eyebrow)}</text>
    <text x="90" y="${heroImage ? 920 : 400}" font-family="Arial,Helvetica,sans-serif" font-size="72" font-weight="800" fill="${TOKENS.ink}">${esc(headline)}</text>
    ${sub ? `<text x="90" y="${heroImage ? 1000 : 500}" font-family="Arial" font-size="36" fill="${TOKENS.soft}">${esc(sub)}</text>` : ""}
    ${kicker ? `<text x="90" y="${h - 160}" font-family="monospace" font-size="20" fill="${TOKENS.mute}">${esc(kicker)}</text>` : ""}
  </svg>`);
  layers.push({ input: text, top: 0, left: 0 });

  const composed = await base.composite(layers).png().toBuffer();
  return brandOverlay(composed);
}

const QA = {
  home: qa("qa/evidence/ultimate/android/final_home.png"),
  recovery: qa("qa/evidence/cowork/native-run-2/android/13_recovery.png"),
  activity: qa("qa/evidence/cowork/native-run-2/android/21_activity_running.png"),
  profile: qa("qa/evidence/cowork/native-run-2/android/17_profile.png"),
  coach: qa("qa/evidence/cowork/native-run-2/android/60_coach_os.png"),
  athletes: qa("qa/evidence/cowork/native-run-2/android/62_coach_athletes.png"),
  wear: qa("qa/evidence/cowork/native-run-2/wear/03_workout.png"),
  discover: qa("qa/evidence/cowork/native-run-2/android/30_discover.png")
};

async function reelCoverFromSlide(buf) {
  return brandOverlay(buf, { format: "reel" });
}

async function main() {
  fs.mkdirSync(ASSETS, { recursive: true });
  fs.mkdirSync(HEROES, { recursive: true });

  const reelCovers = [
    ["v2_01_hook_cover.png", "v2_01_hook_hero.png", () => slideWithPhone({
      screenshot: QA.activity, eyebrow: "GANCHO", title: "Treinas. Registas. Recomeças.", format: "reel"
    })],
    ["v2_04_app_cover.png", "v2_04_app_hero.png", () => slideWithPhone({
      screenshot: QA.home, eyebrow: "PRODUTO", title: "O teu treino. Um sistema.", format: "reel"
    })],
    ["v2_06_wear_cover.png", "v2_06_wear_hero.png", () => slideWithPhone({
      screenshot: QA.wear, eyebrow: "WEAR OS", title: "Pulso. Telemóvel. Sincronizado.", format: "reel"
    })],
    ["v2_09_cta_cover.png", "v2_09_cta_hero.png", async () => commercialSlide({
      eyebrow: "LISTA DE ESPERA", headline: "Entra cedo.", sub: "Link na bio."
    })]
  ];

  for (const [coverFile, heroName, fallback] of reelCovers) {
    const h = hero(heroName);
    const buf = h
      ? await brandOverlay(fs.readFileSync(h), { format: "reel" })
      : await reelCoverFromSlide(await fallback());
    await writePng(path.join(ASSETS, coverFile), buf);
    console.log("cover", coverFile);
  }

  // Carousel 02 — Problema
  const p02 = [
    ["v2_02_p1.png", "O PROBLEMA", "Treinas todos os dias.", "E não vês progresso.", null],
    ["v2_02_p2.png", "O PROBLEMA", "Quatro apps.", "Zero conversa entre elas.", null],
    ["v2_02_p3.png", "O PROBLEMA", "Dados espalhados.", "Decisões no escuro.", hero("v2_02_hero.png")],
    ["v2_02_p4.png", "A VIRAR", "E se existisse", "um só sistema?", null]
  ];
  for (const [file, eyebrow, head, sub, h] of p02) {
    await writePng(path.join(ASSETS, file), await commercialSlide({ eyebrow, headline: head, sub, heroImage: h }));
    console.log(file);
  }

  // Image 03
  const h03 = hero("v2_03_hero.png");
  if (h03) {
    await writePng(path.join(ASSETS, "v2_03_one_os.png"), await commercialSlide({
      eyebrow: "A SOLUÇÃO", headline: "Um OS.", sub: "Atleta + treinador + telemetria.", heroImage: h03
    }));
  } else {
    await writePng(path.join(ASSETS, "v2_03_one_os.png"), await slideWithPhone({
      screenshot: QA.discover, eyebrow: "A SOLUÇÃO", title: "Um OS.", body: "Atleta + treinador + telemetria."
    }));
    console.log("v2_03_one_os.png");
  }

  // Carousel 05 — Features (real app screenshots)
  const p05 = [
    ["v2_05_p1.png", "FUNCIONALIDADES", "Hoje", QA.home],
    ["v2_05_p2.png", "FUNCIONALIDADES", "Prontidão", QA.recovery],
    ["v2_05_p3.png", "FUNCIONALIDADES", "Treinar", QA.activity],
    ["v2_05_p4.png", "FUNCIONALIDADES", "Perfil", QA.profile],
    ["v2_05_p5.png", "FUNCIONALIDADES", "Coach OS", QA.coach]
  ];
  for (const [file, eyebrow, title, shot] of p05) {
    if (fs.existsSync(shot)) {
      await writePng(path.join(ASSETS, file), await slideWithPhone({ screenshot: shot, eyebrow, title }));
      console.log(file);
    }
  }

  // Image 07 coach
  const h07 = hero("v2_07_hero.png");
  if (h07) {
    await writePng(path.join(ASSETS, "v2_07_coach.png"), await commercialSlide({
      eyebrow: "COACH OS", headline: "Decide com dados.", sub: "Não com intuição.", heroImage: h07
    }));
  } else if (fs.existsSync(QA.athletes)) {
    await writePng(path.join(ASSETS, "v2_07_coach.png"), await slideWithPhone({
      screenshot: QA.athletes, eyebrow: "COACH OS", title: "Decide com dados."
    }));
  }

  // Carousel 08 — Confiança
  const p08 = [
    ["v2_08_p1.png", "CONFIANÇA", "Build in public.", "Sem promessas vazias."],
    ["v2_08_p2.png", "CONFIANÇA", "Preview honesto.", "LOCAL_DEMO até go-live."],
    ["v2_08_p3.png", "CONFIANÇA", "Health Connect", "no centro — não um adapter."],
    ["v2_08_p4.png", "LISTA DE ESPERA", "Entra cedo.", "Link na bio."]
  ];
  for (const [file, eyebrow, head, sub] of p08) {
    await writePng(path.join(ASSETS, file), await commercialSlide({ eyebrow, headline: head, sub }));
    console.log(file);
  }

  // Image 10 manifesto
  const h10 = hero("v2_10_hero.png");
  await writePng(path.join(ASSETS, "v2_10_manifesto.png"), await commercialSlide({
    eyebrow: "FITCONNECT",
    headline: "Connect. Train. Perform.",
    sub: "O sistema de performance.",
    heroImage: h10,
    kicker: "fitconnect-phi.vercel.app"
  }));

  console.log("BUILD_V2_DONE");
}

main().catch((e) => { console.error(e); process.exit(1); });
