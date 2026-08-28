#!/usr/bin/env node
/** Publish all manifest posts in order with rate-limit delays */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DELAY_MS = Number(process.env.INSTAGRAM_PUBLISH_DELAY_MS ?? 25_000);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, "content/instagram/manifest.json"), "utf8")
  );
  const results = [];

  for (let i = 0; i < manifest.posts.length; i++) {
    const post = manifest.posts[i];
    console.log(`\n[${i + 1}/${manifest.posts.length}] publishing ${post.id}…`);
    const r = spawnSync(
      "node",
      ["scripts/instagram/publish.mjs", "--post", post.id],
      { cwd: ROOT, stdio: "inherit", shell: false }
    );
    results.push({ post: post.id, ok: r.status === 0, at: new Date().toISOString() });
    if (r.status !== 0) {
      console.error(`STOP at ${post.id} — fix and rerun: pnpm instagram:publish -- --post ${post.id}`);
      break;
    }
    if (i < manifest.posts.length - 1) {
      console.log(`waiting ${DELAY_MS / 1000}s…`);
      await sleep(DELAY_MS);
    }
  }

  const logPath = path.join(ROOT, "content/instagram/publish-log.json");
  const prev = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, "utf8")) : [];
  fs.writeFileSync(logPath, JSON.stringify([...prev, ...results], null, 2));
  console.log("\nINSTAGRAM_PUBLISH_ALL_DONE");
}

main();
