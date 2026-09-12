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
 * This script compares eight things that must all agree, and exits non-zero when they
 * do not. Read-only: it issues SELECTs against the catalog and nothing else.
 *
 *   registry    every file in supabase/migrations is recorded, and vice versa
 *   RLS         every table in `public` has row level security enabled
 *   FORCE       every table also forces it, so the owner cannot silently bypass
 *   policies    a table with RLS on has at least one policy, or is declared server-only
 *   grants      no client role holds a write privilege: INSERT / UPDATE / DELETE, and also
 *               TRUNCATE / TRIGGER / REFERENCES, none of which RLS constrains at all
 *   identity    no policy calls auth.uid(); this schema's identity is firebase_uid()
 *   server-only a table DECLARED server-only holds no anon/authenticated grant at all
 *   public-read  the anonymous READ surface is exactly the declared one, nothing more
 *
 * The last one was added on 2026-09-12 for the mirror image of the opening lesson: ten of
 * the sixteen tables this script declared server-only still granted `authenticated`
 * DELETE/INSERT/SELECT/UPDATE on production. RLS-forced-with-no-policies made every one of
 * those grants unreachable, which is precisely why nobody noticed -- and the whole of that
 * safety rested on no policy existing. Migration 030 revoked them.
 *
 *   "Granted" is not the same as "reachable" -- and an unreachable grant still lies.
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
import { postgresSslOption } from "./lib/pg-ssl.mjs";

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

/**
 * The intended ANONYMOUS READ surface: tables where a SELECT (or ALL) policy deliberately
 * does NOT require an identity, so a visitor holding only the publishable key can read rows.
 *
 * Why this list exists: every other check here guards writes. UNPINNED_WRITE_SQL catches an
 * INSERT/UPDATE/ALL policy with no identity predicate, but nothing caught the read side, and
 * a `USING (true)` SELECT policy on the wrong table is a silent public data feed. Measured on
 * production 2026-09-12, `anon` held SELECT on 33 tables -- including payment_transactions,
 * stripe_connect_accounts, user_subscriptions, profiles and body_weight_entries. Those grants
 * turned out to be inert: every SELECT policy on them requires an identity, so an anonymous
 * read returns zero rows. The genuinely anonymous surface was exactly the nine below.
 *
 * That was established by reading the catalog once. This list makes it an invariant: a tenth
 * table becomes an ERROR rather than a discovery.
 *
 * Adding an entry is a decision about what the product publishes to the world. Say why.
 */
