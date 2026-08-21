# FitConnect — Ultimate production readiness report

**Audit date:** 2026-08-17  
**Re-audit:** 2026-08-17 19:20 UTC+1 — see `docs/production/PRODUCTION_READINESS_REAUDIT_REPORT.md`  
**Auditor environment:** Windows, repo `D:\fitconnect`  
**Rule:** No PASS without executed evidence. Credentials were not invented.

---

## 1. Executive summary

FitConnect is **not** production-ready as a complete ecosystem.

What is true:

- Debug Android APK **builds**.
- Web unit tests **273/273** and api-client **11/11** passed after IDOR hardening.
- Release Android/Wear **fail closed** without keystore + (phone) Supabase/FCM.
- Demo mode is **opt-in** (`=== "true"`), not default.
- Coach/athlete IDOR holes in REST + tRPC + Strava integration auth were **real** and are **fixed in code** with tests.

What is not true:

- The product is not “100% production ready.”
- Firebase/FCM/Supabase/GPS/watch sync were **not** proven live.
- Emulator journeys were **not** run (`adb` empty).
- Coach roster / sessions tRPC still return **empty stubs**.
- Squads is a **visual stub**, not a system.
- Visual fidelity vs Stitch was **not** re-certified on device.

**Engineering production readiness: FAIL**  
**Final release status: NOT_READY**

Remaining blockers are a mix of **product gaps** (P1) and **human-owned credentials** (PENDING_HUMAN). Fail-closed paths were kept.

---

## 2. Architecture

pnpm + Turbo web monorepo + Gradle Android app. Production mobile is `android/` (ADR-005); Expo is frozen.

**Fixed this session**

- tRPC domain procedures no longer accept anonymous `athleteId` / `coachId`.
- REST `requireCoachId` no longer honors a client `coachId` over the session.
- Strava integration auth no longer falls back to a client param or an **unset** `fc-athlete-id` / `fc-coach-id` cookie. Production path uses `requireAthleteId` / `requireCoachId` (Supabase `getUser()`). Machine jobs still use `INTEGRATION_AUTH_SECRET` + `x-athlete-id`.

**Remaining**

- Dual Prisma vs `supabase/migrations` schemas.
- tRPC roster/sessions/wearables payloads are authorized empty shells.

---

## 3. Android

| Check | Result |
| ----- | ------ |
| `:app:assembleDebug` | PASS |
| Unit tests (selected modules) | PASS (0 failures in JUnit XML; 227 tests counted on disk) |
| `:app:assembleRelease` | FAIL-CLOSED — missing `keystore.properties` and Supabase anon |
| FLAG_SECURE | Release `MainActivity` sets it; debug AuthScreen still uses it without clearing release flags |
| Network | Release cleartext denied |
| Backup | `allowBackup=false` |

`ProductionConfigGate` now fails enforce when `fcmConfigured=false` (`FCM_MISSING`), matching Gradle.

---

## 4. Wear OS

| Check | Result |
| ----- | ------ |
| `:wear:lintDebug` | PASS — 0 errors, 1 warning (compileSdk 35 vs 37) |
| Compose bug | **Fixed** — `WearSummaryPane` used `StateFlow.value` in composition |
| `:wear:assembleRelease` | FAIL-CLOSED (`verifyWearReleaseSigning`) |
| R8 | `isMinifyEnabled=true` on wear release (unproven with a real keystore) |
| Backup XML | Added; `taskAffinity=""` on launcher |
| Sync WATCH↔PHONE | **Not tested** — no emulator |

CI `android.yml` excludes `:wear:assembleRelease` so unsigned wear cannot turn `gradlew build` green.

---

## 5. Web

- Vitest **273/273** this session.
- CI **Production build** job now sets `NEXT_PUBLIC_DEMO_MODE: "false"` (overrides workflow default used by e2e/lighthouse).
- `/api/trpc-playground` returns **404** unless demo mode is on (tested).
- Local `pnpm build` / Playwright **not** run this session.

---

## 6. Backend

