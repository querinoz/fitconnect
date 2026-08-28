#!/usr/bin/env node
/**
 * Valida setup do ambiente Instagram (sem credenciais).
 * Executar após network approval e antes de publish.
 */
const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  "https://raw.githubusercontent.com/querinoz/fitconnect/cursor/instagram-api-publish-3f4b/public/instagram-pack";

const CHECKS = [
  { name: "graph.facebook.com", url: "https://graph.facebook.com/v21.0/" },
  { name: "graph.instagram.com", url: "https://graph.instagram.com/v21.0/" },
  {
    name: "image-sample",
    url: `${PUBLIC_BASE}/Posts/22-mockup-athlete-dashboard.png`,
    expectStatus: 200
  }
];

const SECRETS = ["IG_USER_ID", "IG_ACCESS_TOKEN"];

console.log("FitConnect Instagram Environment Check\n");

let ok = 0;
let fail = 0;

for (const s of SECRETS) {
  const set = !!process.env[s];
  console.log(`  ${set ? "✓" : "✗"} Secret ${s}: ${set ? "SET" : "MISSING — reiniciar agent após adicionar"}`);
  set ? ok++ : fail++;
}

console.log();
for (const c of CHECKS) {
  try {
    const res = await fetch(c.url, { method: c.expectStatus === 200 ? "HEAD" : "GET" });
    const expected = c.expectStatus ?? [200, 400];
    const pass = Array.isArray(expected) ? expected.includes(res.status) : res.status === expected;
    console.log(`  ${pass ? "✓" : "✗"} Network ${c.name}: HTTP ${res.status}`);
    pass ? ok++ : fail++;
  } catch (e) {
    console.log(`  ✗ Network ${c.name}: ${e.message}`);
    fail++;
  }
}

const pack = "/workspace/public/instagram-pack";
try {
  const fs = await import("node:fs");
  const count = (dir) =>
    fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".png")).length : 0;
  const stories = count(`${pack}/Stories`);
  const posts = count(`${pack}/Posts`);
  const reels = count(`${pack}/Reels`);
  const carousels = fs.existsSync(`${pack}/Carousels`)
    ? fs.readdirSync(`${pack}/Carousels`).length
    : 0;
  console.log(`  ✓ Pack: ${stories} stories, ${posts} posts, ${reels} reels, ${carousels} carousels`);
  ok++;
} catch (e) {
  console.log(`  ✗ Pack: ${e.message}`);
  fail++;
}

console.log(`\n${ok} passed, ${fail} failed`);
if (fail === 0) console.log("\n✅ Ambiente pronto — execute: npm run instagram:publish");
else if (!process.env.IG_USER_ID)
  console.log("\n⚠️  Falta IG_USER_ID + IG_ACCESS_TOKEN nos Environment Secrets + reiniciar agent");
process.exit(fail > 0 ? 1 : 0);
