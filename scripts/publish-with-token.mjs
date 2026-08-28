#!/usr/bin/env node
/**
 * Resolve qual IG_USER_ID é @fitconnectsports e publica.
 * Uso: META_ACCESS_TOKEN=... node scripts/publish-with-token.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TOKEN = process.env.IG_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
if (!TOKEN) {
  console.error("Defina IG_ACCESS_TOKEN ou META_ACCESS_TOKEN");
  process.exit(1);
}

const API = "https://graph.facebook.com/v21.0";

async function get(path) {
  const url = new URL(`${API}${path}`);
  url.searchParams.set("access_token", TOKEN);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

console.log("A descobrir conta @fitconnectsports...\n");

const pages = await get("/me/accounts?fields=id,name,instagram_business_account,access_token");
let target = null;

for (const page of pages.data || []) {
  const igId = page.instagram_business_account?.id;
  if (!igId) continue;
  try {
    const ig = await get(`/${igId}?fields=id,username,name`);
    console.log(`  Page: ${page.name} → @${ig.username} (${igId})`);
    if (
      ig.username?.toLowerCase() === "fitconnectsports" ||
      page.name?.toLowerCase().includes("fitconnect")
    ) {
      target = { igId, pageToken: page.access_token, username: ig.username };
    }
  } catch {
    console.log(`  Page: ${page.name} → (sem acesso IG)`);
  }
}

if (!target) {
  // fallback: primeira conta com IG
  const first = pages.data?.find((p) => p.instagram_business_account?.id);
  if (!first) throw new Error("Nenhuma conta Instagram Business encontrada");
  target = {
    igId: first.instagram_business_account.id,
    pageToken: first.access_token,
    username: "?"
  };
  console.log(`\n⚠️  @fitconnectsports não identificado — usando primeira conta: ${target.igId}`);
} else {
  console.log(`\n✓ Conta alvo: @${target.username} (${target.igId})`);
}

// Guardar em .env.local (gitignored)
const envPath = path.resolve("/workspace/.env.local");
const envContent = `IG_USER_ID=${target.igId}\nIG_ACCESS_TOKEN=${target.pageToken}\n`;
fs.writeFileSync(envPath, envContent);
console.log(`✓ Guardado em .env.local (gitignored)\n`);

// Publicar
const publishArgs = process.argv.includes("--all") ? "--all" : "--priority";
console.log(`📤 A publicar (${publishArgs})...\n`);
execSync(`node scripts/publish-instagram.mjs ${publishArgs}`, {
  stdio: "inherit",
  env: { ...process.env, IG_USER_ID: target.igId, IG_ACCESS_TOKEN: target.pageToken }
});