const PUBLIC_READ_TABLES = new Map([
  ["badge_definitions", "reference data: badge catalogue, no user rows"],
  ["coach_profiles", "the coach directory is the marketplace's public shopfront"],
  ["community_posts", "gated by the is_social_eligible column, not by identity (020)"],
  ["post_comments", "visible only on an is_social_eligible post, and not soft-deleted"],
  ["post_reactions", "visible only on an is_social_eligible post"],
  ["reviews", "public reviews of coaches; the point is that visitors can read them"],
  ["squad_challenges", "squads are public teams; challenge metadata is not personal"],
  ["squad_contributions", "squad leaderboard, published by design"],
  ["squad_members", "squad roster, published by design"]
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
       has_table_privilege('anon', c.oid, 'DELETE') as anon_delete,
       has_table_privilege('authenticated', c.oid, 'SELECT') as auth_select,
       has_table_privilege('authenticated', c.oid, 'INSERT') as auth_insert,
       has_table_privilege('authenticated', c.oid, 'UPDATE') as auth_update,
       has_table_privilege('authenticated', c.oid, 'DELETE') as auth_delete,
       has_table_privilege('anon', c.oid, 'TRUNCATE') as anon_truncate,
       has_table_privilege('anon', c.oid, 'TRIGGER') as anon_trigger,
       has_table_privilege('anon', c.oid, 'REFERENCES') as anon_references,
       has_table_privilege('authenticated', c.oid, 'TRUNCATE') as auth_truncate,
       has_table_privilege('authenticated', c.oid, 'TRIGGER') as auth_trigger,
       has_table_privilege('authenticated', c.oid, 'REFERENCES') as auth_references
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

/**
 * SELECT/ALL policies with no identity predicate, on tables `anon` can actually read.
 * Both halves matter: a `USING (true)` policy is harmless if anon holds no grant, and an
 * anon grant is harmless if every policy demands an identity. The intersection is the real
 * anonymous read surface.
 */
const ANON_READ_SURFACE_SQL = `
select p.tablename, p.policyname, p.cmd, coalesce(p.qual, '') as qual
from pg_policies p
join pg_class c on c.relname = p.tablename
join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
where p.schemaname = 'public'
  and p.cmd in ('SELECT', 'ALL')
  and coalesce(p.qual, '') !~* 'firebase_uid|auth\\.uid'
  and has_table_privilege('anon', c.oid, 'SELECT')
order by p.tablename, p.policyname;
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

  const client = new pg.Client({
    connectionString: url,
    ssl: postgresSslOption(url)
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

    // TRUNCATE, TRIGGER and REFERENCES are NOT subject to row level security. PostgreSQL
    // documents TRUNCATE as not subject to row security policies; TRIGGER lets a role attach
    // a function that runs on other roles' writes; REFERENCES lets a role probe for values it
    // cannot select. Every other protection in this schema is an RLS policy, so for these
    // three there is no protection at all, whatever 029 forced.
    //
    // This check exists because the previous one defined "write" as exactly INSERT, UPDATE and
    // DELETE. On 2026-09-12 that definition let `anon` hold TRUNCATE on 28 tables and TRIGGER
    // on 32 while 028 was named "anon_is_read_only" and every report repeated it. Migration
    // 032 revoked them. A gate that checks three verbs will keep missing the fourth.
    for (const [role, flags] of [
      ["anon", { TRUNCATE: t.anon_truncate, TRIGGER: t.anon_trigger, REFERENCES: t.anon_references }],
      ["authenticated", { TRUNCATE: t.auth_truncate, TRIGGER: t.auth_trigger, REFERENCES: t.auth_references }]
    ]) {
      const held = Object.entries(flags).filter(([, v]) => v).map(([k]) => k);
      if (held.length > 0) {
        add(
          "ERROR",
          "grants",
          `${name}: ${role} holds ${held.join("/")}. None of these is subject to row level security, so RLS does not ` +
            `constrain them and no PostgREST client needs them. Revoke (see migration 032).`
        );
      }
    }

    if (DEPRECATED_TABLES.has(name) && t.anon_select) {
      add("WARN", "grants", `${name}: deprecated but still readable by anon`);
    }

    // 7. A SERVER_ONLY_TABLES entry claims the table is reached only through a
    // rolbypassrls role. A surviving anon/authenticated grant contradicts that claim.
    //
    // Such a grant is usually inert -- these tables are RLS-forced with zero policies, so
    // the privilege cannot be exercised -- which is exactly why it goes unnoticed. Measured
    // on production 2026-09-12: ten of the sixteen declared server-only tables still
    // granted `authenticated` DELETE/INSERT/SELECT/UPDATE, including the Stripe webhook
    // idempotency ledger and a moderation audit trail. The catalog said `authenticated`
    // could delete from an audit log. Migration 030 revoked all ten.
    //
    // The safety of the inert state rests entirely on there being no policy. Add one
    // permissive policy and every surviving grant goes live at once. So: ERROR, not WARN --
    // the fix is a one-line revoke, and 024/030 set the precedent.
    if (SERVER_ONLY_TABLES.has(name)) {
      const live = [
        t.anon_select && "anon SELECT",
        t.anon_insert && "anon INSERT",
        t.anon_update && "anon UPDATE",
        t.anon_delete && "anon DELETE",
        t.auth_select && "authenticated SELECT",
        t.auth_insert && "authenticated INSERT",
        t.auth_update && "authenticated UPDATE",
        t.auth_delete && "authenticated DELETE"
      ].filter(Boolean);
      if (live.length > 0) {
        add(
          "ERROR",
          "server-only",
          `${name}: declared server-only in SERVER_ONLY_TABLES, but the catalog still grants ${live.join(", ")}. ` +
            `RLS-forced-with-no-policies makes it unreachable today, so this is latent rather than live — one ` +
            `permissive policy turns all of it on. Revoke it (see migration 030), or remove the table from ` +
            `SERVER_ONLY_TABLES and give it a policy with an identity predicate.`
        );
      }
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

  // 8. the anonymous READ surface must be exactly the declared one
  const { rows: anonRead } = await client.query(ANON_READ_SURFACE_SQL);
  const publishing = new Set();
  for (const p of anonRead) {
    publishing.add(p.tablename);
    if (PUBLIC_READ_TABLES.has(p.tablename)) continue;
    add(
      "ERROR",
      "public-read",
      `${p.tablename}.${p.policyname} (${p.cmd}) has no identity predicate AND anon holds SELECT, so anyone with the ` +
        `publishable key can read rows from it. Qualifier: ${p.qual || "(none — every row)"}. ` +
        `If that is intended, add ${p.tablename} to PUBLIC_READ_TABLES with a reason; otherwise add an identity ` +
        `predicate or revoke the anon grant.`
    );
  }
  for (const [tbl, why] of PUBLIC_READ_TABLES) {
    if (!publishing.has(tbl)) {
      add(
        "WARN",
        "public-read",
        `${tbl} is declared a public-read table ("${why}") but is no longer anonymously readable — either its policy ` +
          `gained an identity predicate or its anon grant was revoked. Remove the entry so the list keeps meaning something.`
      );
    }
  }

  // 9. an anon SELECT grant that no policy can satisfy. Inert, and misleading: the catalog
  // says a visitor can read a table that in fact returns nothing. Same class as the grants
  // migration 030 revoked, but these tables HAVE policies, so they are not server-only --
  // the fix is a revoke only if no anonymous read is ever intended, which is a product call.
  const { rows: anonGranted } = await client.query(
    `select c.relname as table_name from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r','p')
        and has_table_privilege('anon', c.oid, 'SELECT')
      order by c.relname`
  );
  const inert = anonGranted.map((r) => r.table_name).filter((t) => !publishing.has(t));
  if (inert.length > 0) {
    add(
      "WARN",
      "anon-read",
      `${inert.length} table(s) grant anon SELECT while every SELECT policy on them requires an identity, so the ` +
        `grant backs nothing and the catalog overstates what a visitor can read: ${inert.join(", ")}. ` +
        `Revoke unless an anonymous read is planned.`
    );
  }

  await client.end();

  const errors = findings.filter((f) => f.severity === "ERROR");
  const warns = findings.filter((f) => f.severity === "WARN");

  if (asJson) {
    console.log(JSON.stringify({ tables: tables.length, migrations: { onDisk: onDisk.length, recorded: recorded.length }, findings }, null, 2));
  } else {
    console.log(`\nSchema reconciliation — ${tables.length} tables, ${onDisk.length} migration files, ${recorded.length} recorded\n`);
    if (findings.length === 0) {
      console.log("  registry, RLS, FORCE, policies, grants, identity, server-only and public-read all agree.\n");
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
