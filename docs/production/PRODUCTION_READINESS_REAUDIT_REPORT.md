# FitConnect — Production readiness re-audit report

**Re-audit date:** 2026-08-17 19:20 UTC+1  
**Method:** Independent re-inspection of the repository + commands executed in this session.  
**Previous reports:** Not trusted as current evidence unless re-verified.

This is a full re-analysis after the first audit/remediation pass. It is **not** a claim that the product is ready for production.

---

## 1. Executive summary

| Question | Answer |
| -------- | ------ |
| Is the complete FitConnect ecosystem production-ready? | **No** |
| Were P0 IDOR / fail-closed engineering issues still present? | **No — previous fixes are still in the tree and tests still cover them** |
| Did this re-audit invent credentials or disable fail-closed? | **No** |
| Can athlete/coach/watch journeys be certified on device right now? | **No — emulator blocked** |

**ENGINEERING_PRODUCTION_READINESS = FAIL**  
**FINAL_RELEASE_STATUS = NOT_READY**

---

## 2. What was re-checked in code (still true)

### Authentication / IDOR

- `requireCoachId` binds to the authenticated coach; query-param mismatch → 403. Demo branch remains permissive only when demo is on.
- Strava `resolveIntegrationAthlete` / `Coach` use `requireAthleteId` / `requireCoachId` (Supabase `getUser()`), not unset `fc-*-id` cookies.
- tRPC: only `health.ping` is `publicProcedure`. Strava, wearables, roster, sessions are authed + `bindSubjectId`.
- `/api/trpc-playground` returns 404 unless demo mode.

### Fail-closed production

- CI Production build job: `NEXT_PUBLIC_DEMO_MODE: "false"` (workflow default remains `true` for e2e/lighthouse).
- Android release: `verifyReleaseSigning` + `verifyReleaseProductionSecrets` (Supabase anon + FCM JSON).
- Wear release: `verifyWearReleaseSigning`.
- `ProductionConfigGate` includes `FCM_MISSING`.
- Release `MainActivity` sets `FLAG_SECURE`.

### Product gaps (unchanged)

- tRPC `coaches.roster` / `sessions.list` still return **empty arrays**.
- Athlete Home squad: `SQUAD · LOCAL_DEMO` / “Velocity” stub.
- Dual Prisma vs `supabase/migrations`.
- Stripe still demo unless live keys exist.

---

## 3. Commands executed this re-audit

| Command | Result |
| ------- | ------ |
| `pnpm --filter @fitconnect/api-client test` | **11/11 PASS** |
| `pnpm --filter @fitconnect/web test` | **272 passed, 1 failed** (`mobile-app-preview` timed out at 5s under load) |
| Isolated `mobile-app-preview.test.tsx` | **PASS** in 5452ms (over default 5s) then **PASS** in 1038ms after timeout bump |
| Android `:foundation :ascend :app :design-ui :athlete :coach :core-capture` tests + `:app:assembleDebug` | **BUILD SUCCESSFUL** |
| `:app:assembleRelease` | **FAIL-CLOSED** — missing keystore + missing Supabase anon |
| `emulator -list-avds` | `fitconnect_phone`, `fitconnect_wear` |
| WHPX restart (prior job) | **FAIL** `WHPX hr=80070005` access denied |
| Software-accel start (`-accel off -gpu swiftshader_indirect -no-window`) | Process started; `emulator-5554` stayed **offline** for >2 minutes; `sys.boot_completed` never `1` |
| Playwright / `pnpm build` / `pnpm lint` / TalkBack / FCM delivery | **Not run** |

### Flake fixed this re-audit

`components/dashboard/mobile-app-preview.test.tsx` default timeout was 5000ms; under a loaded machine the test took 5452ms. Timeout raised to **15_000ms**. Isolated re-run: PASS.

---

## 4. Architecture

Unchanged: pnpm/Turbo web + Gradle Android. Expo frozen. Production mobile is `android/`.

LOCAL_DEMO paths are labeled. They must not be described as live GPS, live FCM, or live Supabase.

---

## 5. Android

- Debug APK: **PASS** (`assembleDebug`).
- Unit tests: **PASS** this session.
- Release: **PENDING_HUMAN** (intentional fail-closed).
- Permissions, `allowBackup=false`, cleartext denied on release: still in manifest/network config.

---

## 6. Wear OS

- Code + lint from previous pass still present (`collectAsState`, backup XML, minify, signing gate).
- Wear emulator **not** booted this re-audit.
- WATCH↔PHONE sync: **UNVERIFIED**.

Earlier in the day Wear did reach `boot_completed=1` on `emulator-5600` (separate job). That session is **not** current: later `adb devices` was empty. This re-audit does not reuse that as live evidence.

---

## 7. Web

- IDOR unit tests still pass (`require-auth.prod`, `route-auth`, tRPC playground 404).
- Full Vitest this session: **not green** until the timeout fix; full suite was **not** re-run after the bump (cost). Isolated test is green.
- Landing / dashboards: unit coverage exists; E2E not re-run.

---

## 8–11. Auth / Firebase / Supabase / FCM / Realtime

All **PENDING_HUMAN** for live production.

Engineering around them: fail-closed, anon-only on device, no `google-services.json` in git, no fabricated secrets.

SQL migrations still enable RLS. Coaches/reviews `using (true)` is marketplace public-read, not private health IDOR.

---

## 12–15. Maps, telemetry, gamification, squads

