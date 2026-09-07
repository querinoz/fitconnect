# Repository Reconciliation — FitConnect

**Date:** 2026-08-29
**Executor:** Cursor Agent (reconciliation-only gate)
**Working directory:** `D:\fitconnect`
**Git root:** `D:/fitconnect`
**Remote:** `origin` → `https://github.com/querinoz/fitconnect.git`
**Current branch:** `feat/elite-os-v2` @ `dcfdac0` (synced with `origin/feat/elite-os-v2`: 0 ahead / 0 behind)

**Gate status:** RECONCILIATION COMPLETE · **IMPLEMENTATION NOT STARTED**

---

## 0. Verdict (read this first)

| Claim from prior summaries | Truth |
| --- | --- |
| “FitConnect is only Next.js / PWA — no Android” | **FALSE** |
| Android / Kotlin / Compose exist locally | **TRUE** — `android/` multi-module Gradle project |
| Wear OS exists | **TRUE** — module `:wear` under `android/wear` |
| Android is missing from GitHub | **FALSE** on product branches; **TRUE** on `main` |
| Safe to recreate `apps/android` / `apps/wear` from scratch | **NO — DO NOT RECREATE** |

**Canonical native mobile:** `android/` (ADR-005).
**Canonical web:** `apps/web`.
**Canonical Wear:** `android/wear` (not a top-level `apps/wear`).
**Legacy Expo:** `apps/mobile` — **FROZEN**; do not revive.

---

## 1. Local state

### 1.1 Top-level layout (actual)

```
fitconnect/
├── android/          ← NATIVE product (phone + wear modules)
├── apps/
│   ├── web/          ← Next.js (Vercel)
│   └── mobile/       ← Expo 52 FROZEN (ADR-005)
├── packages/         ← api-client, types, db, design-tokens, strava-integration, …
├── elite-core/       ← Rust physiology core
├── prisma/           ← server ORM schema
├── supabase/         ← SQL migrations + RLS (15 files)
├── convex/           ← realtime / generated
├── docs/             ← master-plan + domain docs
├── qa/               ← evidence (incl. android/wear screenshots)
├── scripts/
├── Makefile / make.ps1
└── …
```

Preferred tree from the master prompt (`apps/android`, `apps/wear`) is **aspirational**.
**Do not migrate** `android/` → `apps/android` in this phase unless benefit is proven and Vercel/Gradle/CI are rewired safely.

### 1.2 Android / Wear (preserved)

| Fact | Evidence |
| --- | --- |
| Gradle root | `android/settings.gradle.kts` → `fitconnect-android` |
| Modules | `:app` `:wear` `:shared` `:ascend` `:core-capture` `:core:fitness` `:design` `:design-ui` `:foundation` `:sports` `:geo` `:telemetry` `:community` `:ai` `:athlete` `:coach` |
| Kotlin files (local) | **396** under `android/` |
| Kotlin files (git-tracked) | **396** — no orphan untracked `.kt` source |
| Tracked android paths (branch) | **518** files |
| Wear app sources | `android/wear/src/main/java/…/WearMainActivity.kt`, Data Layer, tiles, complications |
| Phone↔Wear bridge | `FitConnectWearListenerService`, `GmsWearBridge`, `WearSessionLink`, shared codecs |
| Local status (docs) | LOCAL DEMO · Watch sync **UNVERIFIED** · PRODUCTION **NO-GO** |

**Module Kotlin counts (approx.):** foundation 77 · design-ui 54 · athlete 30 · telemetry 29 · app 28 · coach 26 · shared 25 · community 24 · ai 24 · ascend 23 · sports 15 · geo 14 · wear 10 · core 10 · core-capture 6 · design 1.

### 1.3 Web / packages / data

| Area | Present | Notes |
| --- | --- | --- |
| `apps/web` | Yes | Next.js App Router · Vercel |
| Packages | 11+ | api-client, types, db, design-tokens, strava-integration, realtime-client, maps, utils, ai, config, elite-core-wasm |
| Prisma | Yes | 21 models (User → UserSubscription) |
| Supabase SQL | Yes | **15** migrations |
| Convex | Yes | Not canonical for USER/ACTIVITY rows |
| Firebase signals | ~163 files | Auth engineering; production config PENDING_HUMAN |
| Stripe signals | ~123 files | Live wiring on branch; secrets must stay out of git |
| Health Connect | ~27 files | Android core |
| FusedLocation | ~13 files | Present; GPS product maturity still gated |
| Credential Manager | ~2 files | Thin / incomplete vs target |

