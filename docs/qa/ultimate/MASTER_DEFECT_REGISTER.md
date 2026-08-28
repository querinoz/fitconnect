# Master defect register — 2026-08-27

Owner column: **AGENT** = fixable without human-owned credentials/infrastructure.
Every row cites evidence that was read directly.

## P0

| ID | Platform | Feature | Description | Root cause | Owner | Status | Evidence |
|---|---|---|---|---|---|---|---|
| P0-1 | Web | Auth | Firebase ID tokens accepted without signature verification → full account impersonation on every `/api/v1` route | Decoder used as verifier; downstream PostgREST verification assumed for routes that never reach PostgREST | AGENT | **FIXED + TESTED** | `lib/auth/firebase-id-token.ts:26-51`, `lib/api/require-auth.ts:44` |
| P0-2 | Web | Payments | Stripe replay protection silently disabled without `DATABASE_URL`; all subscription writes dropped while returning 200 | `claimStripeEvent` returned `true` on no-DB instead of failing closed | AGENT | **FIXED + TESTED** | `lib/stripe/webhook-handler.ts:9-10` |
| P0-3 | Data | Schema | `prisma migrate deploy` cannot build the schema: 6 of 22 models have migrations; the index migration targets tables nothing creates | Models added to `schema.prisma` without migrations | AGENT (needs a DB to validate) | OPEN | `prisma/migrations/20260518120000_production_indexes/migration.sql:2-4` |
| P0-4 | Cross | ASCEND | Two incompatible XP/level systems, neither persisted server-side — phone level and web level are unrelated numbers and both reset | No canonical progression store in Prisma/Supabase/Convex | AGENT (design decision needed) | OPEN | `android/ascend/.../levels/LevelTable.kt:15-31` vs `apps/web/lib/gamification/levels.ts:9` |
| P0-5 | DevOps | Release | Production deploy path with no test gate, contradicting documented NO-GO | `vercel-deploy.yml` had no test job | AGENT | **FIXED** (test+typecheck added) | `.github/workflows/vercel-deploy.yml` |

## P1

| ID | Platform | Feature | Description | Owner | Status | Evidence |
|---|---|---|---|---|---|---|
| P1-1 | Web | Sessions | `sessions/[id]/feedback` accepted unauthenticated writes with a caller-chosen athlete id | AGENT | **FIXED** | route source |
| P1-2 | Web | Realtime | `realtime/bridge` was an open read/write pub-sub relay | AGENT | **FIXED** | route source |
| P1-3 | Web | Auth | `fc-demo-session=user-*` cookie bypassed the production page gate | AGENT | **FIXED** | `middleware.ts:52-55`, `lib/auth/demo-session.ts:18` |
| P1-4 | Data | RLS | 11 user-data tables: RLS enabled, **zero policies, no FORCE** → Prisma owner role bypasses RLS entirely | AGENT | OPEN | `supabase/migrations/004,005,006,008,009` |
| P1-5 | Data | RLS | `reviews` and `coach_profiles` world-readable via `USING (true)`; `reviews` exposes `athlete_id` + free text to anon | AGENT | OPEN | `010_reviews.sql:15`, `002_coaches.sql:13` |
| P1-6 | Data | RLS | Athlete→coach self-elevation via delete-then-reinsert on `user_roles` | AGENT | OPEN | `013_p0_sec.sql:53-56`, `012:145-151` |
| P1-7 | DevOps | CI | CI does not trigger on `feat/elite-os-v2` (patterns match `feature/**`) — "CI is green" unfalsifiable | AGENT | **FIXED** | `ci.yml:5` now includes `feat/**` |
| P1-8 | DevOps | CI | `security-audit` job cannot fail — both steps `continue-on-error: true` — yet `build` lists it in `needs:` | AGENT | OPEN | `ci.yml:139-147` |
| P1-9 | DevOps | CI | E2E runs 4 of 12 specs, with `NEXT_PUBLIC_DEMO_MODE=true` | AGENT | OPEN | `ci.yml:13,180-187` |
| P1-10 | DevOps | CI | `deploy-staging` health check probes a pre-existing public URL and greps for a key name — structurally cannot fail | AGENT | OPEN | `ci.yml:258`, `app/api/health/route.ts:8` |
| P1-11 | Test | Gate | P0-SEC exit-gate suite skips itself when `DATABASE_URL` is unset — reports green by vanishing; config/globalSetup ordering also breaks the Testcontainers path | AGENT + HUMAN | OPEN | `tests/integration/identity-rls.integration.test.ts:15`, `vitest.config.integration.ts:6-10` |
| P1-12 | Web | Arch | tRPC is dead code: router returns `[]`/zeros, zero importers, yet Android ships a client for it | AGENT | OPEN | `packages/api-client/src/router.ts:16,37,41,45,57-61` |
| P1-13 | Android | Arch | Feature state has no lifecycle owner — one `ViewModelProvider.Factory` app-wide, zero ViewModels in `athlete`/`coach`; home state is bare `remember`, lost on rotation and process death | AGENT | OPEN | `android/athlete/.../ui/home/HomeScreen.kt:83-87` |
| P1-14 | Cross | Data | 17 Supabase tables (migrations 001–011) have zero readers; community posts live in `localStorage` on web despite a table and a full Android domain existing | AGENT | OPEN | `apps/web/lib/community/local-posts.ts:3` |

