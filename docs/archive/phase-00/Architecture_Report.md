# Phase 00 — Architecture Report

**Date:** 2026-08-07 · **Status:** COMPLETE (awaiting human approval) · **No code changed**

This report is the monorepo-wide architecture diagnosis for FitConnect's Android-first rebuild. It incorporates today's verified audits of `apps/web`, the data layer, `apps/mobile` (see `qa/reports/mobile-android-audit.md`), and ADRs 001–009. It does **not** reopen ADR-005 (Expo → native Android) — that decision was owner-approved and remains binding.

---

## 1. Repository structure (inspected)

| Path | Files (excl. build artefacts) | Role |
|------|------------------------------:|------|
| `apps/web` | 754 | Next.js 14 production app (landing + PWA dashboards + API) |
| `apps/mobile` | 65 | Expo SDK 52 preview — **FROZEN LEGACY** (ADR-005) |
| `android/` | 16 | Native Kotlin/Compose scaffold (F0) — `:app` `:wear` `:core-capture` `:design` |
| `elite-core/` | 17 | Rust shared domain engine (F1 in progress) |
| `packages/` | 62 | 12 workspace packages (see §3) |
| `prisma/` | 6 | Schema (21 models + 5 enums) + 2 migration folders + seed |
| `supabase/` | 11 | 10 SQL migrations + seed — **parallel schema** |
| `convex/` | 10 | Hand-written presence/nudges/messages + generated |
| `scripts/` | 33 | Codemods, Lighthouse, smoke, env validation |
| `docs/` | 26+ | ADRs, design system, sports-metrics, this phase |
| `qa/` | 14 | State machine, audits, HUMAN-QUEUE |
| `.github/workflows/` | 8 | ci, android, elite-core-rust, eas-preview, sast, security, vercel-deploy |

**Approximate live product surface:** `apps/web` ≈ 50k LOC (app+components+lib). Mobile ≈ 2.3k LOC. Elite Core growing under F1.

---

## 2. Dependency / package graph (internal)

```
apps/web
  ├── @fitconnect/types (39 importers monorepo-wide — hub)
  ├── @fitconnect/design-tokens (14)
  ├── @fitconnect/strava-integration (14)
  ├── @fitconnect/utils (12)
  ├── @fitconnect/api-client (9)
  ├── @fitconnect/maps (7)
  ├── @fitconnect/config (4) → design-tokens
  ├── @fitconnect/ai (4)
  ├── @fitconnect/realtime-client (3)
  ├── @fitconnect/db (2)
  └── @fitconnect/elite-core-wasm (2 — scaffold only)

apps/mobile (frozen)
  ├── @fitconnect/config, types, utils, maps, realtime-client

android/  (Gradle — no pnpm workspace link yet)
  └── :design ← generated from packages/design-tokens

elite-core/  (Cargo workspace — outside pnpm)
  └── core → jni / wasm / napi
```

**Cycles:** none found among workspace `workspace:*` edges.

**Orphan / broken packages:**
| Package | Issue |
|---------|-------|
| `packages/ui` | Directory with empty `src/`, **no `package.json`** — not a valid workspace package |
| `@fitconnect/ai` | 4 importers; LangGraph readiness ops — thin |
| `@fitconnect/db` | 2 importers; migration test utilities — underused |
| `@fitconnect/elite-core-wasm` | Scaffold; wasm artefact not built yet (expected F1) |

---

## 3. Feature graph (what the product believes it has vs what runs)

| Feature | Web | Mobile (Expo) | Android native | Reality |
|---------|-----|---------------|----------------|---------|
| Auth (Supabase) | Partial (demo ON default) | Demo credentials only | Not started (F3) | Not production-ready |
| Athlete dashboard | Yes (OS dashboards) | Mock UI | Skeleton | Web strongest |
| Coach roster / plans | Partial | Mock | — | Demo store + stubs |
| Strava | Mature package + routes | — | Planned F8 | Best backend module |
| Map | MapLibre thin | Text placeholder | Planned F6 | Incomplete |
| Health / readiness | Utils compute + seed | Stub Health Connect | Planned F8/F10 | Numbers not Elite Core yet |
| Video (LiveKit) | Token route + room UI | Room POST only | Out of v1 (BACKLOG-V2) | Partial / demo JWT |
| Payments (Stripe) | Live path + demo fallback; Connect demo-only | — | Out of v1 | Not go-live |
| Wear OS | — | Impossible | Empty `:wear` | Deferred cut (D5) |
| Elite Capture (recording) | — | — | `:core-capture` stub | Critical path F4 |

