#!/usr/bin/env node
/**
 * Build 32 Instagram grid posts — 8 rows × 4 cols · 1080×1440 (Meta 3:4).
 * Publish order g32_01 → g32_32: row 1 bottom, row 8 top on profile grid.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, gridFeedSlide, writePng, qa } from "./lib.mjs";

const CONTENT = path.join(ROOT, "content/instagram");
const ASSETS = path.join(CONTENT, "assets");
const CAPTIONS = path.join(CONTENT, "captions");

const QA = {
  home: qa("qa/evidence/ultimate/android/final_home.png"),
  recovery: qa("qa/evidence/cowork/native-run-2/android/13_recovery.png"),
  activity: qa("qa/evidence/cowork/native-run-2/android/21_activity_running.png"),
  profile: qa("qa/evidence/cowork/native-run-2/android/17_profile.png"),
  discover: qa("qa/evidence/cowork/native-run-2/android/30_discover.png"),
  coach: qa("qa/evidence/cowork/native-run-2/android/60_coach_os.png"),
  athletes: qa("qa/evidence/cowork/native-run-2/android/62_coach_athletes.png"),
  coachAi: qa("qa/evidence/cowork/native-run-2/android/61_coach_ai.png"),
  coachOnboard: qa("qa/evidence/cowork/native-run-2/android/52_coach_onboard.png"),
  community: qa("qa/evidence/cowork/native-run-2/android/28_community.png"),
  wear: qa("qa/evidence/cowork/native-run-2/wear/03_workout.png"),
  wearPhone: qa("qa/evidence/cowork/native-run-2/android/34_phone_after_wear.png"),
  telemetry: qa("qa/evidence/cowork/native-run-2/android/31_telemetry.png"),
  paused: qa("qa/evidence/cowork/native-run-2/android/24_paused.png"),
  finish: qa("qa/evidence/cowork/native-run-2/android/27_post_finish.png"),
  sleep: qa("qa/evidence/cowork/native-run-2/android/33_sleep.png"),
  settings: qa("qa/evidence/cowork/native-run-2/android/50_settings.png")
};

const GRID = [
  // Row 1 — Brand
  { row: 1, col: 1, theme: "brand", eyebrow: "FITCONNECT", headline: "Connect.", sub: "Train. Perform.", shot: null },
  { row: 1, col: 2, theme: "brand", eyebrow: "ELITE OS", headline: "Um sistema.", sub: "Não quatro apps.", shot: QA.home },
  { row: 1, col: 3, theme: "brand", eyebrow: "HEXATAR", headline: "Progressão", sub: "visível todos os dias.", shot: null },
  { row: 1, col: 4, theme: "brand", eyebrow: "PREVIEW", headline: "Honesto.", sub: "LOCAL_DEMO até go-live.", shot: null },
  // Row 2 — Problema
  { row: 2, col: 1, theme: "problem", eyebrow: "O PROBLEMA", headline: "Treinas.", sub: "Não vês progresso.", shot: null },
  { row: 2, col: 2, theme: "problem", eyebrow: "O PROBLEMA", headline: "Quatro apps.", sub: "Zero conversa.", shot: null },
  { row: 2, col: 3, theme: "problem", eyebrow: "O PROBLEMA", headline: "Dados espalhados.", sub: "Decisões no escuro.", shot: null },
  { row: 2, col: 4, theme: "problem", eyebrow: "A VIRAR", headline: "E se existisse", sub: "um só sistema?", shot: null },
  // Row 3 — Solução
  { row: 3, col: 1, theme: "solution", eyebrow: "A SOLUÇÃO", headline: "Um OS.", sub: "Atleta + coach.", shot: QA.discover },
  { row: 3, col: 2, theme: "solution", eyebrow: "HEALTH CONNECT", headline: "No centro.", sub: "Não um adapter.", shot: null },
  { row: 3, col: 3, theme: "solution", eyebrow: "HOJE", headline: "O que fazer", sub: "agora.", shot: QA.home },
  { row: 3, col: 4, theme: "solution", eyebrow: "TREINAR", headline: "Sem fricção.", sub: "Registo limpo.", shot: QA.activity },
  // Row 4 — Features
  { row: 4, col: 1, theme: "feature", eyebrow: "FUNCIONALIDADES", headline: "Hoje", sub: "Sessão + plano.", shot: QA.home },
  { row: 4, col: 2, theme: "feature", eyebrow: "FUNCIONALIDADES", headline: "Prontidão", sub: "Corpo aguenta?", shot: QA.recovery },
  { row: 4, col: 3, theme: "feature", eyebrow: "FUNCIONALIDADES", headline: "Treinar", sub: "Live cockpit.", shot: QA.activity },
  { row: 4, col: 4, theme: "feature", eyebrow: "FUNCIONALIDADES", headline: "Perfil", sub: "A tua progressão.", shot: QA.profile },
  // Row 5 — Treino
  { row: 5, col: 1, theme: "train", eyebrow: "TREINO", headline: "Em movimento.", sub: "GPS + telemetria.", shot: QA.activity },
  { row: 5, col: 2, theme: "train", eyebrow: "TREINO", headline: "Pausa.", sub: "Recupera. Continua.", shot: QA.paused },
  { row: 5, col: 3, theme: "train", eyebrow: "TREINO", headline: "Concluído.", sub: "Resumo automático.", shot: QA.finish },
  { row: 5, col: 4, theme: "train", eyebrow: "TELEMETRIA", headline: "Dados live.", sub: "Pace · FC · rota.", shot: QA.telemetry },
  // Row 6 — Coach
  { row: 6, col: 1, theme: "coach", eyebrow: "COACH OS", headline: "Squad command.", sub: "Uma sala.", shot: QA.coach },
  { row: 6, col: 2, theme: "coach", eyebrow: "COACH OS", headline: "Roster.", sub: "Todos os atletas.", shot: QA.athletes },
  { row: 6, col: 3, theme: "coach", eyebrow: "COACH OS", headline: "IA coach.", sub: "Contexto real.", shot: QA.coachAi },
  { row: 6, col: 4, theme: "coach", eyebrow: "COACH OS", headline: "Onboard.", sub: "Treinador em minutos.", shot: QA.coachOnboard },
  // Row 7 — Social / Wear
  { row: 7, col: 1, theme: "social", eyebrow: "COMUNIDADE", headline: "Squad.", sub: "Treina em grupo.", shot: QA.community },
  { row: 7, col: 2, theme: "social", eyebrow: "DESCOBRIR", headline: "Coaches.", sub: "Marketplace.", shot: QA.discover },
  { row: 7, col: 3, theme: "social", eyebrow: "WEAR OS", headline: "No pulso.", sub: "Preview.", shot: QA.wear },
  { row: 7, col: 4, theme: "social", eyebrow: "SYNC", headline: "Phone ↔ Watch.", sub: "Mesmo treino.", shot: QA.wearPhone },
  // Row 8 — CTA
  { row: 8, col: 1, theme: "cta", eyebrow: "CONFIANÇA", headline: "Build in public.", sub: "Sem promessas vazias.", shot: null },
  { row: 8, col: 2, theme: "cta", eyebrow: "CONFIANÇA", headline: "Preview honesto.", sub: "Dizemos a verdade.", shot: null },
  { row: 8, col: 3, theme: "cta", eyebrow: "LISTA DE ESPERA", headline: "Entra cedo.", sub: "Molda o produto.", shot: QA.settings },
  { row: 8, col: 4, theme: "cta", eyebrow: "CTA", headline: "Link na bio.", sub: "fitconnect-phi.vercel.app", shot: null }
];

const HASHTAGS = "#fitconnect #treino #appfitness #healthconnect #preview #teste";

function captionFor(spec, id) {
  const lines = [
    spec.headline,
    spec.sub,
    `Grid ${spec.row}/8 · col ${spec.col}/4 · ${id.toUpperCase()}`,
    "Preview de teste — não é versão final.",
    "Lista de espera: link na bio.",
    HASHTAGS
  ];
  return lines.filter(Boolean).join("\n");
}

async function main() {
  fs.mkdirSync(ASSETS, { recursive: true });
  fs.mkdirSync(CAPTIONS, { recursive: true });

  const posts = [];

  for (let i = 0; i < GRID.length; i++) {
    const spec = GRID[i];
    const n = String(i + 1).padStart(2, "0");
    const id = `g32_${n}`;
    const file = `${id}.png`;
    const shot = spec.shot && fs.existsSync(spec.shot) ? spec.shot : null;

    const buf = await gridFeedSlide({
      row: spec.row,
      col: spec.col,
      eyebrow: spec.eyebrow,
      headline: spec.headline,
      sub: spec.sub,
      screenshot: shot,
      rowTheme: spec.theme
    });

    await writePng(path.join(ASSETS, file), buf);
    const capFile = `${id}.txt`;
    fs.writeFileSync(path.join(CAPTIONS, capFile), captionFor(spec, id));

    posts.push({
      id,
      type: "image",
      grid: { row: spec.row, col: spec.col },
      chapter: spec.eyebrow,
      media: [`assets/${file}`],
      captionFile: capFile
    });
    console.log("built", file, `row${spec.row} col${spec.col}`);
  }

  const manifest = {
    version: "grid32",
    handle: "@fitconnectsports",
    dimensions: { feed: "1080x1440", grid: "4x8", ratio: "3:4" },
    publishOrder: "g32_01 → g32_32 (row1 bottom, row8 top on profile)",
    posts
  };

  fs.writeFileSync(path.join(CONTENT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("MANIFEST_OK", posts.length, "posts");
}

main().catch((e) => { console.error(e); process.exit(1); });
