# Worktree commit map

**Date:** 2026-09-03
**Rule:** one category per commit. Secrets never staged.

`SECRET_RISK`: listed env/credential files exist locally and are **gitignored**. Values not printed. `ROTATION_REQUIRED` if any of those files ever left this machine.

## COMMIT A â€” P1-DATA

| PATH | CATEGORY | RATIONALE |
|------|----------|-----------|
| `supabase/migrations/016_p1_data_canonical.sql` | A | Canonical schema |
| `packages/types/src/canonical.ts` | A | Units + identity keys |
| `packages/types/src/index.ts` | A | Canonical exports only (strength exports split to B) |
| `apps/web/tests/data/*` | A | Contract + activities RLS |
| `scripts/p1-data-schema-inventory.mjs` | A | Schema inventory |
| `docs/data/P1_DATA_*.md` | A | Data contracts / reconciliation |
| `apps/web/app/api/v1/workout-sessions/route.ts` | A | Reads `activities` |
| `apps/web/lib/fitness/workout-session-policy.ts` | A | shareable / Strava barrier |
| `apps/web/lib/gamification/store.ts` | A | LOCAL_DEMO label |
| `apps/web/lib/progression/server-store.ts` | A | IN_MEMORY_DEMO label |
| `apps/web/lib/progression/supabase-repository.ts` | A | Canonical XP path |
| `prisma/schema.prisma` | A | Privilege-boundary comment |
| `android/shared/.../ActivitySession.kt` | A | Canonical activity id comment |
| `android/ascend/.../AscendStore.kt` | A | Adapter / not SoT label |
| `.gitignore` | A | Secret-path excludes required before any freeze |

## COMMIT B â€” WORKOUT FOUNDATION / 017

| PATH | CATEGORY | RATIONALE |
|------|----------|-----------|
| `supabase/migrations/017_strength_workout_engine.sql` | B | Strength schema |
| `packages/types/src/strength.ts` | B | Domain types |
| `packages/types/src/index.ts` | B | Strength re-exports only |
| `packages/utils/src/strength/` | B | Progression TS |
| `packages/utils/src/index.ts` | B | Export progression |
| `android/sports/.../progression/` | B | Kotlin engine + tests |
| `apps/web/tests/strength/` | B | Unit tests |
| `docs/product/**` | B | Specs / gap analysis (no UI) |

## COMMIT C â€” P1-AUTH

Web auth, middleware, require-auth, identity bootstrap, CI demo-off job, Android Firebase gateway / AuthViewModel / CanonicalAuthState, instrumentation, auth docs, `package.json` auth scripts.

## COMMIT D â€” HEALTH CONNECT / TELEMETRY

Telemetry HR reader, HealthDataRepository, Wear probe/runtime comments, `docs/android/HEALTH_CONNECT.md`. No GPS product work.

## COMMIT E â€” AUDIT / DOCS

`README.md`, `docs/README.md`, `docs/audit/*` (including this freeze), current-status CLAUDE/android README if they only correct stale phase labels.

## COMMIT F â€” BRAND / INSTAGRAM

**DEFERRED** â€” logos, instagram v2, marketing scripts, reel deletions.

## DEFERRED / DO NOT COMMIT

| PATH | REASON |
|------|--------|
| `.env.local.backup-before-firebase` | SECRET |
| `apps/web/.env.vercel` | SECRET |
| `apps/web/.vercel/.env.production.local` | SECRET |
| `fitconnectinstagramkit/**` | SECRET + brand |
| `android/app/google-services.json` | SECRET / client config |
| `.idea/`, `.cursor/settings.json`, `.mcp.json` | local tooling |
| `qa/evidence/**`, `reel01_hexatar.mp4` | generated evidence |
| `pnpm-lock.yaml` | lock churn (691 lines) unrelated to Aâ€“E scripts |
| `.env.example` contact email | unrelated ops |
| brand PNG/SVG, instagram public assets | F |
| `packages/strava-integration/src/index.test.ts` | P0-SEC leftover, not this freeze |
| historical `docs/master-plan/*`, `docs/security/P0_SEC_*` edits | do not rewrite history |
| `.claude/skills`, `.cursor/skills` | skill text, not this freeze |

## Mixed files handled

| PATH | ACTION |
|------|--------|
| `packages/types/src/index.ts` | Split: A canonical exports, B strength exports |
| `android/app/build.gradle.kts` | Entire file â†’ C (auth instrumentation + Firebase debug id) |
| `OnboardingScreen.kt` | â†’ C (identity remote + instrumentation tags) |

No remaining `MANUAL_REVIEW_REQUIRED` files after the index split.
