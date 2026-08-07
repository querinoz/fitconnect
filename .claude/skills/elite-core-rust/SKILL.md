---
name: elite-core-rust
description: Use when writing or reviewing any code in the elite-core Rust crate or its bindings (JNI/UniFFI, wasm-bindgen, napi-rs) — idiom, module structure, and review-ability rules specific to this project's reviewer being non-expert in Rust. Load before starting a new elite-core module.
---

# Elite Core (Rust) skill

Context this skill exists to encode (`docs/adr/ADR-005`, D1): the working model is *engineering writes Kotlin/Rust, the owner reviews and decides* — and the owner has been explicit that Rust review will start out slower and less expert than TypeScript review. That is an accepted, named risk, not a secret to route around. This skill's whole job is to keep the code reviewable by someone learning Rust while reviewing it.

## The standing rule

**Conservative and readable beats elegant and clever, every time, until told otherwise.** If an idiomatic-but-dense pattern (heavy trait bounds, macro-generated code, non-obvious lifetime elision, point-free iterator chains five calls deep) would save 10 lines but cost a reviewer 20 minutes of confusion, write the 10 extra lines. This is not "write bad Rust" — it's "write the boring, explicit version first."

## Every module ships with a README

Per D1: **each module of Elite Core comes with a `README.md` that explains the *why* of its idiomatic choices, not just the *what*.** Concretely, that means:

- Why this module is structured the way it is (why a trait here, why a plain enum there, why this error type and not `anyhow`/`thiserror` mixed inconsistently).
- What Rust concept a reviewer needs to understand to review this file confidently (e.g., "this module leans on `Cow<str>` — here's why we needed it instead of always allocating").
- What *not* to worry about — explicitly call out patterns that look unusual but are standard idiom, so the reviewer doesn't spend review time on non-issues.

A module without this README is not done, regardless of test coverage.

## Binding targets (ADR-006) — one crate, three faces

| Target | Binding | Notes |
|---|---|---|
| Android + Wear OS | JNI via UniFFI, single `.so` per ABI | Fallback: hand-written JNI for the hot path only, if UniFFI ergonomics block Wear |
| Browser | `wasm-bindgen` + thin TS wrapper (`packages/elite-core-wasm`) | Browser is a hard requirement — F12 dashboards do client-side analysis |
| Server | `napi-rs` native module | Next.js route handlers / workers |

Domain logic (FIT parse/write, metrics per `docs/sports-metrics.md`, physiology, lap detection, GPS filtering, sync/outbox conflict logic, the `dataSource`/`dataRights` permission guard) lives **once**, in the core crate. Binding crates are thin — if binding-specific logic starts accumulating business rules, that's a sign it belongs back in the core crate.

## Correctness culture (this is why Rust won the ADR-006 debate — don't waste it)

- `serde` for FIT (de)serialization, not hand-rolled parsing, unless a specific record type needs it.
- Property tests (`proptest` or similar) for anything numeric that has an invertible property (parse→serialize round-trips, GAP monotonic in gradient sign, NP ≥ average power).
- Fuzzing for the FIT parser boundary specifically — untrusted binary input from a device or a third-party export is the one place malformed data is expected, not exceptional.
- Golden-file tests (see the `sports-metrics` skill) are the F1 gate, not optional coverage padding.

## Error handling

- Library code (the core crate) returns `Result<T, EliteCoreError>` with a small, closed error enum per subsystem — never `unwrap()`/`expect()` outside of tests and truly-impossible-per-invariant cases (and even then, comment the invariant).
- Binding layers translate `EliteCoreError` into the target's idiom (Kotlin sealed class / exception, JS `Error` subclass, etc.) at the boundary — don't leak Rust error types across FFI.

## Workspace layout (expected, confirm against reality before assuming)

```
elite-core/
├── Cargo.toml            # workspace root
├── core/                 # elite-core: pure domain logic, no binding deps
├── jni/                  # UniFFI/JNI binding crate
├── wasm/                 # wasm-bindgen binding crate → packages/elite-core-wasm
└── napi/                 # napi-rs binding crate
```

## Toolchain note

As of the 2026-08-07 F0 session, this machine had **no Rust toolchain installed** (`rustc`/`cargo`/`rustup` all absent) — check `qa/HUMAN-QUEUE.md` before assuming code here has ever been compiled. Never claim a golden-file gate or "structure compiles" gate is green without an actual `cargo build`/`cargo test` run backing it up.
