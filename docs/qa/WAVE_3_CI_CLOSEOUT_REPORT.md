# WAVE 3 — CI Closeout Report

**Date:** 2026-09-07  
**Branch:** `feat/elite-os-v2`  
**Prior failing run:** CI #26 @ `ce09ae3` — https://github.com/querinoz/fitconnect/actions/runs/34124458748

---

## Failure summary

| Field | Value |
|-------|-------|
| Workflow | CI #26 |
| Job | Integration · DB · Pact |
| Failed step | `pnpm --filter @fitconnect/db test:integration` |
| `db:migrate:deploy` | PASS (same job) |
| Lint / unit / coverage / security | PASS on #26 |
| Classification | **TEST_OWNED / DATABASE** |

Wave 3 application code was **not** the cause — failure existed on `ce09ae3` before Wave 3 was pushed.

---

## Root cause

1. Migration down-script test executed the full `down.sql` via a single `$executeRawUnsafe` call.
2. Prisma 7 `PrismaPg` uses the extended/prepared protocol → **multi-statement SQL is rejected**.
3. UTF-8 BOM was fixed in `ce09ae3` but multi-statement execution remained broken.
4. Nested Testcontainers duplicated the CI Postgres service and added avoidable runtime risk.

---

## Resolution

| Change | File |
|--------|------|
| `splitSqlStatements` + `executeSqlScript` | `packages/db/src/test-utils/db-factory.ts` |
| Prefer `DATABASE_URL` when `CI=true`; restore schema in `afterAll` | `packages/db/src/__tests__/migrations.test.ts` |
| Always-on splitter unit test | `packages/db/src/__tests__/sql-split.test.ts` |
| Align `@prisma/adapter-pg` with client ^7.8.0 | `packages/db/package.json` + lockfile |
| Ensure `down.sql` has no BOM + trailing newline | `prisma/migrations/20260907140000_init/down.sql` |

---

## Local verification (pre-push)

| Check | Result |
|-------|--------|
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS (web **500** passed) |
| `pnpm test:coverage` | PASS |
| `pnpm build` | PASS |
| `:app:assembleDebug` | PASS |
| Emulator install + MainActivity warm launch | PASS |
| wave2 / wave3 API closures | 7/7 + 5/5 PASS |

Full Docker migration suite cannot run on this Windows agent (no Docker). CI will execute `test:integration` against service Postgres.

---

## Post-push CI

_(filled after push)_

| Workflow | Status |
|----------|--------|
| CI | pending |
| Vercel Production | pending |
| android (Kotlin) | pending |
| Integration · DB · Pact | pending |

---

## Remaining non-CI blockers

- **BLOCKED_EXTERNAL:** FCM production, Stripe Connect LIVE, full Firebase auth matrix, dual-device live realtime
- **DEFERRED_DEVICE:** Redmi/MIUI, physical GPS
- **FUTURE_SCOPE:** Wear OS product