### 1.4 Uncommitted / untracked work (preserve — do not clean -fd)

Mostly **brand + Instagram marketing**, not Android:

- Modified: logo SVGs/PNGs, `scripts/export-brand-logo.mjs`, Instagram publish scripts, `.env.example`
- Deleted (working tree): old Instagram reel MP4s under `apps/web/public/instagram/generated/`
- Untracked: `content/instagram/v2/`, `apps/web/public/instagram/v2/`, `.idea/`, `.artifacts/`, zip kits, `qa/evidence/`, logo previews

**Android source tree is clean** relative to HEAD (no pending android deletes/creates in porcelain).

---

## 2. Remote / GitHub state

| Ref | Android tracked files | Role |
| --- | --- | --- |
| `origin/feat/elite-os-v2` (current) | **518** | Active product branch · Instagram + Elite OS + android |
| `origin/feature/fitconnect` | **463** | Prior product branch · HEAD is **13 commits ahead** of it |
| `origin/chore/android-phase-13r-recovery` | **338** | Recovery / CI branch |
| `origin/main` | **0** | Web-centric; **does not represent** full product |
| Phase branches (`phase-01`…`phase-13`) | Point at docs snapshot `7843233` | Not active delivery tips |

**Divergence interpretation:**

- **A — Local Android present and pushed:** YES on `feat/elite-os-v2` / `feature/fitconnect`.
- **B — Android on another branch only:** Partially — `main` lacks it; product work lives on feature branches.
- **C — Android only ignored/untracked:** NO — tracked; ignores are build/local only (`.gradle`, `local.properties`, `google-services.json`, keystores).
- **D — GitHub behind local:** NO for current branch (0/0). Uncommitted brand/IG work is local-only.
- **E — Multiple historical structures:** YES — Expo mobile + native android + dual Prisma/Supabase + Convex + phase docs.

---

## 3. Branch map (local)

```
* feat/elite-os-v2                   dcfdac0 = origin/feat/elite-os-v2
  feature/fitconnect                 behind origin by 16 (local tip older)
  chore/android-phase-13r-recovery   synced
  main                               synced tip without android tree
  f0/foundations + phase-*          docs-era tips
  qa/cycle-01                        synced
```

---

## 4. Architecture truth (frozen for next phase)

```
                    ONE FITCONNECT
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   apps/web (Next)   android/:app      android/:wear
         │                 │                 │
         └────────┬────────┴────────┬────────┘
                  ▼                 ▼
           Firebase Auth      Supabase Postgres + RLS
           (identity)         (product data)
                  │
                  ├── Stripe (server-only secrets)
                  ├── Health Connect / providers
                  ├── Elite Core (metrics)
                  └── Realtime (Convex events · Supabase presence — decide default)
```

| Concern | Canonical | Must not |
| --- | --- | --- |
| Mobile | Native Kotlin Compose `android/` | Revive Expo features |
| Wear | `android/wear` + Data Layer | Fake “Watch PASS” without evidence |
| Web | `apps/web` | Break Vercel root/app mapping |
| Identity | Firebase UID | Dual IdP (Firebase + Supabase Auth) |
| Data | Supabase Postgres + RLS | Device/service-role bypass for user rows |
| Privileged DB | Prisma / service role **server-only** | Secrets in APK / browser |
| Design | `--eos-*` / Elite OS | Generic Material-only replacement |
| Strava | Own-athlete only; never social | Allowlist drift web vs Android |
| Demo | `LOCAL_DEMO` / explicit flags | Demo writes as production users |

**Production:** **NO-GO** (master-plan `23_GO_NO_GO.md`, README). Next engineering phase historically: **P0-SEC**.

---

## 5. Missing components (gaps — not “absent platforms”)

Android/Wear **exist**. Gaps are maturity, unification, and production config:

### P0 — security / correctness

- Strava allowlist drift (web vs Android)
- Live RLS verification with Firebase UID mapping
- Demo mode defaults in CI / production posture
- Secret hygiene (Stripe rotation if exposed in chat; never commit secrets)
- Account deletion / legal / rate-limit themes (see master-plan security)

