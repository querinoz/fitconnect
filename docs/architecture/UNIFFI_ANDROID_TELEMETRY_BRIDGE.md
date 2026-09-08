# FINAL HARDENING — UniFFI / telemetry bridge

## Pipeline

```
elite-core::zones::zone_for
        ↓
elite-core-uniffi::heart_rate_zone  (UniFFI, tested)
elite-core-jni::nativeHeartRateZone (JNI, tested)
        ↓
EliteCoreBridge (Kotlin)
        ↓
HeartRateZones.zoneFor / timeInZonesMinutes
        ↓
AthleteContentResolver Analysis zones
TelemetryScreen LTHR probe card
```

## Backend modes

| Mode | When |
|------|------|
| `NATIVE_JNI` | `libelite_core_jni.so` packaged + load succeeds |
| `REFERENCE_PARITY` | JVM unit tests / APK without NDK .so — golden-locked to Rust vectors |

NDK packaging of `.so` into APK remains a follow-up (cargo-ndk). Parity is proven by golden tests regardless.

## Golden tests

- `elite-core/uniffi` — 2 tests
- `elite-core/jni` — mirrors UniFFI boundaries
- `android/.../EliteCoreZonesGoldenTest` — bridge == HeartRateZones == reference
