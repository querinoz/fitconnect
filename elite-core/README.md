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

## Status

**PARTIAL** (not production-certified). `core` now contains streams, zones, metrics (including heart rate / pace), and physiology modules beyond the original F0 `version()` skeleton. Bindings and golden-file coverage remain incomplete. Canonical metrics spec: `docs/sports-metrics.md`. Production: **NO-GO**.

The `jni` crate export symbols and golden-file suite remain incomplete. Package id for JNI is `com.fitconnect.android` / debug `com.fitconnect.android.debug`. See `qa/HUMAN-QUEUE.md` for owner hardware steps. Per-module READMEs land as each domain file grows; this file is the crate entry point.
