/**
 * Live two-user identity RLS IDOR against Supabase project beuiammeedpovdkmhluw.
 *
 * Connection may use DIRECT_URL (postgres has BYPASSRLS) for session bootstrap only.
 * All certified assertions run after `SET LOCAL ROLE authenticated` with JWT sub claim.
 *
 * Opt-in: P0_SEC_LIVE_RLS=1
 * Never prints connection strings, passwords, or JWTs.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { postgresSslOption } from "@/lib/db/pg-ssl";

const DATABASE_URL = (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim();
const LIVE_RLS = process.env.P0_SEC_LIVE_RLS === "1";

const USER_A = "rls_test_user_a";
const USER_B = "rls_test_user_b";

function statementsFromMigration(sql: string): string[] {
  return sql
    .split(/\r?\n--;;\r?\n/)
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      const lines = part.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("--"));
      return lines.length > 0;
    });
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "unparseable";
  }
}

type RoleSnapshot = {
  current_user: string;
  session_user: string;
  rolsuper: boolean;
  rolbypassrls: boolean;
};

describe.skipIf(!DATABASE_URL || !LIVE_RLS)("identity RLS two-user IDOR (authenticated role)", () => {
  let client: pg.Client;
  let certRole: RoleSnapshot;

  async function roleSnapshot(): Promise<RoleSnapshot> {
    const { rows } = await client.query<RoleSnapshot>(`
      select current_user::text as current_user,
             session_user::text as session_user,
             (select rolsuper from pg_roles where rolname = current_user) as rolsuper,
             (select rolbypassrls from pg_roles where rolname = current_user) as rolbypassrls
    `);
    return rows[0]!;
  }

  /** Privileged connection work (seed / migration) — not used for PASS evidence. */
  async function asAdmin(fn: () => Promise<void>) {
    await client.query("begin");
    try {
      await fn();
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
  }

  /** RLS-scoped user context — certification evidence. */
  async function asAuthenticated(uid: string, fn: () => Promise<void>) {
    await client.query("begin");
    try {
      await client.query("set local role authenticated");
      await client.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
      await client.query(
        "select set_config('request.jwt.claims', $1, true)",
        [JSON.stringify({ sub: uid, role: "authenticated" })]
      );
      const snap = await roleSnapshot();
      expect(snap.current_user).toBe("authenticated");
      expect(snap.rolsuper).toBe(false);
      expect(snap.rolbypassrls).toBe(false);
      await fn();
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
  }

  beforeAll(async () => {
    if (!DATABASE_URL || !LIVE_RLS) return;
    client = new pg.Client({
      connectionString: DATABASE_URL,
      ssl: postgresSslOption(DATABASE_URL)
    });
    await client.connect();

    // Ensure identity migrations present (idempotent).
    // Do not recreate auth.jwt() — auth schema is owned by Supabase; firebase_uid()
    // prefers request.jwt.claim.sub which we set per assertion.

    for (const file of ["012_firebase_identity.sql", "013_p0_sec.sql"]) {
      const sql = readFileSync(
        path.resolve(__dirname, `../../../../supabase/migrations/${file}`),
        "utf8"
      );
      for (const statement of statementsFromMigration(sql)) {
        await client.query(statement);
      }
    }

    await client.query("begin");
    await client.query("set local role authenticated");
    certRole = await roleSnapshot();
    await client.query("rollback");

    // Safe metadata for evidence logs (no secrets).
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        PROJECT_REF: "beuiammeedpovdkmhluw",
        DB_HOST: hostOf(DATABASE_URL),
        DATABASE_ROLE_FOR_RLS_TEST:
          certRole.current_user === "authenticated" && !certRole.rolsuper && !certRole.rolbypassrls
            ? "VALID"
            : "INVALID_BYPASS",
        CERT_ROLE: certRole
      })
    );

    if (
      certRole.current_user !== "authenticated" ||
      certRole.rolsuper ||
      certRole.rolbypassrls
    ) {
      throw new Error("DATABASE_ROLE_FOR_RLS_TEST=INVALID_BYPASS");
    }

    // Clean prior synthetic rows (admin).
    await asAdmin(async () => {
      await client.query("delete from account_deletion_requests where uid in ($1, $2)", [
        USER_A,
        USER_B
      ]);
      await client.query("delete from onboarding_state where uid in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from user_preferences where uid in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from user_roles where uid in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from identity_profiles where id in ($1, $2)", [USER_A, USER_B]);
    });
  }, 120_000);

  afterAll(async () => {
    if (!client) return;
    try {
      await asAdmin(async () => {
        await client.query("delete from account_deletion_requests where uid in ($1, $2)", [
          USER_A,
          USER_B
        ]);
        await client.query("delete from onboarding_state where uid in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from user_preferences where uid in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from user_roles where uid in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from identity_profiles where id in ($1, $2)", [USER_A, USER_B]);
      });
    } catch {
      /* cleanup best-effort */
    }
    await client.end().catch(() => undefined);
  });

  it("A creates own profile; B creates own; cross-read denied", async () => {
    await asAuthenticated(USER_A, async () => {
      await client.query(
        `insert into identity_profiles (id, email, display_name)
         values ($1, 'rls-a@fitconnect.test', 'RLS Test Athlete A')`,
        [USER_A]
      );
      await client.query(
        `insert into user_roles (uid, role) values ($1, 'athlete')`,
        [USER_A]
      );
      const own = await client.query(`select id, display_name from identity_profiles where id = $1`, [
        USER_A
      ]);
      expect(own.rows).toHaveLength(1);
      expect(own.rows[0].display_name).toBe("RLS Test Athlete A");
    });

    await asAuthenticated(USER_B, async () => {
      await client.query(
        `insert into identity_profiles (id, email, display_name)
         values ($1, 'rls-b@fitconnect.test', 'RLS Test Athlete B')`,
        [USER_B]
      );
      await client.query(
        `insert into user_roles (uid, role) values ($1, 'athlete')`,
        [USER_B]
      );
      const own = await client.query(`select id from identity_profiles where id = $1`, [USER_B]);
      expect(own.rows).toHaveLength(1);

      const other = await client.query(`select id from identity_profiles where id = $1`, [USER_A]);
      expect(other.rows).toHaveLength(0);

      const all = await client.query(`select id from identity_profiles`);
      expect(all.rows.every((r) => r.id === USER_B)).toBe(true);
    });

    await asAuthenticated(USER_A, async () => {
      const other = await client.query(`select id from identity_profiles where id = $1`, [USER_B]);
      expect(other.rows).toHaveLength(0);
    });
  });

  it("A update own ALLOW; A update B DENY; B update A DENY", async () => {
    await asAuthenticated(USER_A, async () => {
      const own = await client.query(
        `update identity_profiles set display_name = 'RLS Test Athlete A*' where id = $1`,
        [USER_A]
      );
      expect(own.rowCount).toBe(1);

      const other = await client.query(
        `update identity_profiles set display_name = 'hacked' where id = $1`,
        [USER_B]
      );
      expect(other.rowCount).toBe(0);
    });

    await asAuthenticated(USER_B, async () => {
      const other = await client.query(
        `update identity_profiles set display_name = 'hacked-by-b' where id = $1`,
        [USER_A]
      );
      expect(other.rowCount).toBe(0);
      const check = await client.query(
        `select display_name from identity_profiles where id = $1`,
        [USER_B]
      );
      expect(check.rows[0].display_name).toBe("RLS Test Athlete B");
    });

    // Confirm A name unchanged by B (read as A).
    await asAuthenticated(USER_A, async () => {
      const row = await client.query(
        `select display_name from identity_profiles where id = $1`,
        [USER_A]
      );
      expect(row.rows[0].display_name).toBe("RLS Test Athlete A*");
    });
  });

  it("role escalation DENY (self-promote to admin / write other role)", async () => {
    await asAuthenticated(USER_B, async () => {
      await expect(
        client.query(`insert into user_roles (uid, role) values ($1, 'admin')`, [USER_B])
      ).rejects.toThrow();

      await expect(
        client.query(`insert into user_roles (uid, role) values ($1, 'coach')`, [USER_A])
      ).rejects.toThrow();
    });
  });

  it("unauthenticated (empty sub) DENY all identity rows", async () => {
    await asAuthenticated("", async () => {
      const rows = await client.query(`select id from identity_profiles`);
      expect(rows.rows).toHaveLength(0);
    });
  });

  it("A delete B DENY; A delete own ALLOW; B delete own ALLOW", async () => {
    await asAuthenticated(USER_A, async () => {
      const denied = await client.query(`delete from identity_profiles where id = $1`, [USER_B]);
      expect(denied.rowCount).toBe(0);
    });

    await asAuthenticated(USER_A, async () => {
      await client.query(`delete from user_roles where uid = $1`, [USER_A]);
      const del = await client.query(`delete from identity_profiles where id = $1`, [USER_A]);
      expect(del.rowCount).toBe(1);
    });

    await asAuthenticated(USER_B, async () => {
      await client.query(`delete from user_roles where uid = $1`, [USER_B]);
      const del = await client.query(`delete from identity_profiles where id = $1`, [USER_B]);
      expect(del.rowCount).toBe(1);
    });
  });
});
