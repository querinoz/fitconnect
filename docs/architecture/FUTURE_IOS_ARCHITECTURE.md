# iOS architecture — Path A (Zenith)

```
IOS_TARGET_STATUS = PATH_A_IN_PROGRESS / SOURCE_COMPLETE_TARGET
MAC_BUILD_STATUS = IOS_PHYSICAL_BUILD_BLOCKED_EXTERNAL  # Windows host; no Xcode
```

**Locked (ADR-005):** Production mobile = native Android Compose (`android/`) + future/now SwiftUI (`iosApp/`). Expo remains archived at `_archive/apps-mobile-frozen-adr005`.

## Do not add

- Gradle `ios()` target until Android + multiplatform plugin is stable
- Expo / React Native revival
- Fake HealthKit PASS without entitlements

## Reuse

`:shared` (kotlin-jvm) — session SM, telemetry envelope, outbox, realtime events.  
`elite-core` physiology — **UniFFI** (Kotlin + Swift), not a Kotlin rewrite.

## Tree (Path A Zenith)

```
iosApp/                 SwiftUI product shell (source-complete on Windows)
  FitConnect/
    Design/             EOS tokens, honeycomb, glass, motion
    Navigation/         Athlete + Coach shells
    Athlete/            Full IA mirror
    Coach/
    Auth/
    SharedAdapters/
    Telemetry/
    Health/             HealthKit contracts — BLOCKED_EXTERNAL until Mac+entitlements
    Maps/
    Messaging/
    Programs/
    Bookings/
    Settings/
elite-core/swift/       UniFFI-generated / hand scaffold for Mac
watchOS                 FUTURE_SCOPE (HealthKit + WatchConnectivity)
```

## Status vocabulary

| Label | Meaning |
|-------|---------|
| SOURCE_COMPLETE | Swift sources present; contracts mirror Android |
| SIMULATOR_CAPTURE | Verified on iOS Simulator (requires macOS) |
| BLOCKED_EXTERNAL | Apple Developer / Xcode / entitlements |
| FUTURE_SCOPE | watchOS pairing certification |

## HealthKit / WatchConnectivity / CoreBluetooth

Implement **contracts + honest stubs** only when Mac build unavailable. Never claim production PASS.
