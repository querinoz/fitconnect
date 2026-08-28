#!/usr/bin/env node
/**
 * Descobre IG_USER_ID e valida token para o app FitConnect Meta.
 * App ID: 2005760616744045 | Business ID: 1730537734878020
 *
 * Uso: IG_ACCESS_TOKEN=... node scripts/meta-discover.mjs
 */
const TOKEN = process.env.IG_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
const APP_ID = process.env.META_APP_ID || "2005760616744045";
const BUSINESS_ID = process.env.META_BUSINESS_ID || "1730537734878020";
const API = "https://graph.facebook.com/v21.0";
const IG_API = "https://graph.instagram.com/v21.0";

if (!TOKEN) {
  console.error("Defina IG_ACCESS_TOKEN ou META_ACCESS_TOKEN");
  process.exit(1);
}

async function get(path, base = API) {
  const url = new URL(`${base}${path}`);
  url.searchParams.set("access_token", TOKEN);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json, null, 2));
  return json;
}

console.log("FitConnect Meta Discovery");
console.log(`App ID: ${APP_ID}`);
console.log(`Business ID: ${BUSINESS_ID}\n`);

try {
  // 1. Token debug
  const debug = await get(`/debug_token?input_token=${TOKEN}`);
  const data = debug.data;
  console.log("── Token Debug ──");
  console.log(`  App ID:        ${data.app_id}`);
  console.log(`  Valid:         ${data.is_valid}`);
  console.log(`  Type:          ${data.type}`);
  console.log(`  Expires:       ${data.expires_at ? new Date(data.expires_at * 1000).toISOString() : "never"}`);
  console.log(`  Scopes:        ${(data.scopes || []).join(", ") || "n/a"}`);

  const hasPublish =
    (data.scopes || []).some((s) =>
      ["instagram_content_publish", "instagram_business_content_publish"].includes(s)
    );
  console.log(`  Can publish:   ${hasPublish ? "✓" : "✗ MISSING publish permission"}\n`);

  // 2. Facebook Login path — Pages + IG business account
  try {
    const pages = await get("/me/accounts?fields=id,name,instagram_business_account,access_token");
    console.log("── Facebook Pages ──");
    if (!pages.data?.length) {
      console.log("  (nenhuma page encontrada — tentar Instagram Login path)\n");
    } else {
      for (const page of pages.data) {
        const igId = page.instagram_business_account?.id;
        console.log(`  Page: ${page.name} (${page.id})`);
        console.log(`    IG Business ID: ${igId ?? "NOT LINKED"}`);
        if (igId) {
          try {
            const ig = await get(`/${igId}?fields=id,username,name,profile_picture_url`);
            console.log(`    Username: @${ig.username}`);
            console.log(`\n  ★ Use estes secrets:`);
            console.log(`    IG_USER_ID=${igId}`);
            console.log(`    IG_ACCESS_TOKEN=${page.access_token?.slice(0, 20)}... (page token)`);
          } catch (e) {
            console.log(`    (erro ao ler IG: ${e.message})`);
          }
        }
      }
      console.log();
    }
  } catch (e) {
    console.log(`── Facebook Pages: skip (${e.message})\n`);
  }

  // 3. Instagram Login path — direct IG user
  try {
    const me = await get("/me?fields=id,username,name", IG_API);
    console.log("── Instagram Login path ──");
    console.log(`  IG User ID:  ${me.id}`);
    console.log(`  Username:    @${me.username}`);
    console.log(`\n  ★ Use estes secrets:`);
    console.log(`    IG_USER_ID=${me.id}`);
    console.log(`    IG_ACCESS_TOKEN=<token atual>`);
    console.log(`    IG_API_HOST=graph.instagram.com`);
  } catch (e) {
    console.log(`── Instagram Login path: skip (${e.message})\n`);
  }

  // 4. Direct if IG_USER_ID already set
  if (process.env.IG_USER_ID) {
    const ig = await get(
      `/${process.env.IG_USER_ID}?fields=id,username,name`
    );
    console.log("── IG_USER_ID confirmado ──");
    console.log(`  @${ig.username} (${ig.id}) ✓\n`);
  }
} catch (err) {
  console.error("Erro:", err.message);
  process.exit(1);
}
