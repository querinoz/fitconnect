/**
 * Live P1-DATA RLS IDOR for public.activities (+ ascend_events idempotency).
 * Same cert rules as identity-rls: SET LOCAL ROLE authenticated, never BYPASSRLS evidence.
 * Opt-in: P0_SEC_LIVE_RLS=1
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const DATABASE_URL = (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim();
const LIVE_RLS = process.env.P0_SEC_LIVE_RLS === "1";

const USER_A = "p1_data_rls_a";
const USER_B = "p1_data_rls_b";

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

type RoleSnapshot = {
  current_user: string;
  session_user: string;
  rolsuper: boolean;
  rolbypassrls: boolean;
};

describe.skipIf(!DATABASE_URL || !LIVE_RLS)("P1-DATA activities RLS two-user IDOR", () => {
  let client: pg.Client;

  async function roleSnapshot(): Promise<RoleSnapshot> {
    const { rows } = await client.query<RoleSnapshot>(`
      select current_user::text as current_user,
             session_user::text as session_user,
             (select rolsuper from pg_roles where rolname = current_user) as rolsuper,
             (select rolbypassrls from pg_roles where rolname = current_user) as rolbypassrls
    `);
    return rows[0]!;
  }

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
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    // 016 is idempotent (IF NOT EXISTS). Do not re-apply 014 — its CREATE TABLE
    // is not IF NOT EXISTS and already lives on the live project.
    for (const file of [
      "016_p1_data_canonical.sql",
      "017_strength_workout_engine.sql",
      "018_workout_wave2.sql"
    ]) {
      const sql = readFileSync(
        path.resolve(__dirname, `../../../../supabase/migrations/${file}`),
        "utf8"
      );
      for (const statement of statementsFromMigration(sql)) {
        try {
          await client.query(statement);
        } catch (err) {
          const code = (err as { code?: string }).code;
          // 017 CREATE POLICY / INDEX is not fully IF NOT EXISTS — tolerate re-apply.
          if (code === "42710" || code === "42P07" || code === "42701") continue;
          throw err;
        }
      }
    }

    await client.query("begin");
    await client.query("set local role authenticated");
    const cert = await roleSnapshot();
    await client.query("rollback");
    if (cert.current_user !== "authenticated" || cert.rolsuper || cert.rolbypassrls) {
      throw new Error("DATABASE_ROLE_FOR_RLS_TEST=INVALID_BYPASS");
    }

    await asAdmin(async () => {
      await client.query("delete from strength_sets where session_id in (select id from strength_sessions where user_id in ($1, $2))", [
        USER_A,
        USER_B
      ]).catch(() => undefined);
      await client.query("delete from strength_sessions where user_id in ($1, $2)", [USER_A, USER_B]).catch(
        () => undefined
      );
      await client.query(`delete from activity_route_points where activity_id in (
        select id from activities where user_id in ($1, $2))`, [USER_A, USER_B]);
      await client.query("delete from activities where user_id in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from ascend_events where user_id in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from ascend_progress where user_id in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from readiness_snapshots where user_id in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from user_badges where user_id in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from user_notifications where recipient_id in ($1, $2)", [
        USER_A,
        USER_B
      ]);
      await client.query("delete from connected_devices where user_id in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from domain_events where actor_id in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from user_roles where uid in ($1, $2)", [USER_A, USER_B]);
      await client.query("delete from identity_profiles where id in ($1, $2)", [USER_A, USER_B]);
    });
  }, 180_000);

  afterAll(async () => {
    if (!client) return;
    try {
      await asAdmin(async () => {
        await client.query("delete from strength_sets where session_id in (select id from strength_sessions where user_id in ($1, $2))", [
          USER_A,
          USER_B
        ]).catch(() => undefined);
        await client.query("delete from strength_sessions where user_id in ($1, $2)", [USER_A, USER_B]).catch(
          () => undefined
        );
        await client.query(`delete from activity_route_points where activity_id in (
          select id from activities where user_id in ($1, $2))`, [USER_A, USER_B]);
        await client.query("delete from activities where user_id in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from ascend_events where user_id in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from ascend_progress where user_id in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from readiness_snapshots where user_id in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from user_badges where user_id in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from user_notifications where recipient_id in ($1, $2)", [
          USER_A,
          USER_B
        ]);
        await client.query("delete from connected_devices where user_id in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from domain_events where actor_id in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from user_roles where uid in ($1, $2)", [USER_A, USER_B]);
        await client.query("delete from identity_profiles where id in ($1, $2)", [USER_A, USER_B]);
      });
    } catch {
      /* best-effort */
    }
    await client.end().catch(() => undefined);
  });

  it(
    "A owns activity; B cannot read private A; Strava never social",
    async () => {
    let activityId = "";

    await asAuthenticated(USER_A, async () => {
      await client.query(
        `insert into identity_profiles (id, email, display_name) values ($1, 'a@t.test', 'A')`,
        [USER_A]
      );
      const ins = await client.query<{ id: string }>(
        `insert into activities
           (user_id, provider, external_id, sport, started_at, ended_at, distance_m, duration_ms, calories_kcal, visibility)
         values ($1, 'HEALTH_CONNECT', 'ext-a-1', 'RUN', now() - interval '1 hour', now(), 5000, 1800000, 420, 'private')
         returning id`,
        [USER_A]
      );
      activityId = ins.rows[0]!.id;
      expect(activityId).toBeTruthy();

      const own = await client.query(`select id, shareable from activities where id = $1`, [
        activityId
      ]);
      expect(own.rows).toHaveLength(1);
      expect(own.rows[0].shareable).toBe(true);
    });

    await asAuthenticated(USER_B, async () => {
      await client.query(
        `insert into identity_profiles (id, email, display_name) values ($1, 'b@t.test', 'B')`,
        [USER_B]
      );
      const other = await client.query(`select id from activities where id = $1`, [activityId]);
      expect(other.rows).toHaveLength(0);
    });

    await asAuthenticated(USER_A, async () => {
      await client.query(
        `insert into activities
           (user_id, provider, external_id, sport, started_at, distance_m, visibility)
         values ($1, 'STRAVA', 'strava-a-1', 'RUN', now(), 1000, 'public')`,
        [USER_A]
      );
    });

    await asAuthenticated(USER_B, async () => {
      const strava = await client.query(
        `select id from activities where provider = 'STRAVA' and user_id = $1`,
        [USER_A]
      );
      expect(strava.rows).toHaveLength(0);
    });
  }, 30_000);

  it("ASCEND: one activity → one XP event (idempotent retry)", async () => {
    const eventId = "p1-data-xp-evt-1";
    const activityId = "00000000-0000-4000-8000-00000000a001";

    await asAuthenticated(USER_A, async () => {
      await client.query(
        `insert into ascend_progress (user_id, total_xp, streak_days, badges)
         values ($1, 120, 0, '[]'::jsonb)
         on conflict (user_id) do nothing`,
        [USER_A]
      );
      await client.query(
        `insert into ascend_events
           (event_id, user_id, event_type, xp_awarded, source_type, source_id, payload)
         values ($1, $2, 'WORKOUT_COMPLETED', 40, 'activity', $3, '{}'::jsonb)`,
        [eventId, USER_A, activityId]
      );
    });

    // Duplicate must fail outside the aborted-tx trap: use savepoint.
    await asAuthenticated(USER_A, async () => {
      await client.query("savepoint before_dup");
      let rejected = false;
      try {
        await client.query(
          `insert into ascend_events
             (event_id, user_id, event_type, xp_awarded, source_type, source_id, payload)
           values ($1, $2, 'WORKOUT_COMPLETED', 40, 'activity', $3, '{}'::jsonb)`,
          [eventId, USER_A, activityId]
        );
      } catch {
        rejected = true;
        await client.query("rollback to savepoint before_dup");
      }
      expect(rejected).toBe(true);

      const rows = await client.query(
        `select event_id from ascend_events where user_id = $1 and event_id = $2`,
        [USER_A, eventId]
      );
      expect(rows.rows).toHaveLength(1);
    });
  });

  it("schema meta readable by authenticated; readiness own-only", async () => {
    await asAuthenticated(USER_A, async () => {
      const meta = await client.query(
        `select value from data_schema_meta where key = 'schema_version'`
      );
      expect(meta.rows[0]?.value).toBe("016");

      await client.query(
        `insert into readiness_snapshots (user_id, score, formula_version)
         values ($1, 78, 'utils-v1')`,
        [USER_A]
      );
      const own = await client.query(`select score from readiness_snapshots where user_id = $1`, [
        USER_A
      ]);
      expect(own.rows).toHaveLength(1);
    });

    await asAuthenticated(USER_B, async () => {
      const other = await client.query(`select score from readiness_snapshots where user_id = $1`, [
        USER_A
      ]);
      expect(other.rows).toHaveLength(0);
    });
  });

  it("P2CORE-009 guided MANUAL activity + strength_sessions idempotency; B cannot read", async () => {
    const sessionId = "10000000-0000-4000-8000-00000000b201";
    const activityId = "10000000-0000-4000-8000-00000000b202";
    const idem = `activity:${USER_A}:${sessionId}`;

    await asAuthenticated(USER_A, async () => {
      await client.query(
        `insert into activities
           (id, user_id, provider, external_id, sport, started_at, ended_at, duration_ms, visibility, demo_labeled)
         values ($1::uuid, $2, 'MANUAL', $3, 'STRENGTH', now() - interval '1 hour', now(), 3600000, 'private', false)
         on conflict (provider, external_id) do update set duration_ms = excluded.duration_ms`,
        [activityId, USER_A, sessionId]
      );
      await client.query(
        `insert into strength_sessions
           (id, user_id, activity_id, status, started_at, completed_at, duration_ms, idempotency_key)
         values ($1::uuid, $2, $3::uuid, 'COMPLETED', now() - interval '1 hour', now(), 3600000, $4)
         on conflict (id) do update set idempotency_key = excluded.idempotency_key`,
        [sessionId, USER_A, activityId, idem]
      );

      await client.query(
        `insert into activities
           (id, user_id, provider, external_id, sport, started_at, ended_at, duration_ms, visibility, demo_labeled)
         values ($1::uuid, $2, 'MANUAL', $3, 'STRENGTH', now() - interval '1 hour', now(), 3600000, 'private', false)
         on conflict (provider, external_id) do update set duration_ms = excluded.duration_ms`,
        [activityId, USER_A, sessionId]
      );

      const count = await client.query(
        `select count(*)::int as n from activities where provider = 'MANUAL' and external_id = $1`,
        [sessionId]
      );
      expect(count.rows[0].n).toBe(1);

      const meta018 = await client.query(
        `select value from data_schema_meta where key = 'workout_wave2_schema_version'`
      );
      expect(meta018.rows[0]?.value).toBe("018");
    });

    await asAuthenticated(USER_B, async () => {
      const other = await client.query(`select id from activities where id = $1::uuid`, [activityId]);
      expect(other.rows).toHaveLength(0);
      const ss = await client.query(`select id from strength_sessions where id = $1::uuid`, [
        sessionId
      ]);
      expect(ss.rows).toHaveLength(0);
    });
  });

  it("GPS-012 route points: A owns; B cannot read or insert onto A activity", async () => {
    const sessionId = "20000000-0000-4000-8000-00000000c301";
    const activityId = "20000000-0000-4000-8000-00000000c302";

    await asAuthenticated(USER_A, async () => {
      await client.query(
        `insert into activities
           (id, user_id, provider, external_id, sport, started_at, ended_at, duration_ms, distance_m, visibility, demo_labeled)
         values ($1::uuid, $2, 'GPS', $3, 'RUN', now() - interval '30 minutes', now(), 1800000, 2100, 'private', false)
         on conflict (provider, external_id) do update set distance_m = excluded.distance_m`,
        [activityId, USER_A, sessionId]
      );
      await client.query(
        `insert into activity_route_points
           (activity_id, recorded_at, latitude, longitude, accuracy_m, speed_mps, seq)
         values ($1::uuid, now(), 38.7223, -9.1393, 8.0, 3.1, 1)`,
        [activityId]
      );
      const own = await client.query(
        `select count(*)::int as n from activity_route_points where activity_id = $1::uuid`,
        [activityId]
      );
      expect(own.rows[0].n).toBe(1);
    });

    await asAuthenticated(USER_B, async () => {
      const read = await client.query(
        `select id from activity_route_points where activity_id = $1::uuid`,
        [activityId]
      );
      expect(read.rows).toHaveLength(0);

      await client.query("savepoint before_route_idor");
      let rejected = false;
      try {
        await client.query(
          `insert into activity_route_points
             (activity_id, recorded_at, latitude, longitude, accuracy_m, speed_mps, seq)
           values ($1::uuid, now(), 38.73, -9.14, 5.0, 2.0, 99)`,
          [activityId]
        );
      } catch {
        rejected = true;
        await client.query("rollback to savepoint before_route_idor");
      }
      expect(rejected).toBe(true);
    });
  }, 30_000);
});
