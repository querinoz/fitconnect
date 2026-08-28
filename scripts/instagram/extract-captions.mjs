#!/usr/bin/env node
/** Parse LEGENDAS markdown files into content/instagram/captions/postNN.txt */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "content/instagram/captions");

function extractPosts(markdown) {
  const posts = [];
  const blocks = markdown.split(/^## POST /m).slice(1);
  for (const block of blocks) {
    const idMatch = block.match(/^(\d+)/);
    if (!idMatch) continue;
    const id = `post${idMatch[1].padStart(2, "0")}`;
    const lines = block.split("\n");
    const captionLines = [];
    let inCaption = false;
    for (const line of lines) {
      if (line.startsWith("**Ficheiro") || line.startsWith("**Áudio")) {
        inCaption = true;
        continue;
      }
      if (line.startsWith("---")) break;
      if (line.startsWith("## ")) break;
      if (!inCaption && line.trim() === "") continue;
      if (!inCaption && !line.startsWith("**")) {
        inCaption = true;
      }
      if (inCaption && line.trim()) captionLines.push(line);
    }
    const caption = captionLines
      .filter((line) => !/^\d{2}\s+—/.test(line.trim()))
      .filter((line) => !line.startsWith("**"))
      .join("\n")
      .trim();
    if (caption) posts.push({ id, caption });
  }
  return posts;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = [
    path.join(ROOT, "fitconnectinstagramkit/out/LEGENDAS.md"),
    path.join(ROOT, "fitconnectinstagramkit/out/LEGENDAS_07_18.md")
  ];
  let count = 0;
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn("skip missing", file);
      continue;
    }
    const posts = extractPosts(fs.readFileSync(file, "utf8"));
    for (const { id, caption } of posts) {
      fs.writeFileSync(path.join(OUT, `${id}.txt`), caption, "utf8");
      console.log(`caption ${id}.txt (${caption.length} chars)`);
      count++;
    }
  }
  console.log(`INSTAGRAM_CAPTIONS_OK (${count})`);
}

main();
