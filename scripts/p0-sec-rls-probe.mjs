#!/usr/bin/env node
/**
 * Probe: can we obtain a non-BYPASSRLS authenticated role via SET ROLE?
 * Prints only safe metadata — never connection strings / secrets.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { postgresSslOption } from "./lib/pg-ssl.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  for (const rel of [".env.local", "apps/web/.env.local"]) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unparseable";
  }
}

async function main() {
  loadEnv();
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.log("CONNECT=FAIL reason=no_url");
    process.exit(1);
  }
  console.log("PROJECT_REF=beuiammeedpovdkmhluw");
  console.log("DB_HOST=", hostOf(url));

  const client = new pg.Client({
    connectionString: url,
    ssl: postgresSslOption(url)
  });
  await client.connect();

  const login = await client.query(`
    select current_user as login_user,
           session_user as session_user,
           (select rolsuper from pg_roles where rolname = current_user) as rolsuper,
           (select rolbypassrls from pg_roles where rolname = current_user) as rolbypassrls
  `);
  console.log("LOGIN_ROLE=", JSON.stringify(login.rows[0]));

  const roles = await client.query(`
    select rolname, rolsuper, rolbypassrls
    from pg_roles
    where rolname in ('authenticated','anon','service_role','postgres')
    order by rolname
  `);
  console.log("KNOWN_ROLES=", JSON.stringify(roles.rows));

  await client.query("begin");
  try {
    await client.query("set local role authenticated");
    const after = await client.query(`
      select current_user as current_user,
             session_user as session_user,
             (select rolsuper from pg_roles where rolname = current_user) as rolsuper,
             (select rolbypassrls from pg_roles where rolname = current_user) as rolbypassrls
    `);
    console.log("AFTER_SET_ROLE_AUTHENTICATED=", JSON.stringify(after.rows[0]));
    const row = after.rows[0];
    const valid = row.current_user === "authenticated" && !row.rolsuper && !row.rolbypassrls;
    console.log("DATABASE_ROLE_FOR_RLS_TEST=", valid ? "VALID" : "INVALID_BYPASS");
  } catch (err) {
    console.log("SET_ROLE_FAILED=", err instanceof Error ? err.message : String(err));
    console.log("DATABASE_ROLE_FOR_RLS_TEST=INVALID_BYPASS");
  } finally {
    await client.query("rollback");
  }

  const tables = await client.query(`
    select c.relname,
           c.relrowsecurity as rls,
           c.relforcerowsecurity as force_rls,
           (select count(*) from pg_policies p where p.tablename = c.relname and p.schemaname = 'public') as policy_count
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname in (
        'identity_profiles','user_roles','user_preferences','onboarding_state',
        'account_deletion_requests','profiles','workout_sessions'
      )
    order by c.relname
  `);
  console.log("TABLES=", JSON.stringify(tables.rows));

  await client.end();
  console.log("PROBE_OK");
}

main().catch((e) => {
  console.error("PROBE_FAIL", e instanceof Error ? e.message : e);
  process.exit(1);
});
