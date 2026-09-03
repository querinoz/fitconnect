# FITCONNECT

Connect. Train. Perform.

Elite OS coaching platform: athlete + coach surfaces, Health Connect as the data core, Strava as an own-athlete adapter only.

**Production URL (hosted demo / preview, not a GO launch):** https://fitconnect-phi.vercel.app

**Health:** `/api/health`

Canonical docs: [docs/README.md](docs/README.md)

---

## 1. Product

FitConnect is a coaching SaaS and specialist marketplace with science-grade athlete/coach tooling (readiness, sessions, programs, telemetry, AI-assisted planning).

It is **not** a Strava clone. Social features must never expose Strava-origin sessions to anyone except the athlete who owns them.

## 2. Vision

**Elite OS / Human Performance** — OLED-dark product UI on `--eos-*` tokens (`#070B14` floor, `#C8FF00` voltline). Athlete information architecture: **Today · Analysis · Achievements · Profile**, with **Train** as a FAB menu (not a fifth tab).

Health Connect is the fitness-data core. Providers are adapters behind `FitnessProvider`. Wear OS and web dashboards are additional surfaces, not a second product.

## 3. Current State

Be factual. Labels below are the only status language that should be copied.

| Area | Status |
|------|--------|
| Elite OS visual system | ENGINEERING COMPLETE (tokens / IA / chart palette) |
| Android athlete neu-glass UI | ENGINEERING COMPLETE (waves 0–6: Today · Analysis · Achievements · Profile · Train) |
| Android coach UI | LOCAL DEMO (neu-glass not applied) |
| Android athlete/coach data flows | LOCAL DEMO (many flows) |
| Web landing + dashboards | LOCAL DEMO / PARTIAL (CI keeps an explicit demo job; **auth-prod-like** job uses DEMO_MODE=false) |
| Firebase + identity APIs | ENGINEERING PASS / PRODUCTION_AUTH PENDING_HUMAN |
| Postgres RLS identity SQL | ENGINEERING PASS (live IDOR 2026-09-02); hosted JWT trust PENDING_HUMAN |
| Strava own-athlete OAuth | PARTIAL (P0-SEC engineering PASS 2026-08-29; policy ops remain) |
| GPS / live capture | PLANNED / placeholder (`EliteCapture`) |
| Realtime production default | UNVERIFIED (Broadcast still CI/demo default) |
| Watch phone sync | UNVERIFIED |
| ASCEND | PARTIAL (canonical SQL path + labeled demo adapters) |
| Social / Squad persistence | PLANNED (v1 has **no** Stories/Reels) |
| Human production infra | PENDING_HUMAN |
| **Release** | **PRODUCTION NO-GO** |

P0-SEC is **historical PASS** (2026-08-29). P1-DATA is **reconciled** (`016`/`017` on this branch). P1-AUTH **engineering** is PASS. Production remains **NO-GO**. Next authorized **product** phase: **WORKOUT-ENGINE WAVE 2** (not started).

## 4. Current Roadmap

[docs/master-plan/21_FINAL_ROADMAP.md](docs/master-plan/21_FINAL_ROADMAP.md)

## 5. Current Phase

**P1-AUTH engineering PASS. Production auth PENDING_HUMAN. History freeze: local commits on this branch, not pushed.**

Next authorized phase (do not auto-start): **WORKOUT-ENGINE WAVE 2**

Historical sequence in the frozen master plan is not the current truth. P0-SEC already stamped PASS.

## 6. Architecture

Canonical decisions: [docs/master-plan/18_TECHNOLOGY_DECISIONS.md](docs/master-plan/18_TECHNOLOGY_DECISIONS.md) and [docs/adr/](docs/adr/).

| Layer | Current technology |
|-------|-------------------|
| Web | Next.js (App Router) + TypeScript + Tailwind + pnpm/Turborepo |
| Mobile | Kotlin + Jetpack Compose (`android/`) |
| Watch | Wear OS (`android/wear`) — device certification UNVERIFIED |
| Frozen mobile | Expo 52 (`apps/mobile`) — ADR-005, no new features |
| Identity | Firebase Auth UID (engineering path) |
| Database | Supabase Postgres + RLS (live apply PENDING_HUMAN) |
| Server mapper | Prisma (privileged server only; not a second user-facing schema) |
| Realtime (target) | Convex events + Supabase presence/chat |
| Realtime (today) | BroadcastChannel / demo default in CI |
| Fitness data | Health Connect via `FitnessProvider` (Jetpack **1.1.0**, read path on Android) |
| Strava | Own-athlete adapter; must not enter social graphs |
| Metrics | Elite Core (Rust) — PARTIAL |
| Maps | MapLibre / OpenFreeMap after real GPS — GPS UNVERIFIED |
| Payments | Stripe demo-shaped — not go-live |
| Hosting | Vercel (`apps/web`) |

