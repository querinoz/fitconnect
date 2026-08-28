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
 *   node scripts/publish-instagram.mjs --carousel 07-educational-fitconnect
 *   node scripts/publish-instagram.mjs --post Posts/22-mockup-athlete-dashboard.png
 */

import fs from "node:fs";
import path from "node:path";

// Load .env.local if present (local publish without Cursor secrets)
const envLocal = path.resolve("/workspace/.env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
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

#FitConnect #AthleteLife #SportsTech #ConnectTrainPerform`
};

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
      rel = `Carousels/${item.id}/01-${fs.readdirSync(path.join(PACK, "Carousels", item.id)).sort()[0]}`;
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

// ── Main ──
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verifyOnly = args.includes("--verify");
const priority = args.includes("--priority") || (args.length === 0 && !verifyOnly);
const all = args.includes("--all");

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
  await verifyCredentials();
  await verifyPublicUrls(PRIORITY_QUEUE);

  if (verifyOnly) {
    console.log("\n✅ Credenciais e URLs OK — pronto para publicar.");
    process.exit(0);
  }

  if (priority) {
    const results = await runPriority(dryRun);
    const ok = results.filter((r) => r.ok).length;
    const fail = results.filter((r) => r.ok === false).length;
    console.log(`\n✅ Concluído: ${ok} publicados, ${fail} falhas`);
  }

  if (all) {
    console.log("\n⚠️  --all: publicação completa não implementada nesta versão.");
    console.log("    Use --priority para a fila recomendada.");
  }
} catch (err) {
  console.error(`\n❌ Falha: ${err.message}`);
  process.exit(1);
}
