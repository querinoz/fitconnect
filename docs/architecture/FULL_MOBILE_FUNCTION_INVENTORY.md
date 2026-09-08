# FitConnect — Full Mobile Function Inventory (Path A · Zenith)

**Date:** 2026-09-08  
**Surfaces:** Android Compose (`android/`) · SwiftUI (`iosApp/`) · Web · Backend  
**Expo:** Archived (`_archive/apps-mobile-frozen-adr005`) — not a product surface  
**Alias:** see also [MOBILE_FUNCTION_INVENTORY.md](./MOBILE_FUNCTION_INVENTORY.md)

Status vocabulary: `IMPLEMENTED` · `PARTIAL` · `BLOCKED_EXTERNAL` · `DEFERRED_DEVICE` · `FUTURE_SCOPE` · `SOURCE_COMPLETE` (iOS without Mac build)

| Feature | Web | Android | iOS | Backend | Auth | Offline | Realtime | Notification | Tests | UI | Status |
|---------|-----|---------|-----|---------|------|---------|----------|--------------|-------|-----|--------|
| Auth email/federated | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Firebase UID | — | — | — | PARTIAL | Zenith | PARTIAL |
| Onboarding athlete/coach | Y | IMPLEMENTED | SOURCE_COMPLETE | local | Y | — | — | — | instrumented | Zenith | IMPLEMENTED (Android) |
| Athlete Home / readiness | Y | IMPLEMENTED remade | SOURCE_COMPLETE | Y | Y | cache | — | — | unit+emu | REMADE | IMPLEMENTED |
| Analysis / vault | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | — | — | — | PARTIAL | PENDING→Zenith | PARTIAL |
| Discover coaches | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | geo cache | — | — | PARTIAL | PARTIAL→Zenith | IMPLEMENTED |
| Book coach | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | queue | booking | — | PARTIAL | CTA remade | IMPLEMENTED |
| Discover DM | — | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | queue | message | — | unit | PENDING→Zenith | IMPLEMENTED |
| Programs enroll | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | queue | — | — | PARTIAL | PARTIAL | IMPLEMENTED |
| Workout guided | — | IMPLEMENTED | SOURCE_COMPLETE | — | Y | — | — | — | instrumented | PENDING→Zenith | IMPLEMENTED |
| Telemetry / HRV / load | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | — | PARTIAL | — | unit | PENDING→Zenith | PARTIAL |
| LTHR 5 zones | — | IMPLEMENTED | SOURCE_COMPLETE | — | — | — | — | — | unit | Zenith | IMPLEMENTED |
| Outdoor GPS / map | — | IMPLEMENTED | SOURCE_COMPLETE | sync | Y | outdoor | — | — | emu | PENDING polish | PASS emu / DEFERRED_DEVICE physical |
| Notifications inbox | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | — | — | FCM code | PARTIAL | PENDING→Zenith | PARTIAL / FCM BLOCKED_EXTERNAL |
| Profile / settings | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | prefs | — | — | PARTIAL | PENDING→Zenith | IMPLEMENTED |
| Coach overview | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | — | — | — | PARTIAL | PARTIAL→Zenith | PARTIAL |
| Coach bookings | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | queue | booking | — | PARTIAL | Zenith | IMPLEMENTED |
| Coach athletes | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | — | — | — | PARTIAL | Zenith | IMPLEMENTED |
| Coach programs | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | queue | — | — | PARTIAL | Zenith | IMPLEMENTED |
| Coach earnings | Y | IMPLEMENTED read | SOURCE_COMPLETE | ledger | Y | — | — | — | PARTIAL | Zenith | PASS read / Stripe LIVE BLOCKED_EXTERNAL |
| Coach inbox | Y | IMPLEMENTED | SOURCE_COMPLETE | Y | Y | — | message | — | PARTIAL | Zenith | IMPLEMENTED |
| Offline queue flush | — | IMPLEMENTED | SOURCE_COMPLETE adapters | HTTP | Y | DurableSyncQueue | — | — | unit | banner | IMPLEMENTED |
| Realtime hub | Y | IMPLEMENTED | SOURCE_COMPLETE | Supabase/in-proc | Y | — | hub | — | unit | — | PARTIAL (multi-device live BLOCKED_EXTERNAL) |
| Wear sync | — | FUTURE | FUTURE | — | — | — | — | — | — | — | FUTURE_SCOPE |
| Apple Health / HealthKit | catalog | N/A (HC core) | BLOCKED_EXTERNAL | — | — | — | — | — | — | — | BLOCKED_EXTERNAL |
| Stripe LIVE payout | demo | fail-closed | fail-closed | — | — | — | — | — | — | honest | BLOCKED_EXTERNAL |
| FCM / APNs production | — | code | code | — | — | — | — | PENDING_HUMAN | — | Settings copy | BLOCKED_EXTERNAL |

## Code-owned vs external

- **Code-owned (Zenith closes):** visual remakes, HexMetric wiring, iOS shell, UniFFI scaffold, screenshot index, remaining UI states.
- **EXTERNAL:** Apple signing/Mac Simulator, Stripe LIVE, FCM/APNs prod, dual-device Supabase proof, Xiaomi SDKs.
- **DEFERRED_DEVICE:** Redmi MIUI inject, physical GPS accuracy.
