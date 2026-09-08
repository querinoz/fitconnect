# Generate UniFFI bindings (Elite Core)

## Prerequisites

- Rust toolchain
- `uniffi-bindgen` (via `cargo install uniffi_bindgen` or crate bin)
- **Swift XCFramework:** macOS + Xcode → otherwise `BLOCKED_EXTERNAL`

## Kotlin (Android)

```bash
cd elite-core
cargo build -p elite-core-uniffi
# Bindgen Kotlin into android/ shared or jni consumer when wiring lands
```

## Swift

```bash
cargo build -p elite-core-uniffi --release
uniffi-bindgen generate path/to/elite_core_uniffi.udl --language swift --out-dir swift/Generated
```

Until generated, iosApp may depend on `elite-core/swift` hand contract (`EliteCore.version` / `heartRateZone`).

## Honesty

- Binding compile ≠ physiology parity
- Golden tests in `elite-core/core` + `elite-core/uniffi` must pass before claiming zone engine shared
