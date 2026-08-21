# Wearable compatibility matrix

**Date:** 2026-08-15  
**Rule:** no claimed hardware support without a tested device.

| Platform | Device | OS | SDK in repo | App possible? | Companion possible? | Tested? |
|----------|--------|-----|-------------|---------------|---------------------|---------|
| Wear OS | Generic Wear 3+ | Wear OS | `android/wear` (Compose, minSdk 30) | Yes (standalone LOCAL_DEMO APK) | Architected (`WearSessionLink`, `WearableCompanionPort`) — DataLayer **unbound** | **No device.** `:wear:assembleDebug` only |
| Xiaomi (Wear OS SKU) | Watch 2 / similar if they ship Wear OS | Wear OS | same `:wear` module | Same as Wear OS | Same | **Not tested** |
| Xiaomi HyperOS / proprietary | Many Xiaomi watches | Not Wear OS | none | **Official native app unavailable** from this repo | Only via vendor-official APIs if they exist — **not implemented, no hacks** | UNSUPPORTED |
| Apple watchOS | Apple Watch | watchOS | **no Xcode/Swift target** | Kotlin cannot run on watchOS | `READY_FOR_APPLE_IMPLEMENTATION` only | NOT_IMPLEMENTED |
| Phone APK on watch | — | — | — | **Forbidden** as “support” | — | Not attempted |

```
WEAR_OS_ENGINEERING_READY = YES (module + LOCAL_DEMO shell + in-memory session link tests)
WEAR_DEVICE_TEST          = PENDING_HUMAN
XIAOMI_HYPEROS            = UNSUPPORTED (no proprietary SDK in repo)
WATCHOS                   = NOT_IMPLEMENTED
```

Phone ↔ watch events (typed, not DataLayer):

`START_SESSION` `PAUSE_SESSION` `RESUME_SESSION` `END_SESSION` `READINESS_UPDATE` `HEART_RATE_UPDATE`

Transport `IN_MEMORY` is LOCAL_DEMO. `DATALAYER_UNBOUND` fails closed.
