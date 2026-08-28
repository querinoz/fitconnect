/**
 * Fila estratégica premium — feed dinâmico estilo Nike.
 * Intercala pilares: educação · marca · lifestyle · produto · feature · stories.
 */
import fs from "node:fs";
import path from "node:path";

const PACK = path.resolve("/workspace/public/instagram-pack");

/** Rotação de pilares — nunca o mesmo tipo seguido */
export const STRATEGIC_ROTATION = [
  "carousel-edu",
  "abstract",
  "story-lifestyle",
  "feature",
  "lifestyle",
  "carousel-product",
  "educational",
  "mockup",
  "story-reel",
  "carousel-abstract",
  "lifestyle",
  "feature",
  "abstract",
  "carousel-lifestyle",
  "educational",
  "mockup",
  "story-lifestyle"
];

export function getPillar(item) {
  if (item.type === "carousel") {
    const id = item.id;
    if (/educational|edu/i.test(id)) return "carousel-edu";
    if (/abstract/i.test(id)) return "carousel-abstract";
    if (/features|mockup/i.test(id)) return "carousel-product";
    return "carousel-lifestyle";
  }
  if (item.type === "story") {
    return item.note === "reel-cover" ? "story-reel" : "story-lifestyle";
  }
  const base = path.basename(item.file).toLowerCase();
  if (base.includes("feature")) return "feature";
  if (base.startsWith("abstract-")) return "abstract";
  if (base.startsWith("edu-")) return "educational";
  if (base.includes("mockup")) return "mockup";
  return "lifestyle";
}

function listCarousels() {
  const dir = path.join(PACK, "Carousels");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((d) => fs.statSync(path.join(dir, d)).isDirectory())
    .sort();
}

function listPng(subdir) {
  const dir = path.join(PACK, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
}

/** Pool completo de conteúdo publicável */
export function buildContentPool({ captionFor } = {}) {
  const queue = [];

  for (const id of listCarousels()) {
    queue.push({
      type: "carousel",
      id,
      caption: captionFor?.("carousel", id) ?? "",
      pillar: null
    });
  }

  const abstractFiles = new Set(listPng("Abstract"));
  const eduFiles = new Set(listPng("Educational"));

  for (const file of listPng("Posts")) {
    // Evitar duplicar abstract/edu já publicados das pastas dedicadas
    if (abstractFiles.has(file) || eduFiles.has(file)) continue;
    const rel = `Posts/${file}`;
    queue.push({
      type: "post",
      file: rel,
      caption: captionFor?.("post", rel) ?? "",
      pillar: null
    });
  }

  for (const file of listPng("Educational")) {
    const rel = `Educational/${file}`;
    queue.push({
      type: "post",
      file: rel,
      caption: captionFor?.("post", rel) ?? "",
      pillar: null
    });
  }

  for (const file of listPng("Abstract")) {
    const rel = `Abstract/${file}`;
    queue.push({
      type: "post",
      file: rel,
      caption: captionFor?.("post", rel) ?? "",
      pillar: null
    });
  }

  for (const file of listPng("Stories")) {
    queue.push({
      type: "story",
      file: `Stories/${file}`,
      caption: "",
      pillar: null
    });
  }

  for (const file of listPng("Reels")) {
    queue.push({
      type: "story",
      file: `Reels/${file}`,
      caption: "",
      note: "reel-cover",
      pillar: null
    });
  }

  for (const item of queue) {
    item.pillar = getPillar(item);
  }

  return queue;
}

/** Intercala pilares — feed premium, sem blocos repetidos */
export function buildStrategicQueue(pool) {
  const buckets = {};
  for (const pillar of STRATEGIC_ROTATION) buckets[pillar] = [];
  buckets.other = [];

  for (const item of pool) {
    const p = item.pillar;
    if (buckets[p]) buckets[p].push(item);
    else buckets.other.push(item);
  }

  const queue = [];
  const maxLen =
    Object.values(buckets).reduce((s, b) => s + b.length, 0) + buckets.other.length;
  let safety = 0;

  while (queue.length < maxLen && safety < maxLen * 3) {
    let placed = false;
    for (const pillar of STRATEGIC_ROTATION) {
      if (buckets[pillar]?.length) {
        queue.push(buckets[pillar].shift());
        placed = true;
      }
    }
    if (buckets.other.length) {
      queue.push(buckets.other.shift());
      placed = true;
    }
    if (!placed) break;
    safety++;
  }

  // Garantir que nenhum pilar se repete em sequência
  for (let i = 1; i < queue.length; i++) {
    if (getPillar(queue[i]) === getPillar(queue[i - 1])) {
      for (let j = i + 1; j < queue.length; j++) {
        if (getPillar(queue[j]) !== getPillar(queue[i - 1])) {
          [queue[i], queue[j]] = [queue[j], queue[i]];
          break;
        }
      }
    }
  }

  return queue;
}

export function summarizeQueue(queue) {
  const counts = {};
  for (const item of queue) {
    const p = getPillar(item);
    counts[p] = (counts[p] || 0) + 1;
  }
  return counts;
}
