# elite-core

Shared Rust domain engine for FitConnect v1 — FIT parse/write, metrics, physiology, sync/outbox, the `dataSource`/`dataRights` permission guard. One implementation, four faces. See `docs/adr/ADR-006-elite-core-rust.md` for why Rust, and `docs/sports-metrics.md` for the formulas this crate must implement bit-for-bit-or-<1%-tolerance identically across targets.

## Workspace layout

```
elite-core/
├── core/   — elite-core: pure domain logic, zero binding dependencies
├── jni/    — Android + Wear OS binding (JNI)
├── wasm/   — browser binding (wasm-bindgen) → consumed by packages/elite-core-wasm
└── napi/   — server binding (napi-rs) → consumed by Next.js route handlers/workers
```

`core` never depends on a binding crate; binding crates depend on `core` and translate its API (and its `EliteCoreError` type, see the `elite-core-rust` skill) into each target's idiom. If binding-specific logic starts accumulating actual business rules, that's a signal it belongs back in `core`.

## Status (2026-08-07, F0)

**Skeleton only.** Each crate currently re-exports a single `version()` call to prove the workspace resolves and every target toolchain (native, `wasm32-unknown-unknown`, and eventually the Android NDK targets) actually builds. No domain logic yet — that starts at F1, against the golden-file suite described in `docs/sports-metrics.md` and the `sports-metrics` / `elite-core-rust` skills.

The `jni` crate's actual JNI export symbols are intentionally not written yet: JNI export function names are package-qualified (e.g. `Java_<reversed_package>_EliteCore_method`), and the Android `applicationId` isn't decided yet (pending owner input, see `qa/HUMAN-QUEUE.md`). Wiring real JNI exports before that would mean renaming every symbol once the package name lands — better to wait the one decision out.

Per D1 (`docs/adr/ADR-005`) and the `elite-core-rust` skill: every module gets a README explaining the *why* of its choices once there's an actual "why" to explain. A skeleton crate with one re-exported function doesn't have idiomatic choices worth documenting yet — this file is that module's README for now, and will be replaced by real per-module docs as F1 lands actual logic.
