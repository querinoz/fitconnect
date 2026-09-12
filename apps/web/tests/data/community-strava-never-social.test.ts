/**
 * Documents AGENTS.md §1 Strava-never-social for community_* (migration 020).
 * Static SQL snapshot always runs; live CHECK/RLS is opt-in via P0_SEC_LIVE_RLS=1.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { postgresSslOption } from "@/lib/db/pg-ssl";
import {
  assertCommunityPostProviderAllowed,
  canSurfaceCommunityPost,
  isSocialEligibleProvider
} from "@/lib/community/community-social-policy";

const root = path.resolve(__dirname, "../../../../supabase/migrations");
const migration020 = readFileSync(
  path.join(root, "020_community_strava_never_social.sql"),
  "utf8"
);

const DATABASE_URL = (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim();
const LIVE_RLS = process.env.P0_SEC_LIVE_RLS === "1";

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

describe("community Strava-never-social invariant (020)", () => {
  it("SQL owns provider_id + generated is_social_eligible + CHECK + RLS", () => {
    expect(migration020).toMatch(/add column if not exists provider_id/i);
    expect(migration020).toMatch(
      /generated always as \(upper\(provider_id\) <> 'STRAVA'\) stored/i
    );
    expect(migration020).toContain("community_posts_is_social_eligible_check");
    expect(migration020).toMatch(/check \(is_social_eligible\)/i);
    expect(migration020).toMatch(
      /create policy community_posts_select_all[\s\S]*using \(is_social_eligible\)/i
    );
    expect(migration020).toMatch(
      /create policy community_posts_insert_own[\s\S]*is_social_eligible/i
    );
    expect(migration020).toMatch(/p\.is_social_eligible/i);
  });

  it("does not rewrite prior migrations 014/019", () => {
    expect(migration020).toMatch(/Additive only/i);
    expect(migration020).not.toMatch(/drop table if exists public\.community_posts/i);
  });

  it("TS mirror rejects STRAVA for social surfaces (including author)", () => {
    expect(isSocialEligibleProvider("STRAVA")).toBe(false);
    expect(isSocialEligibleProvider("strava")).toBe(false);
    expect(isSocialEligibleProvider("MANUAL")).toBe(true);
    expect(isSocialEligibleProvider("HEALTH_CONNECT")).toBe(true);
    expect(assertCommunityPostProviderAllowed("STRAVA")).toBe(false);
    expect(
      canSurfaceCommunityPost({ providerId: "STRAVA", isSocialEligible: false })
    ).toBe(false);
    expect(
      canSurfaceCommunityPost({ providerId: "MANUAL", isSocialEligible: true })
    ).toBe(true);
  });
});

describe.skipIf(!DATABASE_URL || !LIVE_RLS)(
  "community Strava-never-social live CHECK/RLS",
  () => {
    let client: pg.Client;
    const USER_A = "community_strava_rls_a";

    async function asAuthenticated(uid: string, fn: () => Promise<void>) {
      await client.query("begin");
      try {
        await client.query("set local role authenticated");
        await client.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
        await client.query("select set_config('request.jwt.claims', $1, true)", [
          JSON.stringify({ sub: uid, role: "authenticated" })
        ]);
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

      for (const file of [
        "014_social_ascend_firebase.sql",
        "019_post_comments.sql",
        "020_community_strava_never_social.sql"
      ]) {
        // 014 is destructive if re-applied; only apply 020 (+ 019 if needed).
        if (file === "014_social_ascend_firebase.sql") {
          const exists = await client.query(
            `select to_regclass('public.community_posts') is not null as ok`
          );
          if (exists.rows[0]?.ok) continue;
        }
        const sql = readFileSync(path.join(root, file), "utf8");
        for (const statement of statementsFromMigration(sql)) {
          try {
            await client.query(statement);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (/already exists/i.test(message)) continue;
            throw err;
          }
        }
      }
    }, 60_000);

    afterAll(async () => {
      if (client) await client.end();
    });

    it("CHECK rejects provider_id=STRAVA insert; MANUAL insert is selectable", async () => {
      const manualId = "00000000-0000-4000-8000-00000000c020";
      const stravaId = "00000000-0000-4000-8000-00000000c021";

      await asAuthenticated(USER_A, async () => {
        await client.query(
          `insert into identity_profiles (id, email, display_name)
           values ($1, 'c@t.test', 'C')
           on conflict (id) do nothing`,
          [USER_A]
        );

        await client.query(
          `insert into community_posts
             (id, author_id, post_kind, content, sport, author_name, provider_id)
           values ($1::uuid, $2, 'Check-in', 'eligible post', 'Running', 'Tester', 'MANUAL')
           on conflict (id) do update set content = excluded.content`,
          [manualId, USER_A]
        );

        const visible = await client.query(
          `select id, is_social_eligible from community_posts where id = $1::uuid`,
          [manualId]
        );
        expect(visible.rows).toHaveLength(1);
        expect(visible.rows[0].is_social_eligible).toBe(true);

        await client.query("savepoint before_strava");
        let rejected = false;
        try {
          await client.query(
            `insert into community_posts
               (id, author_id, post_kind, content, sport, author_name, provider_id)
             values ($1::uuid, $2, 'Check-in', 'strava leak', 'Running', 'Tester', 'STRAVA')`,
            [stravaId, USER_A]
          );
        } catch {
          rejected = true;
          await client.query("rollback to savepoint before_strava");
        }
        expect(rejected).toBe(true);

        const leak = await client.query(
          `select id from community_posts where id = $1::uuid or provider_id = 'STRAVA'`,
          [stravaId]
        );
        expect(leak.rows).toHaveLength(0);
      });
    }, 30_000);
  }
);
