# FitConnect — Production readiness matrix

**Date:** 2026-08-17  
**Rule:** BLOCKED and PENDING_HUMAN are never converted to PASS because the dependency is external.

| AREA | STATUS | EVIDENCE | RISK | SEVERITY | FIXED | REMAINING | HUMAN_DEPENDENCY |
| ---- | ------ | -------- | ---- | -------- | ----- | --------- | ---------------- |
| Repo inventory | PASS | This folder + `settings.gradle.kts` / `package.json` | Low | — | Yes | Keep docs in sync | No |
| Module boundaries | PASS | Android Gradle modules; web packages | Medium coupling via stubs | P2 | Partial | Dual Prisma/Supabase | No |
| Demo isolation | PASS | `isDemoMode()` only if env `=== "true"`; Android debug local auth only | Demo leaking to prod | P0 | Yes (CI build job `false`) | Humans must not set demo true on Vercel prod | Yes (Vercel env) |
| Gradle debug APK | PASS | `:app:assembleDebug` SUCCESS this session | — | — | — | — | No |
| Gradle release APK | PENDING_HUMAN | `:app:assembleRelease` failed closed: missing keystore + Supabase anon | Unsigned mistaken for prod | P0 | Fail-closed kept | Human keystore + secrets | Yes |
| Wear release APK | PENDING_HUMAN | `:wear:assembleRelease` → `WEAR SIGN-02 FAIL-CLOSED` | Unsigned wear | P0 | Fail-closed added | Same keystore | Yes |
| Android unit tests | PASS | foundation/ascend/app/design-ui/athlete/coach/core-capture SUCCESS; 227 JUnit XML tests, 0 failures | Weak UI coverage | P2 | — | No instrumentation | No |
| Wear lint | PASS | `:wear:lintDebug` 0 errors, 1 warning (`compileSdk` 35 vs 37) | Compose state bug | P1 | StateFlow `.value` in composition fixed | SDK bump optional | No |
| Web unit tests | PASS | `pnpm --filter @fitconnect/web test` **273/273** | E2E not run | P2 | IDOR tests added | Playwright this session | No |
| api-client tests | PASS | **11/11** authz + tRPC IDOR | Pact not in default `test` | P3 | Yes | `test:pact` separate | No |
| Web E2E | UNVERIFIED | Not executed this session | Auth/landing regressions | P2 | — | Run Playwright | No |
| Web production build | UNVERIFIED | CI job now `NEXT_PUBLIC_DEMO_MODE=false`; local `pnpm build` not run this session | Demo baked into CI artifact (was P0) | P1 | CI fix | Confirm job on next CI run | No |
| Android emulator | BLOCKED | AVDs `fitconnect_phone`, `fitconnect_wear` exist; `adb devices` empty; emulator process not running after start | Cannot certify journeys | P1 | — | Boot AVD / dismiss crash dialog | Maybe (machine) |
| Wear emulator | BLOCKED | AVD present; not booted | Sync untested | P1 | — | Wear AVD + companion | Maybe |
| Athlete journey | UNVERIFIED | Code exists; no device walkthrough | Broken nav | P1 | Visual prior pass in code | Emulator | No |
| Coach journey | FAIL | tRPC `coaches.roster` returns `athletes: []` even when authorized | Coach OS not live | P1 | Auth IDOR fixed | Real roster backend | Partial (DB) |
| Squads | FAIL | Home LOCAL_DEMO Velocity stub; no Squad engine | Feature gap | P1 | — | Implement Squad OS | No |
| Gamification | PASS | `:ascend` unit tests + anti-abuse (negative XP, impossible speed) | Replay/offline duplication beyond unit tests | P2 | — | Device completion path | No |
| Map / GPS | UNVERIFIED | LOCAL_DEMO labeled in Activity UI; live GPS not tested | False “live GPS” | P1 | Labels exist | Real GPS device | No |
| Telemetry | UNVERIFIED | `LiveActivityEngine` tests; no sensor/emulator GPS | Demo vs real confusion | P2 | Engine tests | Device | No |
| Auth architecture | PASS | Fail-closed without IdP; local auth debug-only | Prod IdP missing | P0 creds | IDOR + session bind | Firebase/Supabase prod | Yes |
| Auth live | PENDING_HUMAN | No production credentials in env | Login will 503/fail closed | — | — | Supply IdP | Yes |
| Firebase | PENDING_HUMAN | Plugin + gate; no `google-services.json` here | FCM/auth inert | — | Gate `FCM_MISSING` | Console JSON | Yes |
| FCM | PENDING_HUMAN | Channels/service in app; no delivery test | No push | — | Release requires JSON | Token + device | Yes |
| Supabase | PENDING_HUMAN | Anon-only on device; SQL has RLS; prod keys absent | Dual schema drift | P2 | Integration routes use `getUser()` | Prod project + unify schema | Yes |
| Realtime | PENDING_HUMAN | Hybrid Convex/Supabase/Broadcast; no dual-client test | Stale presence | P2 | — | Creds + two clients | Yes |
| tRPC IDOR | PASS | Strava/wearables/roster/sessions bind to `ctx.user`; anonymous rejected | Empty stubs | P1 data | Yes | Fill implementations | No |
| REST coach IDOR | PASS | `requireCoachId` binds to session; param mismatch 403 | — | P0 | Yes | — | No |
| Integration IDOR | PASS | No longer trusts unset `fc-*-id` cookies; uses Supabase session; job bearer still needs `INTEGRATION_AUTH_SECRET` | Job secret leak | P2 | Yes | Rotate/set secret | Yes |
| tRPC playground | PASS | `/api/trpc-playground` **404** unless demo | Info leak | P1 | Yes | — | No |
| Security (secrets in git) | PASS | No live `sk_live` / service_role in source; FLAG_SECURE on release MainActivity | Screenshot on debug | P2 | FLAG_SECURE | Human secrets | Yes |
| Privacy | PASS | `allowBackup=false`; Wear extraction rules exclude all domains | Health data in logs | P2 | Wear XML | Audit log statements | No |
| Performance | UNVERIFIED | No startup/memory traces this session | Jank | P2 | — | Profiler + emulator | No |
| Accessibility | UNVERIFIED | Reduced-motion tests exist; no TalkBack/font-scale device pass | a11y debt | P2 | — | Device | No |
| Visual vs Stitch | FAIL | No new screenshots; prior code estimate ≪ 95% | Brand break | P1 | Token/home work earlier | Device visual QA | No |
| Landing ↔ mobile | UNVERIFIED | Shared tokens (`#070B14`); no side-by-side this session | Split product | P2 | Floor token unified | Visual QA | No |
| UX | UNVERIFIED | Cannot walk flows without emulator | Onboarding drop-off | P1 | — | Emulator | No |
| Offline | UNVERIFIED | Not injected this session | Corruption | P2 | — | Airplane mode | No |
| CI fail-closed | PASS | Android unsigned release must fail; wear excluded from green `build` | Fake prod success | P0 | Wear `-x assembleRelease` | Wire signed job later | Yes |
| Dependencies | UNVERIFIED | No full `pnpm audit` gate (continue-on-error) | CVEs | P2 | — | Human triage | No |
| Documentation | PASS | README demo-default lie corrected | CLAUDE.md stale P0 list | P3 | README | Refresh CLAUDE.md | No |
| Signing | PENDING_HUMAN | Intentional Gradle failure | — | — | — | Keystore | Yes |
| Play Console | PENDING_HUMAN | Ownership not in repo | — | — | — | Human | Yes |
| Observability | UNVERIFIED | PostHog/Sentry env optional | Blind prod | P2 | — | DSN keys | Yes |

### Status counts (this matrix)

- **PASS:** inventory, debug APK, unit tests (web/android/api-client), wear lint, demo isolation, fail-closed release, IDOR fixes, playground, secrets-in-git, backup flags, CI exclusion, README  
- **FAIL:** coach live roster, squads, visual vs Stitch  
- **BLOCKED:** Android emulator, Wear emulator  
- **PENDING_HUMAN:** signing, Play, Firebase, FCM, Supabase prod, realtime creds, Stripe live  
- **UNVERIFIED:** E2E, web `pnpm build`, athlete device journey, GPS live, performance, a11y, UX, offline, landing parity
