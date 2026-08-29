#!/usr/bin/env node
/**
 * FitConnect — Instagram Graph API Publisher
 *
 * Publica posts, carousels e stories via Meta Graph API.
 *
 * Requisitos (env):
 *   IG_USER_ID       — Instagram Business/Creator account ID
 *   IG_ACCESS_TOKEN  — Page token com instagram_content_publish
 *   PUBLIC_BASE_URL  — Base URL pública das imagens (default: Vercel deploy)
 *
 * Uso:
 *   node scripts/publish-instagram.mjs --dry-run          # simula
 *   node scripts/publish-instagram.mjs --priority         # publica ordem recomendada
 *   node scripts/publish-instagram.mjs --all              # publica tudo (lento!)
 *   node scripts/publish-instagram.mjs --strategic        # feed premium — mix dinâmico (recomendado)
 *   node scripts/publish-instagram.mjs --strategic --batch 12  # só N items por sessão
 *   node scripts/publish-instagram.mjs --carousel 07-educational-fitconnect
 *   node scripts/publish-instagram.mjs --post Posts/22-mockup-athlete-dashboard.png
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  buildContentPool,
  buildStrategicQueue,
  summarizeQueue
} from "./instagram-strategic-queue.mjs";

const PROFILE_CACHE = path.resolve("/workspace/.instagram-profile-cache.json");

// Load .env.local — always override stale shell env
const envLocal = path.resolve("/workspace/.env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const API_VERSION = "v21.0";
const API_HOST = process.env.IG_API_HOST || "graph.facebook.com";
const API_BASE = `https://${API_HOST}/${API_VERSION}`;

const PACK = path.resolve("/workspace/public/instagram-pack");
const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  "https://raw.githubusercontent.com/querinoz/fitconnect/cursor/instagram-api-publish-3f4b/public/instagram-pack";

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

const DELAY_MS = Number(process.env.IG_PUBLISH_DELAY_MS || 90_000); // 90s entre posts
const STORY_DELAY_MS = Number(process.env.IG_STORY_DELAY_MS || 30_000);
const PROGRESS_FILE = path.resolve("/workspace/.instagram-publish-progress.json");

const CAPTIONS = {
  educational: `📊 HRV explicado em 60 segundos.

Swipe → e descobre como o FitConnect usa a tua variabilidade cardíaca para ajustar o treino ANTES de começares.

✅ Readiness score diário
✅ Correlação sono × HRV
✅ Coach vê o teu estado em tempo real
✅ Plano adapta-se automaticamente

Bad night? Lighter session. Sem debate.

Connect. Train. Perform. 💚

#FitConnect #HRV #Recovery #SportsTech #AthleteLife #CoachLife #ConnectTrainPerform #TrainingLoad #WearOS #RunningCoach`,

  mockups: `📱 Mobile. ⌚ WearOS. 📲 Tablet.

O FitConnect funciona onde TU treinas — pista, ginásio, piscina, estrada.

→ Athlete OS: readiness, live session, PR celebrations
→ Coach dashboard: roster heatmap, nudges, AI alerts
→ Sync em tempo real entre atleta e coach

Experimenta grátis. Link na bio.

#FitConnect #SportsTech #AppDesign #FitnessApp #CoachApp #WearOS #PWA #ConnectTrainPerform`,

  mockupDashboard: `O teu dashboard de atleta de elite — sem pagar €199/mês.

Readiness ring · HRV × sono · Live session · AI insights

Grátis para começar. €12/mo quando estiveres pronto.

Link na bio → fitconnect.app

#FitConnect #AthleteOS #HRV #Dashboard #SportsTech`,

  diversity: `10 desportos. 1 plataforma. 12.418 especialistas verificados.

Do tatame ao velódromo, da piscina à pista de atletismo — o teu perfil de atleta viaja contigo.

Swipe → vê a diversidade que nos define.

#FitConnect #DiversityInSport #MultiSport #Capoeira #Volleyball #Cricket #Fencing #ConnectTrainPerform`,

  devices: `Treina no telemóvel. Monitoriza no WearOS. Analisa no tablet.

3 devices. 1 plataforma. Sync em tempo real.

#FitConnect #WearOS #SportsTech #ConnectTrainPerform #MobileApp #Smartwatch`,

  lifestyle: `Recovery-aware training. Live coach connection. Multi-sport identity.

Connect. Train. Perform. 💚

#FitConnect #AthleteLife #SportsTech #ConnectTrainPerform`,

  coachAthlete: `Coach × atleta — a ligação que muda o jogo.

Readiness em tempo real · Nudges inteligentes · Plano que adapta ao atleta.

Connect. Train. Perform. 💚

#FitConnect #CoachLife #AthleteLife #SportsTech #ConnectTrainPerform`,

  multiSport: `Uma identidade. Vários desportos.

O teu perfil de atleta viaja contigo — da pista ao tatame, do mar ao ginásio.

#FitConnect #MultiSport #AthleteLife #ConnectTrainPerform`,

  recovery: `Recovery-aware training — treina mais inteligente, não só mais forte.

HRV · sono · carga · readiness — tudo num só lugar.

#FitConnect #Recovery #HRV #SportsTech #ConnectTrainPerform`,

  coachTools: `Ferramentas que todo coach precisa.

Roster heatmap · AI alerts · live session · nudges — o FitConnect no teu bolso.

#FitConnect #CoachLife #CoachApp #SportsTech #ConnectTrainPerform`,

  defaultPost: `Liga. Treina. Perform. 💚

O FitConnect liga atletas e coaches com readiness, HRV e treino ao vivo.

Link na bio → fitconnect.app

#FitConnect #SportsTech #LigaTreinaPerform #AthleteLife #CoachLife`,

  abstract: `Liga. Treina. Perform.

Marca · Atitude · Performance.

#FitConnect #LigaTreinaPerform #SportsTech #AthleteLife`,

  featurePost: `✨ FitConnect — feito para atletas que levam o treino a sério.

Liga. Treina. Perform. 💚

Link na bio → fitconnect.app

#FitConnect #SportsTech #LigaTreinaPerform #AthleteOS`,

  eduPost: `📊 Educação para atletas.

Swipe mental → aplica no treino de amanhã.

Liga. Treina. Perform. 💚

#FitConnect #HRV #Recovery #ConnectTrainPerform #CoachLife`,

  mockupPost: `📱 O teu coach. Os teus dados. Um só lugar.

Liga. Treina. Perform.

Experimenta grátis → link na bio

#FitConnect #AppDesign #SportsTech #WearOS #LigaTreinaPerform`,

  carouselEdu: `📊 Educação que salva no feed.

Swipe → e leva contigo.

Liga. Treina. Perform. 💚

#FitConnect #HRV #Recovery #SportsTech #LigaTreinaPerform`,

  carouselProduct: `📱 FitConnect — onde treinas, nós estamos.

Mobile · WearOS · Tablet · Sync total.

Liga. Treina. Perform.

#FitConnect #SportsTech #AppDesign #WearOS #LigaTreinaPerform`,

  carouselAbstract: `Liga. Treina. Perform.

Marca · Propósito · Performance.

#FitConnect #LigaTreinaPerform #AthleteLife`
};

const CAROUSEL_CAPTIONS = {
  "01-coach-athlete-lifestyle": CAPTIONS.coachAthlete,
  "02-diversity-sports": CAPTIONS.diversity,
  "03-devices-mobile-tablet-wearos": CAPTIONS.devices,
  "04-multi-sport-training": CAPTIONS.multiSport,
  "05-athlete-recovery-performance": CAPTIONS.recovery,
  "06-coach-tools-deep-dive": CAPTIONS.coachTools,
  "07-educational-fitconnect": CAPTIONS.educational,
  "08-mockups-product": CAPTIONS.mockups,
  "09-app-features": CAPTIONS.carouselProduct,
  "10-educational-v2": CAPTIONS.carouselEdu,
  "11-abstract-brand": CAPTIONS.carouselAbstract,
  "12-app-features-v2": CAPTIONS.carouselProduct,
  "13-educational-v3": CAPTIONS.carouselEdu,
  "14-abstract-v2": CAPTIONS.carouselAbstract,
  "15-app-features-v3": CAPTIONS.carouselProduct,
  "16-educational-v4": CAPTIONS.carouselEdu,
  "17-abstract-v3": CAPTIONS.carouselAbstract
};

function captionFor(type, idOrFile) {
  if (type === "carousel") {
    return CAROUSEL_CAPTIONS[idOrFile] || CAPTIONS.defaultPost;
  }
  if (POST_CAPTIONS[idOrFile]) return POST_CAPTIONS[idOrFile];
  const base = path.basename(idOrFile).toLowerCase();
  if (base.includes("feature")) return CAPTIONS.featurePost;
  if (base.startsWith("abstract-")) return CAPTIONS.abstract;
  if (base.startsWith("edu-")) return CAPTIONS.eduPost;
  if (base.includes("mockup")) return CAPTIONS.mockupPost;
  return CAPTIONS.lifestyle;
}

const POST_CAPTIONS = {
  "Posts/22-mockup-athlete-dashboard.png": CAPTIONS.mockupDashboard,
  "Posts/23-mockup-ecosystem.png": CAPTIONS.devices,
  "Posts/24-mockup-ai-copilot.png": CAPTIONS.educational
};

const CAROUSEL_ORDER = [
  "07-educational-fitconnect",
  "08-mockups-product",
  "02-diversity-sports",
  "03-devices-mobile-tablet-wearos",
  "01-coach-athlete-lifestyle",
  "04-multi-sport-training",
  "05-athlete-recovery-performance",
  "06-coach-tools-deep-dive"
];

// ── Priority publish queue (from POSTING-STRATEGY.md) ──
const PRIORITY_QUEUE = [
  { type: "carousel", id: "07-educational-fitconnect", caption: CAPTIONS.educational },
  { type: "story", file: "story-edu-poll-hrv.png", caption: "" },
  { type: "post", file: "Posts/22-mockup-athlete-dashboard.png", caption: CAPTIONS.mockupDashboard },
  { type: "carousel", id: "08-mockups-product", caption: CAPTIONS.mockups },
  { type: "carousel", id: "02-diversity-sports", caption: CAPTIONS.diversity },
  { type: "story", file: "story-edu-swipe-up-demo.png", caption: "" },
  { type: "post", file: "Posts/10-v2-06-latina-soccer.png", caption: CAPTIONS.lifestyle },
  { type: "carousel", id: "03-devices-mobile-tablet-wearos", caption: CAPTIONS.devices },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function captionFingerprint(caption) {
  return (caption || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function loadProfileCaptionFingerprints() {
  if (!fs.existsSync(PROFILE_CACHE)) return new Set();
  try {
    const cache = JSON.parse(fs.readFileSync(PROFILE_CACHE, "utf8"));
    return new Set((cache.captionFingerprints || []).map((c) => c.fp));
  } catch {
    return new Set();
  }
}

async function syncProfileIfNeeded() {
  if (!process.argv.includes("--sync-profile") && !process.argv.includes("--strategic")) return;
  console.log("🔄 A sincronizar com perfil @fitconnectsports...\n");
  const { execSync } = await import("node:child_process");
  try {
    execSync("node scripts/sync-instagram-profile.mjs", {
      stdio: "inherit",
      env: { ...process.env, IG_ACCESS_TOKEN: IG_ACCESS_TOKEN, IG_USER_ID: IG_USER_ID }
    });
  } catch (e) {
    console.warn("⚠️  Sync do perfil falhou — a continuar só com progress local\n");
  }
}

function shouldSkipDuplicateCaption(item, profileCaptions) {
  if (!item.caption || item.type === "story") return false;
  const fp = captionFingerprint(item.caption);
  if (!fp || fp.length < 20) return false;
  // Skip generic default caption if already heavily used on profile
  if (fp.includes("connect train perform") && profileCaptions.has(fp)) return true;
  return profileCaptions.has(fp);
}

function itemKey(item) {
  if (item.type === "carousel") return `carousel:${item.id}`;
  return `${item.type}:${item.file}`;
}

function loadPublishedKeys() {
  if (!fs.existsSync(PROGRESS_FILE)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
    return new Set((data.published || []).map((e) => e.key));
  } catch {
    return new Set();
  }
}

function saveProgress(item, mediaId) {
  let data = { published: [] };
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
    } catch {
      data = { published: [] };
    }
  }
  data.published.push({
    key: itemKey(item),
    mediaId,
    at: new Date().toISOString()
  });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

function publicUrl(relativePath) {
  return `${PUBLIC_BASE}/${relativePath.replace(/\\/g, "/")}`;
}

async function graphApi(endpoint, params = {}, method = "GET") {
  const url = new URL(`${API_BASE}${endpoint}`);
  url.searchParams.set("access_token", IG_ACCESS_TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, { method });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Graph API ${endpoint}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function verifyCredentials() {
  console.log("Verificando credenciais...");
  const me = await graphApi(`/${IG_USER_ID}`, {
    fields: "id,username,name,profile_picture_url"
  });
  console.log(`✓ Conta: @${me.username ?? me.name ?? me.id} (${me.id})`);
  return me;
}

async function verifyPublicUrls(items) {
  console.log("\nVerificando URLs públicas das imagens...");
  for (const item of items) {
    let rel;
    if (item.type === "carousel") {
      const firstSlide = fs
        .readdirSync(path.join(PACK, "Carousels", item.id))
        .filter((f) => f.endsWith(".png"))
        .sort()[0];
      rel = `Carousels/${item.id}/${firstSlide}`;
    } else if (item.type === "post") {
      rel = item.file;
    } else {
      rel = `Stories/${path.basename(item.file)}`;
    }
    const url = publicUrl(rel);
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) throw new Error(`URL inacessível (${res.status}): ${url}`);
    console.log(`  ✓ ${res.status} ${rel}`);
  }
}

async function createImageContainer(imageUrl, opts = {}) {
  const params = { image_url: imageUrl, ...opts };
  const { id } = await graphApi(`/${IG_USER_ID}/media`, params, "POST");
  return id;
}

async function publishContainer(creationId) {
  const { id } = await graphApi(
    `/${IG_USER_ID}/media_publish`,
    { creation_id: creationId },
    "POST"
  );
  return id;
}

async function waitForContainer(containerId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await graphApi(`/${containerId}`, {
      fields: "status_code,status"
    });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") {
      throw new Error(`Container failed: ${JSON.stringify(status)}`);
    }
    await sleep(3000);
  }
  throw new Error(`Container ${containerId} timed out`);
}

async function publishSinglePost(relativePath, caption) {
  const url = publicUrl(relativePath);
  console.log(`  → Post: ${relativePath}`);
  console.log(`    URL: ${url}`);

  const containerId = await createImageContainer(url, { caption });
  await waitForContainer(containerId);
  const mediaId = await publishContainer(containerId);
  console.log(`  ✓ Publicado: ${mediaId}`);
  return mediaId;
}

async function publishCarousel(carouselId, caption) {
  const dir = path.join(PACK, "Carousels", carouselId);
  if (!fs.existsSync(dir)) throw new Error(`Carousel não encontrado: ${carouselId}`);

  const slides = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .slice(0, 10); // Instagram max 10

  console.log(`  → Carousel: ${carouselId} (${slides.length} slides)`);

  const childIds = [];
  for (const slide of slides) {
    const url = publicUrl(`Carousels/${carouselId}/${slide}`);
    console.log(`    slide: ${slide}`);
    const id = await createImageContainer(url, { is_carousel_item: true });
    await waitForContainer(id);
    childIds.push(id);
    await sleep(2000);
  }

  const carouselContainer = await graphApi(`/${IG_USER_ID}/media`, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption
  }, "POST");

  await waitForContainer(carouselContainer.id);
  const mediaId = await publishContainer(carouselContainer.id);
  console.log(`  ✓ Carousel publicado: ${mediaId}`);
  return mediaId;
}

async function publishStory(relativePath) {
  const url = publicUrl(relativePath);
  console.log(`  → Story: ${relativePath}`);

  // Stories via Graph API
  const containerId = await createImageContainer(url, { media_type: "STORIES" });
  await waitForContainer(containerId);
  const mediaId = await publishContainer(containerId);
  console.log(`  ✓ Story publicada: ${mediaId}`);
  return mediaId;
}

async function runPriority(dryRun) {
  console.log(`\n📋 Fila prioritária (${PRIORITY_QUEUE.length} items)\n`);
  const results = [];

  for (const item of PRIORITY_QUEUE) {
    if (dryRun) {
      console.log(`[DRY-RUN] ${item.type}: ${item.id ?? item.file}`);
      continue;
    }

    try {
      let mediaId;
      if (item.type === "carousel") {
        mediaId = await publishCarousel(item.id, item.caption);
      } else if (item.type === "post") {
        mediaId = await publishSinglePost(item.file, item.caption);
      } else if (item.type === "story") {
        mediaId = await publishStory(`Stories/${path.basename(item.file)}`);
      }
      results.push({ ...item, mediaId, ok: true });
    } catch (err) {
      console.error(`  ✗ Erro: ${err.message}`);
      results.push({ ...item, error: err.message, ok: false });
    }

    const delay = item.type === "story" ? STORY_DELAY_MS : DELAY_MS;
    console.log(`  ⏳ Aguardando ${delay / 1000}s...\n`);
    await sleep(delay);
  }

  return results;
}

function buildAllQueue() {
  return buildContentPool({
    captionFor: (type, id) => captionFor(type, id)
  });
}

function buildStrategicFeedQueue() {
  return buildStrategicQueue(buildAllQueue());
}

async function runQueue(queue, dryRun, label, { resume = false, skipCaptionDupes = true } = {}) {
  const published = resume ? loadPublishedKeys() : new Set();
  let pending = resume ? queue.filter((item) => !published.has(itemKey(item))) : queue;

  const profileCaptions = loadProfileCaptionFingerprints();
  if (skipCaptionDupes && profileCaptions.size) {
    const before = pending.length;
    pending = pending.filter((item) => !shouldSkipDuplicateCaption(item, profileCaptions));
    const skipped = before - pending.length;
    if (skipped) console.log(`🚫 ${skipped} items ignorados (legenda já no perfil)\n`);
  }

  if (resume && published.size) {
    console.log(`↩️  Resume: ${published.size} já publicados, ${pending.length} restantes\n`);
  }

  console.log(`\n📋 ${label} (${pending.length} items)\n`);
  const results = [];

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    const progress = `[${i + 1}/${pending.length}]`;

    if (dryRun) {
      const detail = item.note ? ` (${item.note})` : "";
      console.log(`${progress} [DRY-RUN] ${item.type}: ${item.id ?? item.file}${detail}`);
      continue;
    }

    try {
      let mediaId;
      if (item.type === "carousel") {
        console.log(`${progress} Carousel: ${item.id}`);
        mediaId = await publishCarousel(item.id, item.caption);
      } else if (item.type === "post") {
        console.log(`${progress} Post: ${item.file}`);
        mediaId = await publishSinglePost(item.file, item.caption);
      } else if (item.type === "story") {
        console.log(`${progress} Story: ${item.file}${item.note ? ` (${item.note})` : ""}`);
        mediaId = await publishStory(item.file);
      }
      results.push({ ...item, mediaId, ok: true });
      saveProgress(item, mediaId);
    } catch (err) {
      console.error(`  ✗ Erro: ${err.message}`);
      results.push({ ...item, error: err.message, ok: false });
    }

    if (i < pending.length - 1) {
      const delay = item.type === "story" ? STORY_DELAY_MS : DELAY_MS;
      console.log(`  ⏳ Aguardando ${delay / 1000}s...\n`);
      await sleep(delay);
    }
  }

  return results;
}

async function runAll(dryRun, resume = false) {
  const queue = buildAllQueue();
  return runQueue(queue, dryRun, "Publicação completa", { resume });
}

async function runStrategic(dryRun, resume = false, batchLimit = 0) {
  let queue = buildStrategicFeedQueue();
  if (resume) {
    const published = loadPublishedKeys();
    queue = queue.filter((item) => !published.has(itemKey(item)));
  }
  if (batchLimit > 0) queue = queue.slice(0, batchLimit);

  const mix = summarizeQueue(queue);
  console.log("\n🎯 Mix estratégico (feed premium):");
  for (const [pillar, count] of Object.entries(mix).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${pillar}: ${count}`);
  }
  console.log("");

  // Preview da ordem (primeiros 8)
  console.log("📐 Ordem dos primeiros posts:");
  queue.slice(0, 8).forEach((item, i) => {
    const label = item.id ?? path.basename(item.file);
    console.log(`   ${i + 1}. [${item.pillar}] ${item.type}: ${label}`);
  });
  if (queue.length > 8) console.log(`   … +${queue.length - 8} mais\n`);

  return runQueue(queue, dryRun, "Publicação estratégica (feed premium)", { resume: false });
}

// ── Main ──
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verifyOnly = args.includes("--verify");
const all = args.includes("--all");
const strategic = args.includes("--strategic");
const resume = args.includes("--resume");
const batchIdx = args.indexOf("--batch");
const batchLimit = batchIdx >= 0 ? Number(args[batchIdx + 1] || 0) : 0;
const priority =
  !all && !strategic && (args.includes("--priority") || (args.length === 0 && !verifyOnly));

if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
  console.error(`
╔══════════════════════════════════════════════════════════════╗
║  CREDENCIAIS META NÃO ENCONTRADAS                            ║
╠══════════════════════════════════════════════════════════════╣
║  Adicione ao Cursor Environment Secrets:                     ║
║    IG_USER_ID       = Instagram Business Account ID          ║
║    IG_ACCESS_TOKEN  = Page Access Token (long-lived)         ║
║                                                              ║
║  Permissões necessárias:                                     ║
║    instagram_basic, instagram_content_publish                ║
╚══════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

console.log("FitConnect Instagram Publisher");
console.log(`Pack: ${PACK}`);
console.log(`Public URL base: ${PUBLIC_BASE}`);
console.log(`Dry-run: ${dryRun}\n`);

try {
  if (!dryRun) await verifyCredentials();
  await syncProfileIfNeeded();

  const queueToVerify = strategic
    ? buildStrategicFeedQueue().slice(0, 3)
    : all
      ? buildAllQueue().slice(0, 3)
      : PRIORITY_QUEUE;
  if (!dryRun) await verifyPublicUrls(queueToVerify);

  if (verifyOnly) {
    const total = all ? buildAllQueue().length : PRIORITY_QUEUE.length;
    console.log(`\n✅ Credenciais e URLs OK — pronto para publicar (${total} items).`);
    process.exit(0);
  }

  let results = [];

  if (strategic) {
    const full = buildStrategicFeedQueue();
    const published = resume ? loadPublishedKeys() : new Set();
    const pending = resume ? full.filter((i) => !published.has(itemKey(i))) : full;
    const count = batchLimit > 0 ? Math.min(batchLimit, pending.length) : pending.length;
    console.log(
      `\n🎯 Modo --strategic: ${count} items nesta sessão (${pending.length} pendentes no total)\n`
    );
    results = await runStrategic(dryRun, resume, batchLimit);
  } else if (all) {
    const queue = buildAllQueue();
    const carousels = queue.filter((q) => q.type === "carousel").length;
    const posts = queue.filter((q) => q.type === "post").length;
    const stories = queue.filter((q) => q.type === "story").length;
    const reelCovers = queue.filter((q) => q.note === "reel-cover").length;
    console.log(
      `\n📦 Modo --all: ${queue.length} items (${carousels} carousels, ${posts} posts, ${stories} stories incl. ${reelCovers} reel covers)\n`
    );
    results = await runAll(dryRun, resume);
  } else if (priority) {
    results = await runPriority(dryRun);
  }

  if (results.length) {
    const ok = results.filter((r) => r.ok).length;
    const fail = results.filter((r) => r.ok === false).length;
    console.log(`\n✅ Concluído: ${ok} publicados, ${fail} falhas`);
  }
} catch (err) {
  console.error(`\n❌ Falha: ${err.message}`);
  process.exit(1);
}
