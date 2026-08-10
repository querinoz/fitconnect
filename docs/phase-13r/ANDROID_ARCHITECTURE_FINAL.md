# ANDROID_ARCHITECTURE_FINAL.md

**Date:** 2026-08-09  
**Branch:** `chore/android-phase-13r-recovery`

## Release source of truth

| Path | Role |
|------|------|
| `android/` | **Authoritative** native Kotlin/Compose release target (`com.fitconnect.android`) |
| `apps/mobile/` | Expo Path A — **frozen / not** this RC binary |
| `android/wear` | Wear OS **scaffold only** — not product |

## Target architecture

```
:app (Compose shell, FCM service, BuildConfig)
  → :foundation (auth, authz, network, offline, session, notifications ports)
  → :athlete / :coach
  → :sports / :geo / :telemetry / :ai / :community / :design-ui / :design
```

## Flows (as implemented)

| Flow | Production path | Debug fallback |
|------|-----------------|----------------|
| Auth | `SupabaseAuthRepository` when URL+anon set | `LocalAuthRepository` only if `ALLOW_LOCAL_AUTH` |
| Realtime | `SupabaseRealtimeClient` when live auth | NoOp debug / FailClosed release |
| Push | `FcmNotificationGateway` when `FCM_CONFIGURED` | NoOp debug / FailClosed release |
| Signing | Mandatory `keystore.properties` for release | Debug unsigned OK |
| API | HTTPS `API_BASE_URL` | Emulator `10.0.2.2:3001` |

## Dependency graph (runtime)

OkHttp, DataStore, EncryptedSharedPreferences, Navigation Compose, Firebase Messaging (BOM), Coroutines.

## Status note

Architecture wiring ≠ certification PASS. Live IdP / FCM receipt / dual-client realtime / device E2E remain **BLOCKED** without secrets + devices.
