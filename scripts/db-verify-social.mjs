#!/usr/bin/env node
/** Verify social/ascend tables + seed rows after migration. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const rel of [".env.local", "apps/web/.env.local"]) {
  const envPath = path.join(root, rel);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
await client.connect();

const checks = [
  ["community_posts", "select count(*)::int as n from public.community_posts"],
  ["squad_challenges", "select id from public.squad_challenges where id = 'squad-fc-week'"],
  ["identity_profiles", "select count(*)::int as n from public.identity_profiles"],
  ["ascend_progress", "select count(*)::int as n from public.ascend_progress"]
];

for (const [name, sql] of checks) {
  const { rows } = await client.query(sql);
  console.log(name, JSON.stringify(rows[0]));
}

await client.end();
console.log("SUPABASE_VERIFY_OK");
