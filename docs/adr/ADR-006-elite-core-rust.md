# ADR-006 — Elite Core in Rust (vs Kotlin Multiplatform)

**Date:** 2026-08-07
**Status:** Proposed (awaiting owner approval)

## Context

One implementation of FIT parse/write, stream model, metrics (NP/IF/TSS/hrTSS/GAP, zones, power/pace curves), physiology (rMSSD baseline, CTL/ATL/TSB, ACWR), lap detection, GPS filtering, sync/outbox conflict logic, and the `dataSource`/`dataRights` permission guard must produce **identical numbers** on four targets: Android phone, Wear OS, browser, server.

## Options

### Kotlin Multiplatform
- Pro: same language as the new Android app; good JVM story.
- Con: **Wasm target is the weakest link** — and browser is a hard requirement (web dashboards do heavy analysis client-side in F12). Kotlin/Wasm is still maturing (GC proposal dependency, bundle size, JS interop friction). The original KMP argument — Swift interop for iOS — is void with iOS out of scope.

### Rust
- Pro: first-class Wasm (`wasm-bindgen`), first-class server (napi-rs for Node, or a thin service), solid Android via JNI/UniFFI, exceptional correctness culture for parser/numeric work (serde, fuzzing, property tests). FIT parsing crates exist as references (`fitparser`).
- Con: third language in the repo; JNI boundary discipline needed; team learning curve.

### TypeScript shared lib (status quo direction)
- Rejected: cannot run in the Wear OS/Android recording path without embedding a JS runtime in a foreground service — a non-starter for battery and reliability gates (≤6%/h).

## Decision

**Rust for Elite Core**, bound as:

| Target | Binding |
|---|---|
| Android + Wear | JNI via UniFFI (single `.so` per ABI) |
| Browser | wasm-bindgen + a thin TS wrapper package (`packages/elite-core-wasm`) |
| Server (Next.js route handlers / workers) | napi-rs native module |

Golden-file test suite: real FIT files with expected metrics checked against Golden Cheetah exports, tolerance <1%, run in CI on all four targets. The cross-target equality test (same file → same numbers, bit-for-bit where deterministic) is the F1 gate.

## Consequences

- CI needs a Rust matrix (linux host builds all four; Android ABIs via NDK docker image).
- `docs/sports-metrics.md` (internal formulas + sources) becomes the normative spec the Rust implements — physiology is written down before it is coded (F10 gate: professional review).
- If UniFFI ergonomics block us on Wear, fallback is hand-written JNI for the hot path only.
