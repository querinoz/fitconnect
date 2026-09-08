#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function load(rel) {
  const p = path.resolve(rel);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

load(".env.local");
load("apps/web/.env.local");
delete process.env.DATABASE_URL;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const r = await client.query(`
  select
    to_regclass('public.user_capabilities') as user_capabilities,
    (select count(*)::int from public.user_roles) as user_roles,
    (select count(*)::int from public.identity_profiles) as identity_profiles,
    (select count(*)::int from public.user_subscriptions) as user_subscriptions
`);
console.log(JSON.stringify(r.rows[0], null, 2));
await client.end();