## P2 (selected)

| ID | Description | Owner | Status | Evidence |
|---|---|---|---|---|
| P2-1 | Rate-limit bucket key trusts attacker-supplied `x-athlete-id` header | AGENT | OPEN | `lib/security/rate-limit.ts:60-62` |
| P2-2 | `hasFirebaseSessionCookie` accepts any three-dot string as a page session | AGENT | OPEN | `lib/auth/middleware-auth.ts:52-53` |
| P2-3 | `make start fitconnect` is not a supported phrase: GNU Make starts the server then exits non-zero on a missing target; the Windows wrapper throws a type-cast error and starts nothing | AGENT | **FIXED** | `Makefile` fitconnect alias + `make.ps1` |
| P2-4 | `make start` on Windows aborts falsely when Docker is absent — `$LASTEXITCODE` is `$null` and `$null -ne 0` is true | AGENT | **FIXED** | `scripts/make-start.ps1`, `make-stop.ps1 exit 0` |
| P2-5 | `make stop` cannot stop a `make prod` server on Windows — PID path mismatch | AGENT | OPEN | `scripts/make-stop.ps1:11` vs `Makefile:10` |
| P2-6 | Three parallel web component libraries all in active use (elite-os 50, ui-glass 39, ui 25 importers) | AGENT | OPEN | three button implementations |
| P2-7 | Contradictory design-system specs both checked in — `MASTER.md` (orange/Barlow) vs `FITCONNECT-OVERRIDE.md` (Volt/Syne) | AGENT | OPEN | `design-system/design-system/fitconnect-elite-os/` |
| P2-8 | `CLAUDE.md` body carries 5 wrong repo facts and a dead link; HISTORICAL banner disclaims status, not inventory | AGENT | OPEN | `:19,:21,:41,:43,:45,:131` |
| P2-9 | `qa/HUMAN-QUEUE.md` still lists two blockers resolved on 2026-08-24 as 🔴 BLOCKED | AGENT | OPEN | `:7-12`, `:16-26` |
| P2-10 | Phase of record contested across four files (P0-SEC next / F1 in progress / P0-SEC done) | AGENT | OPEN | see `26_DOCUMENTATION_AUDIT` findings |
| P2-11 | `:core-capture` build file cannot support the capabilities its header claims | AGENT | OPEN | `android/core-capture/build.gradle.kts:1-4,26-31` |
| P2-12 | Booking is a first-class product concept with no schema anywhere | AGENT | OPEN | `android/geo/.../GeoModels.kt:45,47` |

## P3 (selected)

| ID | Description | Evidence |
|---|---|---|
| P3-1 | `autoVerify` App Link with no `assetlinks.json` — verification silently fails | `AndroidManifest.xml:61-69` |
| P3-2 | `qa/FINDINGS.json` is `{"findings": []}` while three QA runs recorded real findings | `qa/FINDINGS.json:3` |
| P3-3 | 354 of 559 markdown files are archive, ~20 with PASS/COMPLETE language the current docs warn against reusing | `docs/archive/**` |
| P3-4 | `make screenshots` always `exit 1` by design, poisoning aggregate targets | `Makefile:285-287` |
| P3-5 | `apps/mobile/.expo/README.md` is a tool-generated file tracked in the repo | — |
| P3-6 | Doubled path `design-system/design-system/` | — |
| P3-7 | `exploreSegments()` still exposed on a P0-sensitive boundary though defanged at runtime | `packages/strava-integration/src/client.ts:372` |

## Not defects — verified good

- `NEXT_PUBLIC_DEMO_MODE` fails safe everywhere (`=== "true"`).
- No real secret committed to tracked source; `.env.local` untracked.
- Android module graph is a clean DAG — no cycles, no direction violations.
- The `--eos-*` → `packages/design-tokens` → Kotlin token pipeline is generated
  and CI-gated, and works as designed.
- Android release builds cannot mint a local identity.
- Stripe webhook signature verification is correct and fails closed.
