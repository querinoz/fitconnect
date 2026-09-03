/**
 * P1-DATA: inventory live public schema (no secrets printed).
 * Usage: node --env-file=apps/web/.env.local scripts/p1-data-schema-inventory.mjs
 */
import pg from "pg";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("MISSING_DB_URL");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const tables = await client.query(`
  select table_name
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by 1
`);
console.log("LIVE_TABLES_COUNT", tables.rows.length);
console.log("LIVE_TABLES", tables.rows.map((r) => r.table_name).join(","));

const focus = [
  "workout_sessions",
  "identity_profiles",
  "ascend_events",
  "ascend_progress",
  "sessions",
  "athlete_profiles",
  "coach_profiles",
  "profiles",
  "hrv_readings",
  "readiness_scores",
  "notifications",
  "community_posts",
  "squad_challenges",
  "squad_members",
  "squad_contributions",
  "user_roles",
  "user_preferences",
  "onboarding_state",
  "push_tokens",
];

const cols = await client.query(
  `
  select table_name, column_name, data_type, udt_name, is_nullable
  from information_schema.columns
  where table_schema = 'public' and table_name = any($1::text[])
  order by table_name, ordinal_position
`,
  [focus]
);

for (const r of cols.rows) {
  console.log(
    `${r.table_name}.${r.column_name}:${r.data_type}/${r.udt_name}:null=${r.is_nullable}`
  );
}

const policies = await client.query(`
  select tablename, policyname, cmd
  from pg_policies
  where schemaname = 'public'
    and tablename = any($1::text[])
  order by tablename, policyname
`, [focus]);

console.log("POLICY_COUNT", policies.rows.length);
for (const p of policies.rows) {
  console.log(`POLICY ${p.tablename}.${p.policyname}:${p.cmd}`);
}

await client.end();