---

## 4. Architecture evaluation (current)

| Dimension | Score /10 | Notes |
|-----------|----------:|-------|
| Folder structure (web) | 6 | Clear groups, but triple UI stack + orphan pile |
| Feature isolation | 4 | Dashboard store is a god-object; features bleed |
| Clean Architecture | 3 | No consistent domain/application/infra layers on web |
| SOLID / DI | 3 | No DI container; constructors + module singletons |
| Repository pattern | 4 | `lib/db/repository.ts` exists; many routes bypass it |
| State management | 5 | Zustand OK for UI; abused as data source of truth |
| Offline | 2 | Mobile MMKV cache only; no outbox (Elite Core F2) |
| Realtime | 3 | Default BroadcastChannel; Convex poll; docs disagree with code |
| Networking | 4 | Mix of fetch, tRPC (unused client), in-memory stores |
| Navigation (web) | 7 | App Router + intercepting modals solid |
| Navigation (mobile) | 2 | See mobile audit — does not launch; phantom tabs |
| Auth | 2 | Demo mode default ON; open `?athleteId=` routes |
| Design system | 6 | EOS tokens canonical; ui-glass still 47 importers; mobile on wrong palette |
| Shared code | 5 | `types`/`utils`/`strava` good; readiness shims OK; dual schema bad |
| Android compatibility | 3 | Native scaffold green; Expo frozen and broken |
| Expo compatibility | 1 | Frozen; New Arch unset; MMKV 3 crash path |

---

## 5. Dual runtime architectures (must not be confused)

| Track | Status | Authority |
|-------|--------|-----------|
| **A — Web PWA** | Production on Vercel; needs hardening | Keep; polish F12/F13/F15 |
| **B — Expo mobile** | Frozen legacy; audit score 9/100 | ADR-005 — do not invest |
| **C — Native Android + Elite Core** | F0 closed, F1 open | ADR-005/006 — Android-first path |

Phase 00's "new architecture" (§8 in the prompt) describes **Track C + a cleaned Track A**. Track B is archive-bound.

---

## 6. Target architecture (design only — not implemented)

```
fitconnect/
├── elite-core/                 # Rust — FIT, metrics, physiology, sync, guard
│   └── bindings/{android,wasm,node}
├── android/                    # Kotlin + Compose
│   ├── app/                    # phone
│   ├── wear/                   # scaffold; build decision at F13
│   ├── core-capture/           # recording engine (F4)
│   └── design/                 # generated Elite Surface tokens
├── apps/web/                   # Next.js — landing + dashboards + PWA
├── packages/
│   ├── design-tokens/          # JSON → CSS + Kotlin (Style Dictionary)
│   ├── types/                  # shared DTOs
│   ├── api-client/             # tRPC + REST contracts (auth-enforced)
│   ├── strava-integration/     # keep; Prisma-only persistence
│   ├── utils/                  # transitional; metrics move to elite-core
│   ├── maps/                   # MapLibre web wrapper
│   ├── realtime-client/        # thin transport iface
│   └── elite-core-wasm/        # TS wrapper over wasm artefact
├── prisma/                     # single relational schema (Supabase Postgres)
├── convex/                     # nudges/live only (optional until realtime hardened)
└── apps/mobile/                # ARCHIVE after F6 proves native shell
```

### Dependency direction (hard rule)

```
UI (android/app, apps/web)
  → api-client / types
  → elite-core (JNI | WASM | napi)
  → persistence (Prisma | Room)
```

UI never imports another feature's internals. Domain math never lives in Kotlin or TS once Elite Core owns it.