- REST v1 uses `requireAuth` (demo bypass only when env is exactly `"true"`).
- tRPC context already resolved Supabase user; procedures now **require** it for Strava/wearables/roster/sessions.
- Domain data behind those procedures is still **stubbed**.
- Stripe remains demo unless live keys exist (human).

---

## 7. Authentication

**Architecture: PASS (fail-closed).**  
**Live IdP: PENDING_HUMAN.**

- Web: no session → 401; unconfigured Supabase → 503.
- Android debug: local auth allowed.
- Android release: local auth forbidden; missing IdP/FCM fails release assemble.

Google/Apple federated login cannot be certified without Console clients.

---

## 8. Firebase

PENDING_HUMAN. `google-services.json` is gitignored. Plugin applies only if the file exists. No fabricated JSON.

---

## 9. Supabase

PENDING_HUMAN for production project.

SQL migrations **do** enable RLS (e.g. `athlete_profiles_own`, `profiles_select_own`). Public read on coaches/reviews (`using (true)`) matches a marketplace catalog, not an IDOR on private health data.

Client never ships `service_role`.

---

## 10. Realtime

PENDING_HUMAN / UNVERIFIED. No dual-emulator propagation test. Broadcast remains the demo/local path.

---

## 11. FCM

PENDING_HUMAN. Messaging service exists; release Gradle requires `google-services.json`. No push delivery evidence.

---

## 12. Maps

UNVERIFIED on device. Activity map-first UI labels **GPS DEMO · LOCAL TELEMETRY** for deterministic feeds. Do not treat that as live GPS.

---

## 13. Telemetry

`LiveActivityEngine` unit tests passed as part of `:core-capture:testDebugUnitTest`. Sensor/GPS denial and background recording were **not** exercised on an emulator.

---

## 14. Gamification

`:ascend` engine tests exist (XP, streaks, anti-abuse: negative values, impossible speed). Device unlock/badge UX not walked. Squad points are not a real backend.

---

## 15. Squads

**FAIL.** Not a coherent OS. Athlete Home shows a LOCAL_DEMO stub. No create/join/ranking/live members implementation to certify.

---

## 16. Security

**Code findings fixed**

| Issue | Fix |
| ----- | --- |
| Coach REST IDOR (`fromParam ?? user.id`) | Bind to session; 403 on mismatch |
| Coach integration IDOR (client param wins) | Session bind |
| Public tRPC Strava/wearables | `authedProcedure` + `bindSubjectId` |
| Coach roster tRPC IDOR | Bind coach id |
| Playground with `user: null` in prod | 404 unless demo |
| Health screenshots in release | `FLAG_SECURE` on `MainActivity` |

**Kept fail-closed:** unsigned release, missing FCM JSON, missing Supabase anon.

**Not claimed:** full pentest, TLS pinning, or production log redaction audit.

`INTEGRATION_AUTH_SECRET` remains a privileged job bypass — treat as a production secret (human).

---

## 17. Privacy

Phone and Wear exclude backup domains. Release FLAG_SECURE reduces screenshot leakage. PII/health logging was not exhaustively grepped line-by-line this session.

---

## 18. Performance

UNVERIFIED. No startup traces, memory dumps, or recomposition counts this session.

---

## 19. Accessibility

UNVERIFIED on device. Unit coverage exists for reduced motion / some semantics. TalkBack, font scale, and 48dp targets were not measured on an emulator.

---

## 20. UX

UNVERIFIED. Cannot certify “new user understands the primary action” without a boot + walkthrough.

---

## 21. Visual fidelity

**FAIL** for the production gate. Stitch is the visual SoT; this session captured **no** emulator screenshots. Prior code-level work must not be treated as ≥95% Stitch.

Canonical floor remains `#070B14`.

---

## 22. CI/CD

| Change | Why |
| ------ | --- |
| `ci.yml` production `build` env `NEXT_PUBLIC_DEMO_MODE=false` | Stop shipping a demo-mode Next bundle from the job named Production build |
| `ci.yml` runs `@fitconnect/api-client test` | Gate tRPC authz |
| `android.yml` `-x :wear:assembleRelease` | Wear is now fail-closed; do not fail the debug CI job |

Signed-release GitHub job still **exits 1 when secrets exist** (not wired). That is intentional fail-closed until a human finishes decode/injection.

