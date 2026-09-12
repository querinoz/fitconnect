#!/usr/bin/env node
/**
 * Reconcile the migration registry against the schema that is actually in force.
 *
 * Why this exists: on 2026-09-10, migration 014 was recorded as applied in
 * public.schema_migrations. It creates public.community_posts, enables AND forces row
 * level security on it, and creates three policies. The live database had
 * relrowsecurity = false, relforcerowsecurity = true, and zero policies -- and FORCE
 * does nothing while RLS is off. Separately, 017's tables and policies were physically
 * present while 017 was absent from the registry.
 *
 *   "Recorded as applied" is not the same as "in force".
 *
 * This script compares six things that must all agree, and exits non-zero when they
 * do not. Read-only: it issues SELECTs against the catalog and nothing else.
 *
 *   registry   every file in supabase/migrations is recorded, and vice versa
 *   RLS        every table in `public` has row level security enabled
 *   FORCE      every table also forces it, so the owner cannot silently bypass
 *   policies   a table with RLS on has at least one policy, or is declared server-only
 *   grants     `anon` holds no INSERT / UPDATE / DELETE anywhere in `public`
 *   identity   no policy calls auth.uid(); this schema's identity is firebase_uid()
 *
 * Usage:
 *   node scripts/db-reconcile-schema.mjs            # report, exit 1 on drift
 *   node scripts/db-reconcile-schema.mjs --json     # machine-readable
 *
 * Reads DIRECT_URL from .env.local / apps/web/.env.local, same as the other db scripts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asJson = process.argv.includes("--json");

/**
 * Tables that are intentionally RLS-on with zero policies. RLS with no policy denies
 * every role that does not bypass it, so this is fail-closed on purpose: these tables
 * are written only through a privileged server path (postgres / service_role, both
 * rolbypassrls). Adding a table here is a decision, not a silencing -- say why.
 */
const SERVER_ONLY_TABLES = new Set([
  // Prisma-managed Strava mirror. AGENTS.md 3: tokens never leave the server.
  "StravaConnection",
  "StravaActivity",
  "StravaActivityLap",
  "StravaSegmentEffort",
  // Migration bookkeeping.
  "schema_migrations",
  "_prisma_migrations",
  // Stripe webhook idempotency ledger; written by the webhook handler only.
  "stripe_processed_events",
  // Spot moderation trail; no client report flow is exposed (see migration 021).
  "training_spot_reports",
  "training_spot_audit",
  // Legacy 002-010 tables, pending the legacy-schema decision. Deny-all today.
  "sessions",
  "programs",
  "program_enrollments",
  "readiness_scores",
  "hrv_readings",
  "push_tokens",
  "notifications"
]);

/** Deprecated tables: no client grants expected at all. */
const DEPRECATED_TABLES = new Set(["workout_sessions"]);

/**
 * Tables whose policies still call auth.uid(), knowingly. These are the pre-Firebase
 * tables from migrations 001-011; 012 moved identity to a text Firebase UID and
 * public.firebase_uid(). Their client grants have been removed (migrations 027/028),
 * so the broken predicate is unreachable from a client. They are downgraded to WARN
 * here so that a NEW auth.uid() policy on a live table still fails the gate.
 *
 * This list is an accepted exception with a reason, not a mute button. Remove an entry
 * when the table is dropped or migrated -- never add one to make the report green.
 */
const LEGACY_AUTH_UID_TABLES = new Set([
  "profiles",          // 001, uuid -> auth.users; 012 says this path is unused
  "athlete_profiles",  // 003
  "workout_sessions"   // 011, superseded by public.activities (016)
]);

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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const CATALOG_SQL = `
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced,
       (select count(*)::int from pg_policies p
         where p.schemaname = 'public' and p.tablename = c.relname) as policy_count,
       has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
       has_table_privilege('anon', c.oid, 'INSERT') as anon_insert,
       has_table_privilege('anon', c.oid, 'UPDATE') as anon_update,
       has_table_privilege('anon', c.oid, 'DELETE') as anon_delete
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by c.relname;
`;

const AUTH_UID_SQL = `
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and (coalesce(qual, '') ~* 'auth\\.uid' or coalesce(with_check, '') ~* 'auth\\.uid')
order by tablename, policyname;
`;

const UNPINNED_WRITE_SQL = `
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and cmd in ('INSERT', 'UPDATE', 'ALL')
  and coalesce(with_check, '') !~* 'firebase_uid|auth\\.uid'
  and coalesce(qual, '')       !~* 'firebase_uid|auth\\.uid'
order by tablename, policyname;
`;

