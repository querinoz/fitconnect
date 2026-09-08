# Elite Core — Swift binding contracts (Path A)

**Status:** SOURCE_COMPLETE contracts on Windows · **XCFramework / xcodebuild = BLOCKED_EXTERNAL** (requires macOS)

## API mirrored

| Function | Meaning |
|----------|---------|
| `EliteCore.version()` | Binding probe |
| `EliteCore.heartRateZone(bpm:lthrBpm:)` | LTHR 5-zone index 1–5 (0 = unknown) |

## Generate on Mac

```bash
cd elite-core
cargo build -p elite-core-uniffi --release
# then uniffi-bindgen generate … --language swift --out-dir swift/Generated
```

See `../scripts/generate-bindings.md`.

Do **not** claim physiology parity until golden cross-target tests pass.
