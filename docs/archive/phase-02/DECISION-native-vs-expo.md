# Phase 02 Decision — Core Platform on native Android

**Date:** 2026-08-07 · **Authority:** ADR-005 + Phase 01 approval + Phase 01 `DECISION-native-vs-expo.md`

The Phase 02 prompt again names Expo Router, MMKV, Detox, and React Native packaging.

**Resolution:** Core Platform is built under `android/foundation` + `:app` (Kotlin / Compose). Prompt terms map as:

| Prompt | Native Core Platform |
|--------|----------------------|
| Expo Router | Compose Navigation + typed destinations + guards |
| MMKV | DataStore preferences + in-memory/feature-flag cache |
| SecureStore | EncryptedSharedPreferences (`SecureStore`) |
| Detox | Maestro + JUnit |
| tRPC client | `TrpcPort` interface (transport later) |
| Supabase Auth | `AuthRepository` provider-agnostic + local/dev adapter |

No Athlete / Coach / Maps / Community / AI / Telemetry / Programs UI.