### State / API / offline / realtime (target)

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Web UI state | Zustand (ephemeral) + TanStack Query (server) | Stop using Zustand as DB |
| Android UI state | ViewModel + StateFlow + Room | ADR-005 stack |
| API | REST v1 auth-gated + tRPC for typed internal; kill demo bypass | Security first |
| Offline | Elite Core outbox + Room (Android); Workbox shell (web PWA) | F2 chaos gate |
| Realtime | Convex for nudges OR Supabase channels — pick one primary; BroadcastChannel = dev only | End doc/code lie |
| Auth | Supabase Auth everywhere; `NEXT_PUBLIC_DEMO_MODE=false` in prod | P0 |
| DB | Supabase Postgres via Prisma only (ADR-009); retire parallel SQL as source of truth | Unify |

### Naming convention

| Layer | Convention |
|-------|------------|
| Packages | `@fitconnect/<kebab>` |
| Android packages | `com.fitconnect.android.<feature>` |
| Rust modules | `elite_core::<module>` |
| Tokens | `--eos-*` / `EliteSurfaceColors` (ADR-007) |
| Features | folder = feature name; public API via `index.ts` / package facade |

### Testing strategy (target)

| Layer | Tool |
|-------|------|
| Elite Core | `cargo test` + golden FIT files + cross-target parity |
| Android | JUnit + Compose UI + Maestro + instrumented |
| Web | Vitest + Playwright + Lighthouse CI |
| Contracts | Pact (already sketched in api-client) — enforce |

---

## 7. File classification taxonomy

Labels applied at **module / directory** grain (1 014+ source files — per-file enumeration lives in `Cleanup_Report.md` exception lists).

| Label | Meaning | Primary locations |
|-------|---------|-------------------|
| **CORE** | Must ship for v1 | `elite-core/`, `android/`, `packages/{types,design-tokens,strava-integration,api-client,elite-core-wasm}`, `prisma/`, `apps/web/app/(app)`, `apps/web/lib/{auth,db,integrations/strava}` |
| **FEATURE** | Product surface | `apps/web/components/{dashboard/os,shell,landing,marketing/landing-v2}`, coach/athlete routes |
| **SHARED** | Cross-cutting | `packages/utils`, `packages/maps`, `packages/realtime-client`, `packages/config` |
| **LEGACY** | Works but superseded | `apps/web/components/ui-glass/`, orphaned dashboard views, `apps/mobile/` entire tree |
| **DEPRECATED** | Explicitly retired | Voltline-only aliases in `voltline.css`, `framer-motion` (0 importers; use `motion`) |
| **GENERATED** | Do not edit | `convex/_generated/`, `android/design/.../EliteSurfaceTokens.kt`, `.next/`, `elite-core/target/` |
| **TEST** | Specs | `**/*.test.*`, `tests/e2e/`, `elite-core/**/tests` |
| **CONFIG** | Tooling | `*.config.*`, workflows, `eas.json`, `turbo.json` |
| **REMOVE_CANDIDATE** | Safe to delete after archive step | See Cleanup_Report §1 (~32 web orphans + `packages/ui` + CLAUDE.md already-gone list) |
| **UNKNOWN** | Needs human call | Whether `packages/ai` stays for F10; whether Convex remains primary realtime |

---

## 8. Top architectural problems (monorepo, ranked)

1. **Demo mode default ON** — auth and athlete impersonation open (`apps/web/lib/auth/supabase/client.ts`).
2. **Dual schema** — Prisma 21 models vs 10 Supabase SQL migrations; identity models incompatible.
3. **Expo app does not launch** — MMKV 3 + New Arch unset (`qa/reports/mobile-android-audit.md` M-19).
4. **In-memory Strava/integration store** still on production paths.
5. **Triple UI stack** on web (elite-os / ui-glass / ui) with no migration boundary.
6. **~32 orphan web modules** (~4k+ LOC) + empty `packages/ui`.
7. **Realtime default is BroadcastChannel** while docs claim Convex primary.
8. **tRPC mounted, no web client**; many procedures stub empty arrays; Strava procedures public.
9. **Zustand dashboard store as source of truth** alongside REST.
10. **Elite Core metrics incomplete** — F1 gate (cross-target FIT parity) not yet met.

---

## 9. What this phase deliberately does not do

- No refactors, no deletes, no dependency bumps, no feature work.
- No reopening of ADR-005/006/009.
- No claim that Expo can be the production Android app.

**Phase 00 exit:** human approval of this report set → then Phase 01 (implementation phases map to existing F1+ roadmap in `Migration_Plan.md`).
