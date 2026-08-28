#!/usr/bin/env node
/**
 * One-shot setup: discover IG user ID and append vars to .env.local
 *
 * Usage:
 *   node scripts/instagram/setup-env.mjs --token EAAG...
 *   node scripts/instagram/setup-env.mjs --token EAAG... --user-id 178414...
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles } from "./load-env.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const GRAPH = "https://graph.facebook.com/v21.0";

function parseArgs() {
  const args = process.argv.slice(2);
  const token = args.find((a) => a.startsWith("--token="))?.split("=")[1]
    ?? (args.includes("--token") ? args[args.indexOf("--token") + 1] : null);
  const userId = args.find((a) => a.startsWith("--user-id="))?.split("=")[1]
    ?? (args.includes("--user-id") ? args[args.indexOf("--user-id") + 1] : null);
  return { token, userId };
}

async function discoverUserId(token) {
  const qs = new URLSearchParams({
    fields: "instagram_business_account{id,username}",
    access_token: token
  });
  const res = await fetch(`${GRAPH}/me/accounts?${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  const page = (json.data ?? []).find((p) => p.instagram_business_account);
  if (!page) {
    throw new Error(
      "No Instagram Business account linked to a Facebook Page. Link @fitconnectsports to a Page in Meta Business Suite."
    );
  }
  return {
    userId: page.instagram_business_account.id,
    username: page.instagram_business_account.username
  };
}

function upsertEnvLocal(vars) {
  const envPath = path.join(ROOT, ".env.local");
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  }
  fs.writeFileSync(envPath, content.endsWith("\n") ? content : `${content}\n`);
}

async function main() {
  const { token: argToken, userId: argUserId } = parseArgs();
  loadEnvFiles();
  const token = argToken ?? process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.error("Usage: node scripts/instagram/setup-env.mjs --token <access_token>");
    process.exit(1);
  }

  let userId = argUserId ?? process.env.INSTAGRAM_USER_ID;
  let username = "";
  if (!userId) {
    const discovered = await discoverUserId(token);
    userId = discovered.userId;
    username = discovered.username;
    console.log(`discovered @${username} → INSTAGRAM_USER_ID=${userId}`);
  }

  upsertEnvLocal({
    INSTAGRAM_ACCESS_TOKEN: token,
    INSTAGRAM_USER_ID: userId,
    INSTAGRAM_PUBLIC_MEDIA_BASE_URL: "https://fitconnect-phi.vercel.app/instagram/assets",
    INSTAGRAM_PUBLIC_VIDEO_BASE_URL: "https://fitconnect-phi.vercel.app/instagram/generated"
  });

  console.log("Updated .env.local");
  console.log("Next: pnpm instagram:status && pnpm instagram:publish -- --post post01");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
