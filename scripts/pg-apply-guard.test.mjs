import test from "node:test";
import assert from "node:assert/strict";
import { assertMigrationApplyAllowed, isLoopbackPostgresUrl } from "./lib/pg-apply-guard.mjs";

test("localhost urls are allowed", () => {
  assert.equal(isLoopbackPostgresUrl("postgres://x:y@localhost:5432/fit"), true);
  assert.equal(assertMigrationApplyAllowed("postgres://x:y@127.0.0.1:5432/fit", {}).ok, true);
});

test("remote urls require explicit flag", () => {
  const denied = assertMigrationApplyAllowed("postgres://x:y@db.example.supabase.co:5432/postgres", {});
  assert.equal(denied.ok, false);
  const allowed = assertMigrationApplyAllowed("postgres://x:y@db.example.supabase.co:5432/postgres", {
    FITCONNECT_APPLY_PRODUCTION: "1"
  });
  assert.equal(allowed.ok, true);
});
