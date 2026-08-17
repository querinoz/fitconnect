# Future iOS architecture

```
IOS_TARGET_STATUS = ARCHITECTURALLY_READY / NOT_IMPLEMENTED
```

Do **not** add an `ios()` Gradle target until the Android toolchain is proven stable with the multiplatform plugin.

## Reuse later

`:shared` (kotlin-jvm today) contains no Android APIs:

- session state machine
- telemetry envelope + units
- outbox / sequence dedupe
- Wear path **names** as protocol (iOS will map to WatchConnectivity paths)
- `FitConnectRealtimeEvent`

elite-core physiology: **UniFFI**, not a Kotlin rewrite (ADR-005 / ADR-006).

## Future tree (not created)

```
iosApp/          SwiftUI
watchOS app      HealthKit + WatchConnectivity
shared/          promoted to KMP commonMain when AGP allows
```

## Do not implement now

- HealthKit
- WatchConnectivity
- CoreBluetooth
- SwiftUI
- fake iOS stubs that compile but do nothing

Apple Watch pairing, HealthKit permissions, and App Store credentials are **HUMAN_REQUIRED** in a later cycle.
