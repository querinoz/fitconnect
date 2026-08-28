#!/usr/bin/env node
/**
 * Analisa @fitconnectsports via Graph API e sincroniza progresso
 * para NÃO republicar conteúdo já no feed.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = "/workspace";
const PACK = path.join(ROOT, "public/instagram-pack");
const PROGRESS_FILE = path.join(ROOT, ".instagram-publish-progress.json");
const PROFILE_CACHE = path.join(ROOT, ".instagram-profile-cache.json");
const API_VERSION = "v21.0";

// Load .env.local
const envLocal = path.join(ROOT, ".env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const TOKEN = process.env.IG_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
const IG_ID = process.env.IG_USER_ID || "17841442379221775";
const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  "https://raw.githubusercontent.com/querinoz/fitconnect/cursor/instagram-api-publish-3f4b/public/instagram-pack";

const dryRun = process.argv.includes("--dry-run");

/** Legendas conhecidas → chave do pack */
const CAPTION_TO_KEY = {
  "hrv explicado": "carousel:07-educational-fitconnect",
  "mobile. ⌚ wearos": "carousel:08-mockups-product",
  "10 desportos. 1 plataforma": "carousel:02-diversity-sports",
  "treina no telemóvel. monitoriza no wearos": "carousel:03-devices-mobile-tablet-wearos",
  "coach × atleta": "carousel:01-coach-athlete-lifestyle",
  "uma identidade. vários desportos": "carousel:04-multi-sport-training",
  "recovery-aware training — treina": "carousel:05-athlete-recovery-performance",
  "ferramentas que todo coach": "carousel:06-coach-tools-deep-dive",
  "dashboard de atleta de elite": "post:Posts/22-mockup-athlete-dashboard.png",
  "3 devices. 1 plataforma": "post:Posts/23-mockup-ecosystem.png",
  "readiness score diário": "carousel:07-educational-fitconnect"
};

/** Ficheiros do pack → URL pública */
function packUrl(rel) {
  return `${PUBLIC_BASE}/${rel.replace(/\\/g, "/")}`;
}

function listPackFiles() {
  const files = [];
  const carouselsDir = path.join(PACK, "Carousels");
  if (fs.existsSync(carouselsDir)) {
    for (const id of fs.readdirSync(carouselsDir).sort()) {
      const dir = path.join(carouselsDir, id);
      if (!fs.statSync(dir).isDirectory()) continue;
      const slides = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".png"))
        .sort();
      files.push({ key: `carousel:${id}`, type: "carousel", id, slides: slides.map((s) => `Carousels/${id}/${s}`) });
    }
  }
  for (const sub of ["Posts", "Educational", "Abstract", "Stories"]) {
    const dir = path.join(PACK, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort()) {
      const rel = `${sub}/${f}`;
      const type = sub === "Stories" ? "story" : "post";
      files.push({ key: `${type}:${rel}`, type, file: rel });
    }
  }
  const reelsDir = path.join(PACK, "Reels");
  if (fs.existsSync(reelsDir)) {
    for (const f of fs.readdirSync(reelsDir).filter((f) => f.endsWith(".png")).sort()) {
      files.push({ key: `story:Reels/${f}`, type: "story", file: `Reels/${f}`, note: "reel-cover" });
    }
  }
  return files;
}

function captionFingerprint(caption) {
  return (caption || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function matchCaptionToKey(caption) {
  const lower = (caption || "").toLowerCase();
  for (const [needle, key] of Object.entries(CAPTION_TO_KEY)) {
    if (lower.includes(needle)) return key;
  }
  return null;
}

async function fetchProfileMedia() {
  const fields = encodeURIComponent(
    "id,caption,media_type,timestamp,permalink,media_url,children{media_url,media_type}"
  );
  let url = `https://graph.facebook.com/${API_VERSION}/${IG_ID}/media?fields=${fields}&limit=100&access_token=${TOKEN}`;
  const all = [];
  while (url) {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    all.push(...(data.data || []));
    url = data.paging?.next;
  }
  return all;
}

async function hashUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

async function buildProfileHashes(media) {
  const hashes = new Map(); // hash -> mediaId
  for (const m of media) {
    const urls = [m.media_url];
    if (m.children?.data) {
      for (const c of m.children.data) urls.push(c.media_url);
    }
    for (const u of urls.filter(Boolean)) {
      const h = await hashUrl(u);
      if (h && !hashes.has(h)) hashes.set(h, m.id);
    }
  }
  return hashes;
}

async function buildPackHashes(packFiles) {
  const hashes = new Map(); // hash -> pack key
  for (const item of packFiles) {
    const paths =
      item.type === "carousel"
        ? item.slides.map((s) => path.join(PACK, s))
        : [path.join(PACK, item.file)];
    for (const p of paths) {
      if (!fs.existsSync(p)) continue;
      const buf = fs.readFileSync(p);
      const h = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 20);
      if (!hashes.has(h)) hashes.set(h, item.key);
    }
  }
  return hashes;
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) return { published: [] };
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
}

function saveProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

async function main() {
  if (!TOKEN) {
    console.error("❌ IG_ACCESS_TOKEN não definido");
    process.exit(1);
  }

  console.log("🔍 A analisar @fitconnectsports via Graph API...\n");

  const media = await fetchProfileMedia();
  const packFiles = listPackFiles();
  const progress = loadProgress();
  const knownKeys = new Set(progress.published.map((p) => p.key));
  const knownMediaIds = new Set(progress.published.map((p) => p.mediaId));

  // Caption analysis
  const captionGroups = {};
  for (const m of media) {
    const fp = captionFingerprint(m.caption);
    if (!captionGroups[fp]) captionGroups[fp] = [];
    captionGroups[fp].push(m);
  }
  const duplicateCaptions = Object.entries(captionGroups).filter(([, v]) => v.length > 1);

  console.log(`📊 Feed actual: ${media.length} publicações`);
  console.log(`   ${media.filter((m) => m.media_type === "CAROUSEL_ALBUM").length} carousels · ${media.filter((m) => m.media_type === "IMAGE").length} imagens`);
  console.log(`⚠️  Legendas duplicadas no feed: ${duplicateCaptions.length} grupos\n`);

  if (duplicateCaptions.length) {
    console.log("Duplicados detectados (mesma legenda):");
    for (const [cap, items] of duplicateCaptions.sort((a, b) => b[1].length - a[1].length).slice(0, 8)) {
      console.log(`   ×${items.length}  "${cap.slice(0, 55)}${cap.length > 55 ? "…" : ""}"`);
    }
    console.log("");
  }

  // Match by caption
  const captionMatches = [];
  for (const m of media) {
    const key = matchCaptionToKey(m.caption);
    if (key) captionMatches.push({ key, mediaId: m.id, method: "caption" });
  }

  console.log(`🔗 Match por legenda: ${captionMatches.length} items\n`);

  // Hash matching (sample first slide of carousels + all images)
  console.log("🔐 A calcular hashes de imagens (pode demorar)...");
  const profileHashes = await buildProfileHashes(media);
  const packHashes = await buildPackHashes(packFiles);

  const hashMatches = [];
  for (const [hash, packKey] of packHashes) {
    if (profileHashes.has(hash)) {
      hashMatches.push({
        key: packKey,
        mediaId: profileHashes.get(hash),
        method: "hash"
      });
    }
  }
  console.log(`🔗 Match por hash de imagem: ${hashMatches.length} items\n`);

  // Merge matches
  const toSync = new Map();
  for (const m of [...captionMatches, ...hashMatches]) {
    if (!toSync.has(m.key)) toSync.set(m.key, m);
  }

  // Also mark all media IDs already in progress
  for (const m of media) {
    if (knownMediaIds.has(m.id)) continue;
    // Try to find unmatched media by caption fingerprint for default posts
    const key = matchCaptionToKey(m.caption);
    if (key && !toSync.has(key)) toSync.set(key, { key, mediaId: m.id, method: "caption-live" });
  }

  let added = 0;
  for (const [key, match] of toSync) {
    if (knownKeys.has(key)) continue;
    progress.published.push({
      key,
      mediaId: match.mediaId,
      at: new Date().toISOString(),
      source: `profile-sync:${match.method}`
    });
    knownKeys.add(key);
    added++;
    console.log(`  + sync: ${key} (${match.method})`);
  }

  // Save profile cache for publisher
  const cache = {
    syncedAt: new Date().toISOString(),
    username: "fitconnectsports",
    feedCount: media.length,
    mediaIds: media.map((m) => m.id),
    captionFingerprints: media.map((m) => ({
      id: m.id,
      type: m.media_type,
      fp: captionFingerprint(m.caption),
      timestamp: m.timestamp
    })),
    duplicateCaptionGroups: duplicateCaptions.map(([cap, items]) => ({
      caption: cap,
      count: items.length,
      ids: items.map((i) => i.id)
    })),
    syncedKeys: [...toSync.keys()]
  };

  if (!dryRun) {
    saveProgress(progress);
    fs.writeFileSync(PROFILE_CACHE, JSON.stringify(cache, null, 2));
  }

  // What's safe to post
  const allKeys = new Set(packFiles.map((f) => f.key));
  const posted = knownKeys;
  const pending = [...allKeys].filter((k) => !posted.has(k));

  console.log(`\n✅ Sincronização: +${added} novos keys marcados como publicados`);
  console.log(`📦 Pack total: ${allKeys.size} | Já no perfil/progresso: ${posted.size} | Pendentes: ${pending.length}`);

  if (!dryRun) {
    console.log(`\n💾 Guardado: ${PROGRESS_FILE}`);
    console.log(`💾 Cache: ${PROFILE_CACHE}`);
  }

  return { pending: pending.length, duplicates: duplicateCaptions.length };
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