## 7. Applications

| App | Path | Status |
|-----|------|--------|
| Android athlete/coach | `android/` | LOCAL DEMO / assembleDebug used in engineering |
| Web (landing + dashboards + API) | `apps/web/` | LOCAL DEMO / hosted preview |
| Wear OS | `android/wear/` | APK path exists; pairing UNVERIFIED |
| Expo (legacy) | `apps/mobile/` | DEPRECATED / frozen |

## 8. Core Product

| Domain | Status |
|--------|--------|
| Athlete OS (Today / Analysis / Achievements / Profile + Train FAB) | PARTIAL — **neu-glass UI ENGINEERING COMPLETE** (Android); data often LOCAL DEMO |
| Coach OS | PARTIAL — UI; live roster/authz UNVERIFIED |
| Performance / readiness / telemetry | PARTIAL — demo + mixed stores |
| Social v1 (profiles, posts, photos, comments, reactions, privacy) | PLANNED persistence; **no Stories/Reels** |
| Squad | PLANNED after social |
| ASCEND | PARTIAL — Android engine + web store not one truth |
| Map | PARTIAL — stub / demo polyline; live GPS UNVERIFIED |
| Telemetry live stream | UNVERIFIED in production |
| AI plan / context | PARTIAL — not a production model trained on Strava |

## 9. Android

Kotlin + Jetpack Compose. Debug package: `com.fitconnect.android.debug`.

```powershell
cd android
.\gradlew.bat :foundation:test
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :wear:assembleDebug
```

Local QR install (same Wi-Fi, no USB):

```powershell
pnpm android:qr
```

Emulator (often BLOCKED without WHPX/AEHD):

```powershell
emulator -list-avds
emulator -avd fitconnect_phone
```

Guides: [docs/android/ANDROID_LOCAL_DEMO_GUIDE.md](docs/android/ANDROID_LOCAL_DEMO_GUIDE.md) · [docs/android/README.md](docs/android/README.md)

**Neu-glass (athlete surfaces):** [docs/design/ELITE_OS_NEU_GLASS.md](docs/design/ELITE_OS_NEU_GLASS.md) · wave report [android/docs/elite-os-neu-glass-wave6.md](android/docs/elite-os-neu-glass-wave6.md)

**Strength workout engine (openGym gap — native, not a clone):** Wave 1 domain foundation — `ProgressionEngine`, `OneRepMaxEstimator`, migration `017`, specs in [docs/product/workout-engine/](docs/product/workout-engine/) · gap analysis [docs/product/open-gym-gap-analysis/](docs/product/open-gym-gap-analysis/). Guided execution UI = **PLANNED** (Wave 2).

Regenerate Compose tokens after `packages/design-tokens` changes:

```powershell
pnpm tokens:kotlin
```

`assembleRelease` / Play signing / `google-services.json` for FCM: **PENDING_HUMAN**. Not claimed here.

## 10. Web

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Default local port: **3001**.

Windows native without Make:

```bash
pnpm env:start
```

```bash
pnpm build
pnpm start
pnpm typecheck
pnpm lint
```

Makefile (Git Bash / WSL / macOS): `make start` · `make test` · `make build` · `make status`