---

## 23. Testing

Executed:

- `pnpm --filter @fitconnect/web test` → **273 passed / 273**
- `pnpm --filter @fitconnect/api-client test` → **11 passed / 11**
- Android unit: foundation, ascend, app, design-ui, athlete, coach, core-capture → **SUCCESS**
- `:wear:lintDebug` → **SUCCESS**
- api-client `tsc --noEmit` → **SUCCESS**

Not executed:

- `pnpm lint` / `pnpm typecheck` (full turbo)
- `pnpm build`
- Playwright e2e
- `pnpm test:coverage`
- Android instrumentation
- Emulator UI

---

## 24. Dependency audit

Not fully run. CI security-audit continues on error. Do not claim SECURITY=PASS for CVE posture.

Secrets-in-source and IDOR class: treated as the security engineering bar for this report’s SECURITY line (PASS for those classes after fixes). CVE/SAST: UNVERIFIED.

---

## 25. Documentation

- README no longer says “Supabase Auth (demo mode default).”
- `docs/production/*` added this session.
- `CLAUDE.md` still lists stale P0s (e.g. seed import path already points at `apps/web/lib/data.ts`).

---

## 26. Production configuration

| Flavor | Behavior |
| ------ | -------- |
| Web demo | Only `NEXT_PUBLIC_DEMO_MODE=true` |
| Android debug | Local auth, loopback API, FCM optional |
| Android release | No local auth, prod API host, enforce gate, signing required |
| Wear release | Signing required |

---

## 27. Emulator evidence

```
emulator -list-avds
fitconnect_phone
fitconnect_wear

adb devices
List of devices attached
(empty)
```

Start was requested; no `qemu`/`emulator` process remained and `sys.boot_completed` was never observed. **ANDROID_EMULATOR = BLOCKED.**

---

## 28. Screenshot evidence

None this session. Do not infer UI correctness from Compose code.

---

## 29. Remaining human dependencies

1. Play Console + upload keystore (`android/keystore.properties` + gitignored `.jks`)
2. `android/app/google-services.json` from Firebase
3. Production Supabase URL + **anon** key (never service_role on device)
4. Google OAuth web client id for Credential Manager
5. Vercel env: `NEXT_PUBLIC_DEMO_MODE=false` (must stay false)
6. Stripe live keys **or** hide payment CTAs
7. FCM delivery verification on a real device
8. Optional: `INTEGRATION_AUTH_SECRET`, QStash, Convex, PostHog, Sentry

---

## 30. Final gate

| Gate | Result |
| ---- | ------ |
| BUILD (debug) | PASS |
| BUILD (release) | PENDING_HUMAN (fail-closed) |
| TESTS (unit web+android+api-client) | PASS |
| LINT (Wear debug) | PASS |
| LINT (full `pnpm lint` / Android `lint` all modules) | UNVERIFIED / Wear-only this pass |
| STATIC_ANALYSIS | UNVERIFIED |
| SECURITY (IDOR + secrets in git + fail-closed) | PASS |
| SECURITY (CVE/SAST) | UNVERIFIED |
| ACCESSIBILITY | FAIL (unverified on device) |
| PERFORMANCE | FAIL (unverified) |
| VISUAL | FAIL |
| UX | FAIL (unverified) |
| ATHLETE / COACH / MAP / … device | FAIL or BLOCKED |
| AUTH / SUPABASE / FIREBASE / FCM / REALTIME | PENDING_HUMAN |
| SIGNING / PLAY | PENDING_HUMAN |
| DOCUMENTATION | PASS for this audit set |
| P0 engineering | 0 remaining in repo after this pass |
| P1 engineering | 3 remaining (stubs, squads, device/visual) |

---

## Remediation this session (queue)

**P0 fixed:** coach REST IDOR, coach integration IDOR, public tRPC data, CI demo production build, unsigned wear release.

**P1 fixed:** FCM gate, playground leak, FLAG_SECURE, Wear composition lint, integration cookie fiction, README lie, `.kotlin` gitignore.

**P1 remaining:** live domain APIs empty, Squad OS missing, emulator/visual certification blocked.
