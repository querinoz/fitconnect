#!/usr/bin/env node
/**
 * Apply supabase/migrations/*.sql to DATABASE_URL (direct Postgres).
 * Splits on --;; markers (FitConnect migration convention).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(root, "supabase", "migrations");

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

function statementsFromFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n--;;\r?\n/)
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      // Drop header comment blocks (no executable SQL).
      const lines = s.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("--"));
      return lines.length > 0;
    });
}

async function main() {
  loadEnvFiles();
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("DIRECT_URL or DATABASE_URL required");
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    create table if not exists public.schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  for (const file of files) {
    const { rows } = await client.query(
      "select 1 from public.schema_migrations where filename = $1",
      [file]
    );
    if (rows.length) {
      console.log("skip", file);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const stmts = statementsFromFile(filePath);
    console.log("apply", file, `(${stmts.length} statements)`);
    for (const [i, sql] of stmts.entries()) {
      try {
        await client.query(sql);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`failed ${file} statement ${i + 1}/${stmts.length}: ${message}`);
        throw err;
      }
    }
    await client.query("insert into public.schema_migrations (filename) values ($1)", [file]);
  }

  await client.end();
  console.log("SUPABASE_MIGRATIONS_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