## 11. Testing

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm test:integration
pnpm smoke
pnpm smoke:mobile
pnpm smoke:all
```

Android unit tests (from `android/`):

```powershell
.\gradlew.bat :foundation:test
```

Counts in old reports are HISTORICAL. Re-run before citing PASS.

## 12. Local Demo

**Web (explicit demo query, not production auth):**

| Persona | Email | Route |
|---------|-------|--------|
| Athlete | `ines@fitconnect.local` | `/dashboard?demo=1` |
| Coach | `tomas@fitconnect.local` | `/coach/dashboard?demo=1` |
| Multi-sport | `marina@fitconnect.local` | athlete demo |
| Admin | `admin@fitconnect.local` | `/admin` |

These are **LOCAL DEMO** identities. They are not production credentials.

**Android LOCAL DEMO** personas (debug APK): see [docs/android/ANDROID_LOCAL_DEMO_GUIDE.md](docs/android/ANDROID_LOCAL_DEMO_GUIDE.md).

Do not use demo mode as a silent production fallback.

## 13. Environment Variables

Copy [.env.example](.env.example) to `.env.local`. Never commit secrets.

Validate: `pnpm env:check`

Production-like intent: `NEXT_PUBLIC_DEMO_MODE=false`. CI still uses demo-on today — that is a P0-SEC / P1-AUTH concern, not a GO.

## 14. Production Status

**PRODUCTION = NO-GO**

Why (see [docs/master-plan/23_GO_NO_GO.md](docs/master-plan/23_GO_NO_GO.md)):

- P0 security themes open (Strava allowlist drift, webhook/job fail-closed, account deletion, legal URLs, unproven live RLS, rate limiting)
- Production Firebase / Supabase / signing / FCM / Play: PENDING_HUMAN
- CI E2E still trained on demo mode
- GPS, Watch Data Layer, and production realtime defaults: UNVERIFIED

Hosted Vercel is a preview, not a certified production SaaS.

## 15. Human Actions

Canonical: [docs/master-plan/17_HUMAN_ACTION_PLAN.md](docs/master-plan/17_HUMAN_ACTION_PLAN.md)

Also: [docs/auth/HUMAN_AUTH_CONFIGURATION.md](docs/auth/HUMAN_AUTH_CONFIGURATION.md) · [docs/android/ANDROID_HUMAN_PENDING.md](docs/android/ANDROID_HUMAN_PENDING.md) · [docs/HUMAN_FINAL_CONFIGURATION.md](docs/HUMAN_FINAL_CONFIGURATION.md)

Do not paste secrets into chat.

## 16. Master Plan

Full folder: [docs/master-plan/](docs/master-plan/)

| Doc | Topic |
|-----|--------|
| [00_EXECUTIVE_SUMMARY.md](docs/master-plan/00_EXECUTIVE_SUMMARY.md) | Verdict |
| [03_PRODUCT_STATUS.md](docs/master-plan/03_PRODUCT_STATUS.md) | What is real vs demo |
| [12_SECURITY_AUDIT.md](docs/master-plan/12_SECURITY_AUDIT.md) | Security |
| [17_HUMAN_ACTION_PLAN.md](docs/master-plan/17_HUMAN_ACTION_PLAN.md) | Human infra |
| [21_FINAL_ROADMAP.md](docs/master-plan/21_FINAL_ROADMAP.md) | Phase sequence |
| [22_PHASE_EXIT_GATES.md](docs/master-plan/22_PHASE_EXIT_GATES.md) | Gates |
| [23_GO_NO_GO.md](docs/master-plan/23_GO_NO_GO.md) | NO-GO |

## 17. Documentation Index

[docs/README.md](docs/README.md) — canonical current documents only.

Historical evidence: [docs/archive/](docs/archive/).

## 18. Repository Structure

```
fitconnect/
├── android/                 # Kotlin + Compose (athlete/coach) + wear/
├── apps/
│   ├── web/                 # Next.js — landing, dashboards, API routes
│   └── mobile/              # Expo 52 — frozen (ADR-005)
├── packages/                # types, utils, ai, design-tokens, api-client, strava-integration, …
├── elite-core/              # Rust metrics / streams (PARTIAL)
├── convex/                  # Convex functions (realtime target)
├── prisma/                  # Prisma schema + seed
├── supabase/migrations/     # Postgres + RLS SQL
├── docs/
│   ├── master-plan/         # Frozen roadmap (24 files)
│   ├── adr/                 # Architecture Decision Records
│   ├── architecture/
│   ├── android/
│   ├── auth/
│   ├── data/
│   ├── security/
│   ├── design/
│   ├── qa/
│   ├── release/
│   ├── archive/             # HISTORICAL
│   └── documentation/       # Cleanup report
├── scripts/                 # Dev orchestration, smoke, reporting
├── qa/                      # Device / gate artifacts
└── .github/workflows/       # CI (do not treat green CI as production GO)
```

## 19. Development Commands

Verified from root `package.json` / `Makefile` / `android/`:

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install workspace |
| `pnpm dev` | Web dev server (`@fitconnect/web`) |
| `pnpm env:start` | Windows helper for local web |
| `pnpm build` | Turbo production build |
| `pnpm test` | Turbo unit tests |
| `pnpm typecheck` / `pnpm lint` | CI parity |
| `pnpm smoke` / `pnpm smoke:mobile` | HTTP / PWA smoke |
| `pnpm android:qr` | Debug APK QR distribution |
| `pnpm tokens:kotlin` | Generate Compose color tokens |
| `.\gradlew.bat :app:assembleDebug` | Android debug APK (from `android/`) |

## 20. Release

Future sequence (do not skip):

Engineering → Security (P0-SEC) → Data → Auth → Core → GPS → Realtime → ASCEND → Social → Squad → Watch → QA → Human Configuration → Release Candidate → Play

Until that sequence clears: **PRODUCTION = NO-GO**.

---

MIT · [LICENSE](LICENSE)
