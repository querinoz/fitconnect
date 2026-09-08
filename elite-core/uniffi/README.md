# elite-core-uniffi

Minimal UniFFI bridge for FitConnect Path A Wave 5.

## Why this crate exists

`elite-core` owns the physiology and zone logic. This crate does **not**
add new training math and does **not** claim parity across Kotlin/Swift
yet. Its job is smaller:

- prove the workspace can expose a UniFFI surface;
- expose a trivial build probe via `version()`;
- expose one existing LTHR-based helper from `elite-core::zones`.

Keeping UniFFI in its own crate avoids disturbing the existing `jni`,
`wasm`, and `napi` members while the FFI surface is still intentionally
small and reviewable.

## Why UDL here

Wave 5 is about an explicit contract more than API breadth. A tiny UDL
file keeps the foreign-language surface obvious to a reviewer who is still
warming up to Rust + FFI, and it makes the hand-written Swift contract
stub easy to compare against.

## What is exported

- `version() -> string`
- `heart_rate_zone_for_bpm(bpm, lthr_bpm) -> HeartRateZone?`

The exported zone helper is a thin wrapper around the already-tested
`elite_core::zones::zone_for` and `zone_floor` helpers. No new physiology
logic is introduced here.