### P1 — foundations

- Single ASCEND/XP engine (Android ascend vs web gamification)
- Single readiness / activity event idempotency across platforms
- Realtime default (Broadcast still CI/demo path)
- Auth: Credential Manager depth · Apple PENDING_HUMAN · production Firebase/Supabase
- Stripe: webhook verification + Connect scope vs actual product · no fake success
- GPS / EliteCapture: real fused location + foreground service vs placeholder
- Phone↔Wear: runtime evidence still UNVERIFIED
- Makefile `start fitconnect`: web-centric today; Android/Wear called out as **not** started by `make-start.ps1`

### P2 — product completeness

- Squad / social honesty (no Stories/Reels invent)
- Landing accuracy vs implemented features
- Docs recovery folder (this file) + later architecture/auth/data reports
- Expo `apps/mobile` quarantine messaging

### P3 — polish

- Dependency modernization (Compose/AGP/Firebase BoM — verify before upgrade)
- Doc archive consolidation under `docs/`
- AVD automation in `make start fitconnect` without killing unrelated processes

---

## 6. Implementation plan (STOP here — await approval)

### Phase R0 — already done (this document)

1. Inspect local / git / remote
2. Prove Android + Wear existence
3. Record divergences and uncommitted work
4. Freeze “do not recreate native”

### Phase R1 — plan only until human says GO

| Step | Action | Risk if skipped |
| --- | --- | --- |
| 1 | Diff `feat/elite-os-v2` vs master-plan gap matrix; refresh P0/P1 list with evidence | Wrong rebuild |
| 2 | Decide: keep `android/` path (recommended) vs migrate to `apps/android` | Break CI/Vercel/Gradle |
| 3 | Auth/data plan: Firebase + Supabase third-party JWT + RLS apply order | Dual identity |
| 4 | Payments plan: server Stripe only; rotate any chat-exposed test secret offline | Secret leak |
| 5 | ASCEND/Squad/telemetry consolidation plan (one event → one XP) | Double rewards |
| 6 | QA plan: Gradle assembleDebug, Wear assemble, web test/typecheck, emulator GPS, Wear node | Paper PASS |
| 7 | Commit/push policy: logical commits; no APK/secrets; never force-push | History loss |

### Explicitly deferred (do not run until approved)

- Creating new `apps/android` or `apps/wear` scaffolds
- `git reset --hard` / `git clean -fd`
- Force-push / destructive branch checkout
- Declaring PRODUCTION_READY / Watch PASS / GPS PASS without runtime evidence
- Committing `.env.local`, keystores, `google-services.json`

---

## 7. Preserved work checklist

| Asset | Preserve |
| --- | --- |
| `android/**` modules & Wear | YES |
| `apps/web` Elite OS / Vercel | YES |
| Uncommitted logo + Instagram v2 assets | YES (commit separately if desired) |
| `qa/evidence/**` | YES (untracked — do not delete) |
| `apps/mobile` | KEEP frozen; no new features |
| Historical `docs/phase-*` | Archive; do not treat as current GO |

---

## 8. Tools used (this reconciliation)

| Tool | Purpose | Result |
| --- | --- | --- |
| `git status/branch/remote/log/ls-files/rev-list` | Local vs remote truth | Current branch synced; android on feature branches |
| Filesystem inventory | Detect `android/`, `apps/*`, packages, docs | Native tree confirmed |
| Read `docs/master-plan/01–02`, `23`, README, `android/README` | Align with frozen architecture | Matches local evidence |
| Makefile / `make-start.ps1` probe | Dev orchestration scope | Web boot; Android/Wear not auto-started |

**Not used:** destructive git, Android recreate, Vercel redeploy, secret rotation, full QA suite.

---

## 9. Stop condition

```
REPOSITORY RECONCILIATION  → DONE
ARCHITECTURE TRUTH         → DONE
MISSING COMPONENTS         → DONE
IMPLEMENTATION PLAN        → DONE (awaiting human GO)
IMPLEMENTATION             → NOT STARTED
```

Next human decision:

> Approve Phase R1 execution scope (P0-SEC first vs broader bootstrap),
> confirm **keep `android/` path**,
> then authorize implementation.

---

*Generated 2026-08-29 · reconciliation-only · no product code modified for this report.*
