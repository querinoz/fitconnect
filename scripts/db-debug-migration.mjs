#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFiles() {
  for (const rel of [".env.local", "apps/web/.env.local"]) {
    const envPath = path.join(root, rel);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const file = process.argv[2] ?? "012_firebase_identity.sql";
loadEnvFiles();
const raw = fs.readFileSync(path.join(root, "supabase/migrations", file), "utf8");
const stmts = raw
  .split(/\r?\n--;;\r?\n/)
  .map((s) => s.trim())
  .filter((s) => {
    if (!s) return false;
    const lines = s.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("--"));
    return lines.length > 0;
  });

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
await client.connect();

for (let i = 0; i < stmts.length; i++) {
  try {
    await client.query(stmts[i]);
    console.log(`OK ${i + 1}/${stmts.length}`);
  } catch (e) {
    console.error(`FAIL ${i + 1}/${stmts.length}:`, e.message);
    console.error(stmts[i].slice(0, 300));
    break;
  }
}
await client.end();
