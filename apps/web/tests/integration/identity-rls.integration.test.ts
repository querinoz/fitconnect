import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function statementsFromMigration(sql: string): string[] {
  return sql
    .split("--;;")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !part.startsWith("-- 012") && !part.startsWith("-- 013"));
}

const DATABASE_URL = process.env.DATABASE_URL;

describe.skipIf(!DATABASE_URL)("identity RLS two-user IDOR", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    if (!DATABASE_URL) return;
    prisma = new PrismaClient();
    await prisma.$executeRawUnsafe("create schema if not exists auth");
    await prisma.$executeRawUnsafe(`
      create or replace function auth.jwt() returns jsonb
      language sql stable as $fn$
        select jsonb_build_object('sub', current_setting('request.jwt.claim.sub', true))
      $fn$
    `);
    const sql012 = readFileSync(
      path.resolve(__dirname, "../../../../supabase/migrations/012_firebase_identity.sql"),
      "utf8"
    );
    for (const statement of statementsFromMigration(sql012)) {
      await prisma.$executeRawUnsafe(statement);
    }
    const sql013 = readFileSync(
      path.resolve(__dirname, "../../../../supabase/migrations/013_p0_sec.sql"),
      "utf8"
    );
    for (const statement of statementsFromMigration(sql013)) {
      await prisma.$executeRawUnsafe(statement);
    }
  }, 60_000);

  it("allows own profile and denies cross-user read/update/role escalation", async () => {
    if (!DATABASE_URL) return;

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("select set_config('request.jwt.claim.sub', 'user-a', true)");
      await tx.$executeRawUnsafe(`
        insert into identity_profiles (id, email, display_name)
        values ('user-a', 'a@fitconnect.app', 'User A')
        on conflict (id) do nothing
      `);
      await tx.$executeRawUnsafe(`
        insert into user_roles (uid, role) values ('user-a', 'athlete')
        on conflict (uid) do nothing
      `);
    });

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("select set_config('request.jwt.claim.sub', 'user-b', true)");
      await tx.$executeRawUnsafe(`
        insert into identity_profiles (id, email, display_name)
        values ('user-b', 'b@fitconnect.app', 'User B')
        on conflict (id) do nothing
      `);

      const own = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        "select id from identity_profiles where id = 'user-b'"
      );
      expect(own).toHaveLength(1);

      const other = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        "select id from identity_profiles where id = 'user-a'"
      );
      expect(other).toHaveLength(0);

      const updated = await tx.$executeRawUnsafe(
        "update identity_profiles set display_name = 'hacked' where id = 'user-a'"
      );
      expect(updated).toBe(0);

      await expect(
        tx.$executeRawUnsafe("insert into user_roles (uid, role) values ('user-a', 'coach')")
      ).rejects.toThrow();

      await expect(
        tx.$executeRawUnsafe("insert into user_roles (uid, role) values ('user-b', 'admin')")
      ).rejects.toThrow();
    });

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("select set_config('request.jwt.claim.sub', '', true)");
      const anon = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        "select id from identity_profiles"
      );
      expect(anon).toHaveLength(0);
    });
  });

  it("allows own identity DELETE and denies the other user", async () => {
    if (!DATABASE_URL) return;

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("select set_config('request.jwt.claim.sub', 'user-a', true)");
      const other = await tx.$executeRawUnsafe(
        "delete from identity_profiles where id = 'user-b'"
      );
      expect(other).toBe(0);
    });

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("select set_config('request.jwt.claim.sub', 'user-b', true)");
      const own = await tx.$executeRawUnsafe(
        "delete from user_roles where uid = 'user-b'"
      );
      expect(own).toBeGreaterThanOrEqual(0);
      await tx.$executeRawUnsafe("delete from identity_profiles where id = 'user-b'");
    });
  });
});