async function main() {
  loadEnvFiles();
  delete process.env.DATABASE_URL;
  const url = process.env.DIRECT_URL;
  if (!url) {
    console.error("DIRECT_URL required (set it in .env.local)");
    process.exit(2);
  }

  // Supabase requires TLS; a local Postgres (CI's integration service, or a scratch
  // replica) does not offer it and refuses the connection outright.
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
  const client = new pg.Client({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
  await client.connect();

  const findings = [];
  const add = (severity, check, detail) => findings.push({ severity, check, detail });

  // 1. registry vs files on disk
  const migrationsDir = path.join(root, "supabase", "migrations");
  const onDisk = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()
    : [];
  let recorded = [];
  try {
    const { rows } = await client.query("select filename from public.schema_migrations order by filename");
    recorded = rows.map((r) => r.filename);
  } catch {
    add("ERROR", "registry", "public.schema_migrations is not readable — cannot reconcile");
  }
  const recordedSet = new Set(recorded);
  const diskSet = new Set(onDisk);
  for (const f of onDisk) {
    if (!recordedSet.has(f)) add("ERROR", "registry", `${f} exists on disk but is not recorded as applied`);
  }
  for (const f of recorded) {
    if (!diskSet.has(f)) add("WARN", "registry", `${f} is recorded as applied but no longer exists on disk`);
  }

  // 2-5. per-table catalog state
  const { rows: tables } = await client.query(CATALOG_SQL);
  for (const t of tables) {
    const name = t.table_name;

    if (!t.rls_enabled) {
      add("ERROR", "rls", `${name}: row level security is DISABLED (exposed through PostgREST)`);
    } else if (!t.rls_forced) {
      add("WARN", "force", `${name}: RLS enabled but not FORCED — the table owner bypasses it`);
    }

    if (t.rls_enabled && t.policy_count === 0 && !SERVER_ONLY_TABLES.has(name) && !DEPRECATED_TABLES.has(name)) {
      add(
        "WARN",
        "policies",
        `${name}: RLS on with zero policies — deny-all. Intended? Add it to SERVER_ONLY_TABLES with a reason, or write the policy.`
      );
    }

    if (t.anon_insert || t.anon_update || t.anon_delete) {
      const verbs = [t.anon_insert && "INSERT", t.anon_update && "UPDATE", t.anon_delete && "DELETE"]
        .filter(Boolean)
        .join("/");
      add("ERROR", "grants", `${name}: anon holds ${verbs}. No write policy in this schema can be satisfied anonymously, so the grant backs nothing.`);
    }

    if (DEPRECATED_TABLES.has(name) && t.anon_select) {
      add("WARN", "grants", `${name}: deprecated but still readable by anon`);
    }
  }

  // 6. identity function
  const { rows: authUid } = await client.query(AUTH_UID_SQL);
  for (const p of authUid) {
    const known = LEGACY_AUTH_UID_TABLES.has(p.tablename);
    add(
      known ? "WARN" : "ERROR",
      "identity",
      `${p.tablename}.${p.policyname} (${p.cmd}) calls auth.uid(). Supabase defines it as (jwt sub)::uuid; a Firebase UID is text, so this raises 22P02 rather than filtering rows. Use public.firebase_uid().` +
        (known ? " [known legacy table — client grants removed by 027/028]" : "")
    );
  }

  const { rows: unpinned } = await client.query(UNPINNED_WRITE_SQL);
  for (const p of unpinned) {
    add("ERROR", "identity", `${p.tablename}.${p.policyname} (${p.cmd}) is a write policy with no identity predicate`);
  }

  await client.end();

  const errors = findings.filter((f) => f.severity === "ERROR");
  const warns = findings.filter((f) => f.severity === "WARN");

  if (asJson) {
    console.log(JSON.stringify({ tables: tables.length, migrations: { onDisk: onDisk.length, recorded: recorded.length }, findings }, null, 2));
  } else {
    console.log(`\nSchema reconciliation — ${tables.length} tables, ${onDisk.length} migration files, ${recorded.length} recorded\n`);
    if (findings.length === 0) {
      console.log("  registry, RLS, FORCE, policies, grants and identity all agree.\n");
    } else {
      for (const group of ["ERROR", "WARN"]) {
        const rows = findings.filter((f) => f.severity === group);
        if (!rows.length) continue;
        console.log(`${group} (${rows.length})`);
        for (const f of rows) console.log(`  [${f.check}] ${f.detail}`);
        console.log("");
      }
    }
    console.log(`${errors.length} error(s), ${warns.length} warning(s)\n`);
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("reconciliation failed:", err instanceof Error ? err.message : err);
  process.exit(2);
});
