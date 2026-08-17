# FitConnect — Production readiness initial inventory

**Date:** 2026-08-17  
**Method:** Repository inspection this session. Previous PASS reports were **not** trusted.

This inventory is the Phase 0 snapshot **plus** what was verified while remediating. It is not a claim that the product is ready.

---

## 1. Monorepo

| Path | Role |
| ---- | ---- |
| `apps/web` | Next.js 14 — landing, dashboards, REST `/api/v1`, tRPC `/api/trpc`, PWA |
| `apps/mobile` | Expo 52 — **frozen Path A** (ADR-005). Not the production mobile binary. |
| `android/` | Production mobile: Kotlin + Jetpack Compose |
| `packages/` | types, utils, ai, design-tokens, api-client, maps, realtime-client, strava-integration, db, config, elite-core-wasm |
| `prisma/` | ORM schema + seed (`apps/web/lib/data.ts` import is valid) |
| `supabase/migrations/` | Parallel SQL (10 files) with RLS — dual schema vs Prisma |
| `convex/` | Hybrid realtime (generated; not the sole source of truth) |
| `elite-core/` | Rust metrics crate |
| `.github/workflows/` | `ci.yml`, `android.yml`, `vercel-deploy.yml`, `security.yml`, `sast.yml`, `elite-core-rust.yml`, `eas-preview.yml` |

**Prod URL:** https://fitconnect-phi.vercel.app

---

## 2. Android modules (`android/settings.gradle.kts`)

`:app` `:wear` `:shared` `:ascend` `:core-capture` `:design` `:design-ui` `:foundation` `:sports` `:geo` `:telemetry` `:community` `:ai` `:athlete` `:coach`

- **Athlete OS / Coach OS:** Compose feature modules under `:athlete` / `:coach`
- **Watch:** `:wear` (Compose for Wear OS) + phone `FitConnectWearListenerService`
- **Gamification:** `:ascend` (XP, streaks, anti-abuse). Squad OS is **not** an engine — Home has a LOCAL_DEMO stub.
- **GPS/telemetry:** `:core-capture` `LiveActivityEngine` — LOCAL_DEMO / simulated feeds are labeled; not live GPS.

---

## 3. Web surface

- Landing + marketing (`apps/web/app/(marketing)`)
- Athlete / coach / admin dashboards
- Auth gate (`NEXT_PUBLIC_DEMO_MODE === "true"` only; unset/false is fail-closed)
- Stitch-aligned mobile primitives: `apps/web/components/mobile/stitch-native-primitives.tsx`

---

## 4. Backend / API

- REST `apps/web/app/api/v1/**` — `requireAuth` / `requireAthleteId` / `requireCoachId`
- tRPC `packages/api-client` — health public; domain procedures authed (this session)
- Strava package `@fitconnect/strava-integration`
- Stripe routes exist; payment path is still **demo** unless live keys are supplied (human)
- Dual data: Prisma (app) vs Supabase SQL (PostgREST/RLS). Unification is incomplete.

---

## 5. Auth / Firebase / FCM / Supabase

| Piece | Repo state |
| ----- | ---------- |
| Web demo | Only when `NEXT_PUBLIC_DEMO_MODE=true` |
| Android debug | `ALLOW_LOCAL_AUTH=true` |
| Android release | `ALLOW_LOCAL_AUTH=false`, `ENFORCE_PROD_CONFIG=true` |
| `google-services.json` | Gitignored; Google Services plugin applied only if file exists |
| FCM | `ProductionConfigGate` + Gradle `verifyReleaseProductionSecrets` require it for release |
| Supabase on device | Anon URL/key via `local.properties` / env — **never** service_role |
| Production credentials | **Absent in this environment** → PENDING_HUMAN |

---

## 6. CI/CD

- Web CI global env historically `NEXT_PUBLIC_DEMO_MODE=true` (e2e/lighthouse). **Production `build` job now overrides to `false`.**
- Vercel workflow already sets demo false for prod deploy.
- Android CI: debug `build` excluding release assemble; unsigned `assembleRelease` must fail. Wear release now also fail-closed (excluded from `gradlew build` in CI).
- Signed-release job **exits 1 even when secrets exist** (scaffolded, not wired) — keep fail-closed.
- `pnpm audit` / semgrep: `continue-on-error: true`

---

## 7. Tests discovered

- Web Vitest: `apps/web` `lib/**`, `components/**`, `tests/**` (e2e excluded)
- api-client unit tests (this session) + pact suite (`test:pact`)
- Android JUnit under `android/*/src/test`
- Playwright e2e under `apps/web/tests/e2e` — **not executed this session**
- Instrumentation / emulator UI tests — **not executed** (no adb device)

Disabled/skipped examples: pact provider `describe.skipIf`, Prisma migrations `describe.skipIf(!hasDocker)`.

---

## 8. Dead / frozen / experimental

- `apps/mobile` frozen (ADR-005)
- `components/ui-glass/**` legacy (~47 imports) — migrate, do not delete yet
- `--volt-*` aliases in `voltline.css`
- Wear module historically labeled “empty-but-compiling”; it now has a real instrument UI + fail-closed release
- tRPC `coaches.roster` / `sessions.list` / wearables readiness still return **empty stub payloads** (authorized, not live data)

---

## 9. TODOs / FIXMEs / debug paths

- LOCAL_DEMO telemetry and Ascend demo-labeled users are explicit debug/demo paths
- Debug overlay removes FCM/Firebase init providers (intentional)
- Release network: cleartext denied; debug loopback only
- `allowBackup=false` on phone; Wear now has matching backup exclusion XML

---

## 10. Environment / secrets hygiene

- `.env*.local`, `android/local.properties`, `keystore.properties`, `google-services.json`, `*.jks` gitignored
- `android/.kotlin/` and `android/.idea/` gitignored this session
- No `service_role` in Android source
- Fixture JWT prefix in tests is truncated dummy (`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`) — not a live key

---

## 11. Human-owned (do not invent)

1. Supabase production URL + anon key  
2. Firebase / `google-services.json` / FCM  
3. Android upload keystore + Play Console  
4. Stripe live keys  
5. Apple credentials (no iOS production app in this repo)  
6. Integration job secret `INTEGRATION_AUTH_SECRET` / QStash production tokens  

---

## 12. Visual source

- Stitch: https://stitch.withgoogle.com/projects/14054299058988485854  
- Canonical floor: `#070B14` (do not fork `#090402`)  
- Device visual QA this session: **not captured** (emulator did not attach)
