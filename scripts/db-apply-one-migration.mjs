#!/usr/bin/env node
/**
 * Apply a single supabase migration file safely (no reset).
 * Usage: node scripts/db-apply-one-migration.mjs 022_unified_identity_capabilities.sql
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { postgresSslOption } from "./lib/pg-ssl.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node scripts/db-apply-one-migration.mjs <filename.sql>");
  process.exit(1);
}

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

loadEnvFiles();
delete process.env.DATABASE_URL;
const url = process.env.DIRECT_URL;
if (!url) {
  console.error("DIRECT_URL required");
  process.exit(1);
}

const filePath = path.join(root, "supabase", "migrations", fileArg);
if (!fs.existsSync(filePath)) {
  console.error("missing", filePath);
  process.exit(1);
}

const stmts = fs
  .readFileSync(filePath, "utf8")
  .split(/\r?\n--;;\r?\n/)
  .map((s) => s.trim())
  .filter((s) => {
    if (!s) return false;
    const lines = s.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("--"));
    return lines.length > 0;
  });

const client = new pg.Client({ connectionString: url, ssl: postgresSslOption(url) });
await client.connect();
await client.query(`
  create table if not exists public.schema_migrations (
    filename text primary key,
    applied_at timestamptz not null default now()
  );
`);
const { rows } = await client.query(
  "select 1 from public.schema_migrations where filename = $1",
  [fileArg]
);
if (rows.length) {
  console.log("already applied", fileArg);
  await client.end();
  process.exit(0);
}

console.log("apply", fileArg, `(${stmts.length} statements)`);
await client.query("begin");
try {
  for (const [i, sql] of stmts.entries()) {
    await client.query(sql);
    console.log("ok", i + 1, "/", stmts.length);
  }
  await client.query("insert into public.schema_migrations (filename) values ($1)", [fileArg]);
  await client.query("commit");
  console.log("APPLIED_OK", fileArg);
} catch (err) {
  await client.query("rollback");
  console.error("ROLLED_BACK", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
