#!/usr/bin/env node
/** Copy content/instagram/* to apps/web/public/instagram/ for Vercel */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "content/instagram");
const DEST = path.join(ROOT, "apps/web/public/instagram");

function copyDir(sub) {
  const from = path.join(SRC, sub);
  const to = path.join(DEST, sub);
  if (!fs.existsSync(from)) return 0;
  fs.mkdirSync(to, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(from)) {
    const srcFile = path.join(from, f);
    if (fs.statSync(srcFile).isDirectory()) continue;
    fs.copyFileSync(srcFile, path.join(to, f));
    n++;
  }
  return n;
}

const assets = copyDir("assets");
const generated = copyDir("generated");
console.log(`SYNC_PUBLIC_OK (${assets} assets, ${generated} videos)`);
