import assert from "node:assert/strict";
import test from "node:test";
import { findingsInEnvRows, parseEnvText } from "./preflight-vercel-env.mjs";

test("preflight flags hostname base on DATABASE_URL", () => {
  const rows = parseEnvText("DATABASE_URL=postgres://u:p@base:5432/postgres\nNEXT_PUBLIC_APP_URL=https://fitconnect-phi.vercel.app\n");
  const findings = findingsInEnvRows(rows, "test.env");
  assert.equal(findings.some((f) => f.key === "DATABASE_URL"), true);
  assert.equal(
    findings.find((f) => f.key === "DATABASE_URL")?.reason.includes("docker-only"),
    true
  );
});

test("preflight does not flag supabase pooler host as docker", () => {
  const rows = parseEnvText(
    "NEXT_PUBLIC_APP_URL=https://fitconnect-phi.vercel.app\nUPSTASH_REDIS_REST_URL=https://ready.upstash.io\n"
  );
  const findings = findingsInEnvRows(rows, "test.env");
  assert.deepEqual(findings, []);
});

test("preflight flags leftover DATABASE_URL in vercel-prebuild even when host is public", () => {
  const rows = parseEnvText("DATABASE_URL=postgres://u:p@db.example.supabase.co:5432/postgres\n");
  const findings = findingsInEnvRows(rows, "test.env", "vercel-prebuild");
  assert.equal(findings.some((f) => f.key === "DATABASE_URL"), true);
});
