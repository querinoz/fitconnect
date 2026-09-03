# P1-AUTH execution report

**Phase:** RECONCILE WORKTREE â†’ P1-AUTH
**Date:** 2026-09-02
**Mode:** engineering / reconciliation / auth foundation
**Production:** **NO-GO**

---

## What ran

| Command | Result |
|---------|--------|
| `pnpm --filter @fitconnect/web test:auth-prod` | **76/76 PASS** (16 files) |
| `pnpm --filter @fitconnect/web typecheck` | **PASS** |
| Live RLS identity + activities (`P0_SEC_LIVE_RLS=1`) | **5/5 + 3/3 PASS** |
| `p1-data-contracts.test.ts` | **7/7 PASS** |
| `.\gradlew.bat :foundation:testDebugUnitTest --tests com.fitconnect.android.foundation.auth.*` | **BUILD SUCCESSFUL** |
| Android `assembleDebug` | **not run** (out of critical path; no emulator) |
| Full `pnpm test` / Playwright | **not run** this phase |
| GitHub Actions `auth-prod-like` | **not executed** (no push) |

---

## Environment sanity (no secrets)

| Item | Status |
|------|--------|
| Node | v20.19.0 |
| pnpm | 9.15.9 |
| Java | 17.0.12 |
| Gradle | 9.5.0 |
| Android SDK | CONFIGURED |
| ADB devices | empty (daemon started) |
| Firebase web env (local `.env.local`) | CONFIGURED |
| Supabase URL/anon (local) | CONFIGURED |
| DATABASE_URL / DIRECT_URL | CONFIGURED |
| `NEXT_PUBLIC_DEMO_MODE` (local file) | DISABLED |
| Process env without dotenv | MISSING (tests used `--env-file`) |
| Production hosted JWT trust | PENDING_HUMAN |

---

## Failure classification

| Issue | Class | Resolution |
|-------|-------|------------|
| `firebase-verify` accept-token failed under jsdom ArrayBuffer realm | CODE_DEFECT | `toBufferSource` via `Buffer.from` â€” 10/10 PASS |
| `ProgressionTarget.targetTimeSec` missing on some returns | PREEXISTING (017 types) | added `targetTimeSec: null` (not Guided Workout) |
| Live Android instrumentation | MISSING_HUMAN_CONFIG / ENVIRONMENT | adb empty |
| 016/017 not on HEAD | ENVIRONMENT (git policy) | accounted on disk; commit PENDING_HUMAN |
| Secret env files present locally | SECRET_RISK | gitignored; not committed |

---

## Exit gate

| Item | Result |
|------|--------|
| Canonical identity documented | YES |
| P1-DATA reconciled (disk + tests) | YES |
| 016 accounted for | YES (untracked, real) |
| 017 accounted for | YES (untracked, real) |
| no migration 001â€“015 rewrite | YES |
| no secret introduced to git | YES (gitignore + unstaged) |
| Firebase UID canonical external id | YES |
| identity_profiles mapping | YES (code + live RLS) |
| role mapping not client-trusted | YES |
| Web auth gate | YES (unit) |
| protected API | YES (unit) |
| demo bypass closed when DEMO_MODE=false | YES (unit + AuthGate) |
| Android auth state / logout / token fail | YES (unit) |
| identity bootstrap | YES (code + RLS) |
| RLS / IDOR regression today | YES |
| CI DEMO_MODE=false job | YES (workflow; remote UNVERIFIED) |
| docs updated | YES |
| no unrelated product scope | YES |

**P1-AUTH engineering:** PASS
**P1-AUTH production:** PENDING_HUMAN
**Git freeze onto origin:** PENDING_HUMAN (no commit/push)

If treating â€œ016 on originâ€ as mandatory for a release stamp, that item remains **BLOCKED** until authorized commits.

---

## NEXT AUTHORIZED PHASE

**WORKOUT-ENGINE WAVE 2**

Do not execute it in this report.
