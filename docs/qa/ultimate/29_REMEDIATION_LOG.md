# 29 — Remediation Log

## Session 2026-08-27 (continuation)

| ID | Fix | Files | Verification |
|---|---|---|---|
| FIX-01 | `make-start.ps1` parse error: PowerShell treated `env:stop` as drive ref; UTF-8 box chars broke parser | `scripts/make-start.ps1` | Script runs; dev server starts on :3001 |
| FIX-02 | `make-start.ps1` false abort when `$LASTEXITCODE` is `$null` after stop | `scripts/make-start.ps1`, `scripts/make-stop.ps1` | `make-start` exits 0 |
| FIX-03 | `make start fitconnect` unsupported — added `fitconnect` alias target | `Makefile`, `make.ps1` | `fitconnect: start` in Makefile |
| FIX-04 | CI did not trigger on `feat/**` branches | `.github/workflows/ci.yml` | branch pattern updated |
| FIX-05 | Production deploy had no test gate | `.github/workflows/vercel-deploy.yml` | test + typecheck steps before build |
| FIX-06 | Stale smoke hero marker `Find my specialist` | `scripts/smoke-test.mjs` | 14/14 smoke PASS |

## Prior session (same run, security)

| ID | Fix | Verification |
|---|---|---|
| SEC-01 | Firebase ID token signature verification | `firebase-verify.test.ts` 10/10 |
| SEC-02 | Stripe webhook fail-closed without DB | `webhook-handler.test.ts` 8/8 |
| SEC-03 | Session feedback auth | route tests |
| SEC-04 | Realtime bridge auth | route tests |
| SEC-05 | Demo cookie bypass removed | middleware tests |

## Session 2026-08-28 (social / squad / ascend / realtime)

| ID | Fix | Files | Verification |
|---|---|---|---|
| FIX-07 | Community feed off localStorage → server API | `app/api/v1/community/posts/route.ts`, `lib/community/server-posts.ts`, `community-feed.tsx` | `community-posts-route.test.ts` 2/2; live POST |
| FIX-08 | Squad challenge server store + API | `app/api/v1/squads/challenges/[id]/route.ts`, `lib/squads/server-challenges.ts` | `squad-challenge-route.test.ts` 2/2; live contribute |
| FIX-09 | Canonical ASCEND progression (Android LevelTable parity) | `lib/ascend/canonical-levels.ts`, `lib/progression/server-store.ts`, `app/api/v1/ascend/progression/route.ts`, `lib/gamification/levels.ts` | `canonical-levels.test.ts` 4/4; `progression-route.test.ts` 2/2 |
| FIX-10 | Realtime bridge testable store | `lib/realtime/bridge-store.ts`, `bridge-route.test.ts` | 2/2 PASS |
| FIX-11 | `android-wear-test.ps1` PowerShell parse | `scripts/android-wear-test.ps1` | gradle 0, both APKs installed |
| FIX-12 | Static web QA script (motion/a11y landmarks) | `scripts/qa-web-static.mjs` | WEB_STATIC_QA_PASS |

## Still open (not fixed this session)

- P0-3 Prisma migration gap
- P0-4 ASCEND **partial** — web canonical API exists; Android HTTP sync not wired
- P1-4..6 Supabase RLS policy gaps
- P1-11 identity-rls integration test skips without DATABASE_URL
- P1-13 Android ViewModel lifecycle
- P1-14 Community **partial** — server LOCAL_DEMO; Supabase table not wired
