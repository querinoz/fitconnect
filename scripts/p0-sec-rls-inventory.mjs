#!/usr/bin/env node
/** Safe grants/policies inventory — no secrets printed. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const rel of [".env.local"]) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
});
await client.connect();

const grants = await client.query(`
  select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privs
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (
      'identity_profiles','user_roles','user_preferences','onboarding_state',
      'account_deletion_requests','profiles'
    )
    and grantee in ('anon','authenticated','service_role')
  group by table_name, grantee
  order by table_name, grantee
`);
console.log("GRANTS=" + JSON.stringify(grants.rows));

const pols = await client.query(`
  select tablename, policyname, cmd, roles::text
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'identity_profiles','user_roles','user_preferences','onboarding_state',
      'account_deletion_requests','profiles'
    )
  order by tablename, policyname
`);
console.log("POLICIES=" + JSON.stringify(pols.rows));

await client.end();