| Area | Status | Evidence |
| ---- | ------ | -------- |
| Maps / GPS | UNVERIFIED / not live | No device; LOCAL_DEMO labels in UI |
| Telemetry | Unit PASS (`:core-capture`) | No sensor test |
| Gamification | Unit PASS (`:ascend`) | No device unlock walk |
| Squads | **FAIL** | Home stub only |

---

## 16. Security

Re-grep this session: no live `sk_live_`, no `BEGIN PRIVATE`, no `AIzaSy` in app source. `SUPABASE_SERVICE_ROLE_KEY` appears as an env name in `turbo.json` only.

IDOR class: **PASS** (code + tests). CVE/SAST: **UNVERIFIED** (`pnpm audit` still continue-on-error in CI).

---

## 17–21. Privacy, performance, a11y, UX, visual

All **FAIL or UNVERIFIED** for the production gate because this re-audit has **no boot_completed device**, **no new screenshots**, and no TalkBack/profiler traces.

Prior onboarding screenshots exist under `qa/reports/screenshots/2026-08-17/` but several files share identical sizes after coordinate taps — they do **not** prove Athlete Home.

---

## 22. CI/CD

Still correct after previous pass:

- Production web build job demo **false**.
- Android CI excludes phone **and** wear unsigned `assembleRelease`.
- Signed-release job still exits 1 when secrets exist (not wired).

---

## 23. Testing totals (this re-audit only)

| Suite | Passed | Total | Notes |
| ----- | ------ | ----- | ----- |
| api-client | 11 | 11 | |
| web Vitest (full) | 272 | 273 | 1 timeout flake; then test timeout increased |
| web Vitest (preview, after fix) | 1 | 1 | |
| Android selected modules | SUCCESS | SUCCESS | Cached UP-TO-DATE after prior run |
| E2E | — | — | not run |

Do not add Android JUnit XML disk counts from older runs as “this re-audit passed N tests.”

---

## 24–26. Dependencies, docs, production config

- Dependency CVE scan: not re-run.
- README demo-default lie remains corrected.
- Debug vs release vs demo isolation still holds in code.

---

## 27–28. Emulator / screenshots this re-audit

```
adb devices (start): empty
AVDs: fitconnect_phone, fitconnect_wear
WHPX: Failed to setup partition, hr=80070005
Software accel: emulator-5554 offline for entire 2+ minute poll
sys.boot_completed: never 1
screenshots this re-audit: none
```

**ANDROID_EMULATOR = BLOCKED**  
**WEAR_OS = BLOCKED**

---

## 29. Remaining human dependencies

1. Play Console + upload keystore  
2. `google-services.json` / Firebase / FCM  
3. Production Supabase URL + anon key  
4. Google OAuth web client id  
5. Vercel `NEXT_PUBLIC_DEMO_MODE=false`  
6. Stripe live **or** hide payments  
7. Windows Hypervisor / WHPX access so AVDs can boot on this machine  

---

## 30. P0 / P1 / P2 / P3 (engineering)

| Priority | Count | Items |
| -------- | ----- | ----- |
| P0 | **0** | IDOR and unsigned-release holes remain closed |
| P1 | **3** | (1) tRPC/domain APIs empty stubs (2) Squads not implemented (3) device/visual/UX certification blocked |
| P2 | **6** | Dual schema, Stripe demo, CI audit continue-on-error, GPS vs demo confusion without device, Wear sync untested, compileSdk 35 vs 37 warning |
| P3 | **3** | Stale CLAUDE.md P0 list, ui-glass leftover, pact not in default api-client test |

---

## 31. Final gate

| Gate | Result |
| ---- | ------ |
| BUILD debug | PASS |
| BUILD release | PENDING_HUMAN (fail-closed verified) |
| Unit tests (api-client + Android) | PASS |
| Web unit (full suite this run) | FAIL then flake fixed; full suite not re-run |
| LINT Wear | previously PASS; not re-run this command (release fail aborted the combined task) |
| SECURITY (IDOR + secrets in git) | PASS |
| SECURITY (CVE) | UNVERIFIED |
| ACCESSIBILITY / PERFORMANCE / VISUAL / UX | FAIL (no device) |
| AUTH / SUPABASE / FIREBASE / FCM / REALTIME / SIGNING / PLAY | PENDING_HUMAN |
| ATHLETE / COACH / SQUADS device | FAIL or BLOCKED |

---

## 32. Final status block

```
ENGINEERING_PRODUCTION_READINESS = FAIL
P0_ENGINEERING = 0
P1_ENGINEERING = 3
P2_ENGINEERING = 6
P3_ENGINEERING = 3
AUTOMATED_TESTS = 284 / 285
ANDROID_EMULATOR = BLOCKED
WEAR_OS = BLOCKED
VISUAL_FIDELITY = FAIL
SECURITY = PASS
PERFORMANCE = FAIL
ACCESSIBILITY = FAIL
AUTH = PENDING_HUMAN
SUPABASE = PENDING_HUMAN
FIREBASE = PENDING_HUMAN
FCM = PENDING_HUMAN
REALTIME = PENDING_HUMAN
SIGNING = PENDING_HUMAN
PLAY = PENDING_HUMAN
FINAL_RELEASE_STATUS = NOT_READY
```

`AUTOMATED_TESTS = 284 / 285` = api-client 11/11 + web full 272/273. After the timeout bump the failing test passes in isolation (1/1); the full 273 was not re-executed in this re-audit.
