# Gate F0 — Decisões e limpeza

**Date:** 2026-08-07 · **Verdict: CLOSED** (one item conditionally — see "CI verde", below)

## Gate checklist vs. evidence

| Gate item | Status | Evidence |
|---|---|---|
| ADRs escritos | ✅ | ADR-005 (Expo→native, kill switch at F2), ADR-006 (Rust core), ADR-007 (naming), ADR-008 (MapLibre), ADR-009 (Supabase Postgres w/ migration triggers) |
| Estrutura a compilar — Rust | ✅ | `cargo test` 16/16 (core 15 + jni 1), `cargo clippy -D warnings` clean, `cargo fmt --check` clean, `wasm32-unknown-unknown` builds |
| Estrutura a compilar — Android | ✅ | `gradlew build` (lint + unit + assemble, 4 modules: `:app` `:wear` `:core-capture` `:design`) — BUILD SUCCESSFUL in 3m39s, log at `qa/reports/android-build-f0.log` |
| CI verde vazia | ⚠️ conditional | `.github/workflows/elite-core-rust.yml` + `android.yml` written; every command they run passes locally. Actual green checkmark can only exist after this branch is pushed — verified on the remote after push, noted in HANDOFF |
| Skills internas escritas | ✅ | `.claude/skills/elite-surface`, `sports-metrics`, `elite-core-rust` (`fitconnect-compose` deliberately deferred to F3, when Compose conventions first exist) |
| `apps/mobile` congelado | ✅ | Legacy banner in `apps/mobile/README.md`; excluded from CI typecheck graph (turbo filter, dry-run proven) and unit-test job |

## Also delivered under F0 (structure that later phases assume)

- **Gradle wrapper 9.5.0 committed** (AGP 9.3 minimum) — repo builds without a system Gradle. AGP 9 built-in-Kotlin migration applied (standalone `kotlin.android` plugin removed everywhere; it now conflicts).
- **Token pipeline** (ADR-002/007): `pnpm tokens:kotlin` generates `EliteSurfaceTokens.kt` (26 ARGB consts, zero deps) into `:design`; `pnpm tokens:kotlin:check` wired into web CI as a drift gate. Clean-rebuild of `:design` proves the generated Kotlin compiles.
- **`packages/elite-core-wasm`**: TS wrapper over the future wasm-bindgen artifact; tests/typecheck pass with the artifact absent (1/1 vitest).
- **Web regression check** after CI edits: 236/236 unit tests, filtered typecheck graph green.

## Named assumptions (owner can veto until F15)

- `applicationId` **`com.fitconnect.android`** / `com.fitconnect.android.wear`, minSdk 26 / 30 (wear), compile/target 35. Immutable only at first Play upload — see `qa/DECISIONS.md` 2026-08-07.

## Open blockers carried forward (see HUMAN-QUEUE)

- MCP tooling for "verify with eyes" (blocks F3+ visual verification, not F1/F2 code).
- D3 hardware (blocks F4/F5 gates). D4 legal (blocks F8b only).

## F1 status at gate close

Opened per owner instruction ("fecha F0 e arranca a F1 sem esperar"): `streams` module (time-series model + invariants) and `metrics` slice 1 (NP/IF/TSS per `docs/sports-metrics.md` §1.1–1.3) are in, each with its D1-mandated README, 15 core tests. Next: `fit` parser, remaining metrics, golden files, real bindings.
