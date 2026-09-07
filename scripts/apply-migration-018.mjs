/**
 * Apply supabase/migrations/018_workout_wave2.sql using DIRECT_URL or DATABASE_URL.
 * Loads .env.local when present. Does not print connection strings.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2];
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

function statementsFromMigration(sql) {
  return sql
    .split(/\r?\n--;;\r?\n/)
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      const lines = part.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("--"));
      return lines.length > 0;
    });
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const url = (process.env.DIRECT_URL || process.env.DATABASE_URL || "").trim();
if (!url) {
  console.error("APPLY_018_SKIPPED: no DATABASE_URL/DIRECT_URL");
  process.exit(2);
}

const sql = readFileSync(
  path.join(root, "supabase/migrations/018_workout_wave2.sql"),
  "utf8"
);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
let applied = 0;
for (const statement of statementsFromMigration(sql)) {
  await client.query(statement);
  applied += 1;
}

const meta = await client.query(
  "select value from public.data_schema_meta where key = 'workout_wave2_schema_version'"
);
const col = await client.query(`
  select 1 as ok from information_schema.columns
  where table_schema = 'public'
    and table_name = 'strength_sessions'
    and column_name = 'idempotency_key'
`);

console.log(
  JSON.stringify({
    ok: true,
    appliedStatements: applied,
    schemaVersion: meta.rows[0]?.value ?? null,
    hasIdempotencyKey: col.rows.length > 0,
  })
);

await client.end();
