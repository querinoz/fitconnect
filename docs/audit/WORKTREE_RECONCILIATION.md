# Worktree reconciliation

**Date:** 2026-09-02
**Branch:** `feat/elite-os-v2`
**HEAD:** `7ee6811`
**Remote:** `origin/feat/elite-os-v2` â€” **ahead 8 / behind 0**
**Commits created this phase:** 0 (not authorized)
**Push:** UNCHANGED

---

## Secret safety

`SECRET_RISK_DETECTED = YES` (local files only; none staged)

| FILE | ACTION_REQUIRED |
|------|-----------------|
| `.env.local.backup-before-firebase` | REMOVE from commit path. ROTATE if this backup ever left the machine. Now gitignored. |
| `apps/web/.env.vercel` | REMOVE from commit path. ROTATE if it was ever shared. Now gitignored. |
| `fitconnectinstagramkit/google-services.json` | REMOVE from commit path. |
| `fitconnectinstagramkit/stripe_backup_code.txt` | REMOVE from commit path. ROTATE if the file contained a real Stripe recovery code. |
| `android/app/google-services.json` | IGNORE-IF-PUBLIC for typical restricted client IDs; already gitignored. Do not commit. |

Values were not printed. `.gitignore` now excludes `.env.vercel` and `.env.local.backup-*`.

---

## Classification (every dirty family)

### CATEGORY A â€” P1-DATA

| FILE | WHY | KEEP | COMMIT (when authorized) | PHASE |
|------|-----|------|--------------------------|-------|
| `supabase/migrations/016_p1_data_canonical.sql` | Canonical activities / readiness / domain_events | YES | YES (first) | P1-DATA |
| `packages/types/src/canonical.ts` | Shared units + identity keys | YES | YES | P1-DATA |
| `docs/data/P1_DATA_*.md` | Contracts, RLS, exit | YES | YES | P1-DATA |
| `apps/web/tests/data/*` | Contract + live RLS | YES | YES | P1-DATA |
| `scripts/p1-data-schema-inventory.mjs` | Schema inventory | YES | YES | P1-DATA |
| `apps/web/lib/identity/repository.ts` | UID â†’ identity_profiles | YES | YES (with AUTH) | P1-DATA/AUTH |
| `apps/web/lib/progression/supabase-repository.ts` | Canonical ASCEND SQL path | YES | YES | P1-DATA |
| `apps/web/app/api/v1/workout-sessions/route.ts` | activities API | YES | YES | P1-DATA |
| `prisma/schema.prisma` | Privilege-boundary comment | YES | YES | P1-DATA |

### CATEGORY B â€” WORKOUT ENGINE / 017

| FILE | WHY | KEEP | COMMIT | PHASE |
|------|-----|------|--------|-------|
| `supabase/migrations/017_strength_workout_engine.sql` | Strength schema | YES | Separate commit after 016 | Wave 1 domain |
| `packages/types/src/strength.ts` | Exercise/set types | YES | With 017 | Wave 1 |
| `packages/utils/src/strength/` | ProgressionEngine TS | YES | With 017 | Wave 1 |
| `android/sports/.../ProgressionEngine.kt` + tests | Kotlin twin | YES | With 017 | Wave 1 |
| `docs/product/**` | Specs / open-gym gap | YES | With 017 | Wave 1 |
| `apps/web/tests/strength/` | Unit tests | YES | With 017 | Wave 1 |

No Guided Workout UI in this phase.

### CATEGORY C â€” P1-AUTH

Web middleware, `require-auth`, auth-phase, AuthGate, Android Firebase gateway / AuthViewModel, instrumentation tests, CI `auth-prod-like`, `docs/auth/P1_*`. **KEEP. Commit after A.**

### CATEGORY D â€” HEALTH CONNECT / TELEMETRY

`HealthConnectHeartRateReader.kt`, telemetry/wear diffs. **KEEP. Separate commit. Not this phaseâ€™s product scope.**

### CATEGORY E â€” BRAND / INSTAGRAM / VISUAL

Logo PNGs, `content/instagram/v2/**`, marketing scripts, zips. **KEEP locally. Do not mix into P1-AUTH PR.**

### CATEGORY F â€” DOCS / AUDIT

`docs/audit/**`, README/docs index updates. **KEEP. Commit with this phaseâ€™s report.**

### CATEGORY G â€” GENERATED / TEMPORARY

`.idea/`, `.cursor/settings.json`, `qa/evidence/**`, `reel01_hexatar.mp4`, `content/instagram/publish-run.log`. **Do not commit** unless a specific evidence file is requested.

### CATEGORY H â€” POSSIBLE SECRET

See table above. **Never commit.**

### CATEGORY I â€” UNKNOWN

`.mcp.json` â€” Cursor MCP config. **Do not commit unless the team wants it shared.**

---

## Suggested commit order (when the user authorizes)

1. P1-DATA (`016`, `canonical.ts`, `docs/data/*`, data tests)
2. Strength Wave 1 (`017`, ProgressionEngine, product specs)
3. P1-AUTH (web/Android/CI/docs/auth)
4. Health Connect leftover
5. Audit docs if not in (3)
6. Brand/Instagram only if asked

**This phase did not create git commits.**
