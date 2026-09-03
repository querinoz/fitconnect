# P1-DATA â€” Worktree Reconciliation

**Date:** 2026-09-01
**Branch:** `feat/elite-os-v2` @ `7ee6811`
**Prerequisite:** `P0-SEC = PASS`
**Rule:** Do not delete or reset uncommitted work.

---

## 1. Branch state

| Item | Value |
|------|-------|
| HEAD | `7ee6811` â€” wave 7 Today editorial + HC read path (partial) |
| Ahead of `origin/feat/elite-os-v2` | 8 commits (waves 0â€“7 neu-glass + readiness/demo) |
| Uncommitted files | ~100+ (mixed ownership) |

---

## 2. Uncommitted work by ownership

### P1-AUTH (do not implement in P1-DATA)

| Path | Status | P1-DATA relation |
|------|--------|------------------|
| `android/.../AndroidFirebaseAuthGateway.kt` | Modified | Inspect only â€” identity mapping reference |
| `android/.../AuthViewModel.kt` | Modified | Out of scope |
| `android/.../FitConnectNavHost.kt` | Modified | Out of scope |
| `android/.../OnboardingScreen.kt` | Modified | Out of scope |
| `android/app/src/androidTest/.../auth/*` | Untracked | P1-AUTH test harness |
| `apps/web/lib/auth/auth-phase.ts` | Untracked | P1-AUTH |
| `apps/web/lib/auth/auth-config-status.ts` | Untracked | P1-AUTH |
| `apps/web/app/api/v1/auth/config/route.ts` | Untracked | P1-AUTH |
| `apps/web/tests/auth/p1-auth-security-matrix.test.ts` | Untracked | P0/P1 auth regression |
| `scripts/p1-auth-*.mjs` | Untracked | P1-AUTH ops |

**Preserved:** all files kept as-is. **Not modified** by P1-DATA doc pass.

### Health Connect (partial â€” contracts only in P1-DATA)

| Path | Status | P1-DATA relation |
|------|--------|------------------|
| `android/telemetry/.../HealthConnectHeartRateReader.kt` | Untracked | Device read path â€” persistence contract in `HEALTH_CONNECT.md` |
| `android/telemetry/.../HealthDataRepository.kt` | Modified | Local â€” maps to `activities` on sync |
| `docs/android/HEALTH_CONNECT.md` | Untracked | Documents HC vs P1-DATA boundary |
| Wave 7 commit `7ee6811` | Committed | `FitnessContainer`, exercise reader, permissions |

**P1-DATA owns:** canonical `activities` + `(provider, external_id)` upsert semantics.
**Does not own:** Room, WorkManager, full sleep/steps readers, write-back.

### Telemetry / Wear (P7-WATCH prep)

| Path | Status | P1-DATA relation |
|------|--------|------------------|
| `android/wear/WearRuntime.kt` | Modified | Local `wear-*` IDs â€” **BLOCKED** until P7 |
| `android/wear/WearHealthServicesProbe.kt` | Modified | Capability probe only |
| `android/telemetry/.../Telemetry.kt` | Modified | In-memory store â€” not SoT |
| `android/shared/.../ActivitySession.kt` | Modified | Session lease semantics documented in contracts |

### Web data (partial overlap)

| Path | Status | P1-DATA relation |
|------|--------|------------------|
| `apps/web/lib/progression/supabase-repository.ts` | Modified | **Canonical** ASCEND path |
| `apps/web/lib/gamification/store.ts` | Modified | LOCAL_DEMO â€” not SoT |
| `apps/web/lib/identity/repository.ts` | Modified | **Canonical** identity path |
| `apps/web/app/api/v1/workout-sessions/route.ts` | Modified | **Canonical** `activities` API |
| `apps/web/lib/db/repository.ts` | Unchanged dirty tree | **Conflict** â€” still Prisma dashboard path |
| `apps/web/tests/data/p1-data-*.test.ts` | Untracked | P1-DATA evidence |

### P1-DATA (canonical â€” already in repo)

| Path | Status |
|------|--------|
| `supabase/migrations/016_p1_data_canonical.sql` | Untracked locally â€” **must be committed** |
| `packages/types/src/canonical.ts` | Untracked locally â€” **must be committed** |
| `docs/data/P1_DATA_*.md` | Untracked locally â€” **must be committed** |
| `scripts/p1-data-schema-inventory.mjs` | Untracked locally |

### P0-SEC (PASS â€” preserve)

| Path | Status |
|------|--------|
| `supabase/migrations/013_p0_sec.sql` | Applied (historical) |
| `scripts/p0-sec-rls-*.mjs` | Untracked ops scripts |
| `docs/security/P0_SEC_*.md` | Untracked reports |

### Out of scope (preserve, do not merge into P1-DATA)

| Area | Examples |
|------|----------|
| Brand / Instagram | `content/instagram/v2/`, logo assets |
| Neu-glass UI | waves 0â€“7 committed; design-ui local edits |
| Expo mobile | `apps/mobile` frozen |
| Prisma unrelated | Stripe webhook tests |

---

## 3. What P1-DATA will modify

| Action | Target |
|--------|--------|
| Create/update | `docs/data/P1_DATA_*.md` (architecture, reconciliation, contracts, RLS, migration, realtime, offline, exit gate, final report) |
| Commit recommendation | `016`, `canonical.ts`, P1-DATA tests, docs (human commit â€” agent does not auto-commit) |
| No code deletion | Legacy Prisma/dashboard paths documented as **deferred**, not removed in this pass |

---

## 4. What P1-DATA will NOT touch

- P1-AUTH implementation files
- Neu-glass visual commits
- Instagram / brand assets
- Historical migrations `001`â€“`015`
- `apps/mobile` (Expo frozen)
- Android â†’ `apps/android` migration

---

## 5. Risk register

| Risk | Mitigation |
|------|------------|
| `016` + docs untracked while wave 7 committed | Stage P1-DATA block as separate commit before P1-AUTH |
| Web dashboard reads Prisma | Document as **PARTIAL** web contract; rewire in P1-AUTH or follow-up |
| Android in-memory `WorkoutSessionStore` | Document offline queue semantics; Room = later phase |
| Demo identity split (`a-ines` web vs `ath-1` android) | LOCAL_DEMO only; production uses Firebase UID |

---

## 6. Next human actions

1. Commit untracked P1-DATA artifacts (`016`, `canonical.ts`, `docs/data/*`, web tests).
2. Keep P1-AUTH / HC telemetry / wear changes in separate commits.
3. Do **not** start P1-AUTH until P1-DATA exit gate reviewed.
