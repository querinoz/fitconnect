# ADR-001 — Multiplatform surfaces (web, Android, Wear)

**Status:** Accepted  
**Date:** 2026-08-18  
**Deciders:** Staff engineer (this session), grounded in the existing monorepo  
**Supersedes:** MEGA PROMPT v4 §3.1 (the prompt assumed Kotlin/Compose-only)  
**Does not replace:** `docs/adr/ADR-001-token-unification.md` (tokens). This file is the v5 *surfaces* ADR. Filenames collide on purpose with the prompt; the token ADR stays in `docs/adr/`.

---

## Context

MEGA PROMPT v4 asked: Compose Multiplatform / Wasm vs a separate React+TS app vs PWA. That question is already answered by the tree.

| Surface | Exists? | Form |
|---|---|---|
| Web app | **Yes** | Next.js 14 in `apps/web`, production `https://fitconnect-phi.vercel.app` |
| Marketing landing | **Yes** | `apps/web/app/page.tsx` + `LandingPageContent` |
| PWA | **Partial** | service worker / install prompt present; IndexedDB **not** the source of truth |
| Android phone | **Yes — reference app** | Jetpack Compose, `android/` |
| Wear OS | **Yes — companion** | `android/wear`, `play-services-wearable` 19.0.0 on `:app`, `:wear`, `:telemetry` |
| Expo | Frozen Path A | `apps/mobile` — not the reference |
| Compose Multiplatform / Wasm | **No** | explicitly rejected in `docs/architecture/KMP_WEAR_ARCHITECTURE.md` |
| iOS | Architecture-ready only | `docs/architecture/FUTURE_IOS_ARCHITECTURE.md` |

Domain logic today:

- **Shareable, Android-free:** `android/shared` (kotlin-jvm) — session SM, envelopes, outbox, Wear paths, realtime event types.
- **Shareable tokens:** `packages/design-tokens` → CSS + `pnpm tokens:kotlin` → `EliteSurfaceTokens.kt`.
- **Planned physiology:** Elite Core Rust (ADR-006) — toolchain often absent; do not claim compiled.
- **Coupled to UI:** most athlete screens, LiveActivityEngine LOCAL_DEMO, web dashboard Zustand stores.

Choosing Compose Wasm would rewrite the production Next.js surface (landing, SEO, dashboards, i18n, Strava). That is **>30% of `apps/web`**. MEGA PROMPT §16.7 says stop and ask. The existing React app means we **do not** take that path, so we do not stop.

## Decision

**Keep the web app as React + TypeScript (Next.js 14) sharing the HTTP/API contract. Treat the existing PWA as an installability layer, not a third product.**

| Option | Verdict |
|---|---|
| Compose Multiplatform / Wasm | **Rejected.** SEO-null, young ecosystem, would discard a shipping Next app. `:shared` is kotlin-jvm *because* AGP 9 + KMP plugin is a risk, not because we want Wasm. |
| Separate React+TS app sharing API | **Accepted (already true).** Density dashboards, keyboard, SEO landing live here. |
| PWA over that web app | **Accepted as a mode**, not an alternative. Offline IndexedDB is a gap (ADR-002). |

Coach OS stays out of Elite OS v2 Athlete chrome (HANDOFF). Wear is in scope as companion, not a shrunk phone.

### Domain extraction (prerequisite, in progress)

Do **not** duplicate session/outbox/conflict types in TypeScript. Target:

1. Keep `:shared` as the JVM contract (phone + wear).
2. Expose the same types to web via OpenAPI / JSON of `FitConnectRealtimeEvent` + `telemetry.v1` (already sketched in `:shared`).
3. Physiology stays in Elite Core (Rust) once the toolchain exists — web via wasm-bindgen, Android via UniFFI. Until then, web readiness stays in `apps/web/lib/readiness/compute.ts` (known duplication vs mobile).

This is incremental. It is not a 30% rewrite.

## Consequences

- New web UI (dashboards maquette → product) lands in `apps/web`, Elite Surface tokens only.
- New Wear UI stays in `android/wear` (one datum per screen, ambient mode required before long sessions).
- Token change = `packages/design-tokens` + `elite-os.css` + `pnpm tokens:kotlin`. Never a third hex table in HTML mockups.
- Expo remains frozen; do not spend Elite OS v2 cycles “aligning” it.
- Visual spec files `ELITE_OS_VISUAL_SPEC.md` and `ELITE_OS_MOTION_BACKGROUND_WIDGET.md` are **missing** from `docs/design/`. Canonical lock is `ELITE_OS_HANDOFF.md` + tokens. If those files appear later and conflict with HANDOFF, stop (§16.9).

## Rewrite check (§16.7)

| Path | Estimated rewrite of existing product code |
|---|---|
| Document + evolve Next.js + Compose + Wear | <10% |
| Replace Next with Compose Wasm | ≫30% of `apps/web` |

**No stop.** Proceed.
