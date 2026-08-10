# Phase 11 — Baseline Report

**Date:** 2026-08-08  
**Branch:** `phase-11/android-performance`  
**Scope:** Native Kotlin Compose app under `android/` (Expo `apps/mobile` frozen Path A — not the production Android target).

## Current architecture

Multi-module Gradle app: `:app` → `:foundation`, `:design-ui`, `:athlete`, `:coach`, `:sports`, `:geo`, `:telemetry`, `:ai` (+ `:community` present but not on app startup path).

Composition root: `FitConnectApplication` constructs the full DI graph on cold start.

## Performance bottlenecks (pre-fix)

| Priority | Issue |
|----------|--------|
| P0 | Eager DI: sports+geo+telemetry+ai+athlete+coach before first frame |
| P0 | `EncryptedSecureStore` / MasterKey on Application create |
| P0 | Offline flush executor is no-op → mutations acknowledged and discarded |
| P0 | In-memory sync queue lost on process death |
| P1 | Unbounded HTTP GET cache |
| P1 | Unbounded in-memory telemetry / sports metrics |
| P1 | Aggregation holds full value lists per bucket |
| P1 | DEBUG dual telemetry bootstrap every launch |
| P1 | Release minify disabled |
| P2 | AI audit/cost lists unbounded |
| P2 | ApiClient uses blocking `execute()` + `runBlocking` in interceptors |

## Memory risks

InMemoryTelemetryStore, sports MetricsEngine lists, OkHttp responseCache ConcurrentHashMap, AI audit/cost/memory stores.

## Battery risks

No live GPS/WorkManager today (ports only). Risk when wiring: high-frequency location, unbounded realtime, always-on sync. `BackgroundSyncPolicy` exists but WorkManager not required for gate if battery policy is documented and demo sync gated.

## Network risks

Blocking OkHttp calls; unbounded cache; no request dedupe/backoff layer; interceptor `runBlocking`.

## Offline risks

Queue not durable; flush dishonest; no freshness UI contract; no documented conflict strategies.

## Rendering risks

Primary feeds use LazyColumn (good). Nested `forEach` inside Lazy items at demo scale only.

## Bundle / dependency risks

Release R8 off; NoOp image/analytics/realtime/push (no Expo/RN leakage into android/).

## Database / sync risks

MMKV/Encrypted prefs for secrets; DataStore for prefs; telemetry still in-memory (ADR: keep until measured volume — see STORAGE_ARCHITECTURE_DECISION.md).

## Android compatibility

minSdk 26, target/compile 35. Edge-to-edge + SplashScreen present.

## Accessibility risks

Existing Elite a11y targets; Phase 11 must not strip semantics.

## Device baseline (lab)

Physical multi-device Systrace not available in this agent environment. Closest reproducible profiles:

| Profile | Proxy |
|---------|-------|
| LOW-END | Emulator 2 vCPU / 2GB RAM targets + unit stress |
| MID-RANGE | Emulator defaults + assembleRelease |
| HIGH-END | Debug assemble + unit suite |

Instrument hooks: `PerformanceBudget` + startup markers added in this phase for future Macrobenchmark.
