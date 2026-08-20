import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../../../supabase/migrations");

function sql(name: string): string {
  return readFileSync(path.join(root, name), "utf8");
}

describe("P0-SEC SQL policy snapshot", () => {
  it("keeps STRAVA rows unshareable", () => {
    const source = sql("011_workout_sessions_shareable.sql");
    expect(source).toMatch(/provider\s*<>\s*'STRAVA'/i);
  });

  it("forces identity RLS and own-row access", () => {
    const source = sql("012_firebase_identity.sql");
    expect(source).toMatch(/force row level security/i);
    expect(source).toMatch(/firebase_uid\(\)/);
    expect(source).not.toMatch(/service_role/i);
  });

  it("adds own-row DELETE and deletion audit", () => {
    const source = sql("013_p0_sec.sql");
    expect(source).toContain("account_deletion_requests");
    expect(source).toContain("identity_profiles_delete_own");
    expect(source).toContain("force row level security");
    expect(source).toMatch(/revoke all on table public.account_deletion_requests from anon/i);
  });
});
