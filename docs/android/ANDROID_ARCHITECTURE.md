# ANDROID_ARCHITECTURE.md

**Date:** 2026-08-09  
**Product priority:** Native Android (Kotlin / Compose)

## Layers

```
Compose UI (athlete / coach / app shell)
        ↓
Containers (manual DI CompositionLocals)
        ↓
Domain engines (geo · telemetry · sports · ai · community)
        ↓
Repository interfaces + Local/Prod adapters
        ↓
Foundation (auth · session · network · offline · notifications)
```

ViewModels are not yet universal; screens use `remember` + coroutines. Incremental ViewModel adoption is preferred over a big-bang rewrite.

## Adapter selection

| Port | Debug / no IdP | Live IdP | Release no config |
|------|----------------|----------|-------------------|
| Auth | LocalAuthRepository | SupabaseAuthRepository | Locked local + ProductionConfigGate |
| Realtime | InProcessRealtimeClient | SupabaseRealtimeClient | FailClosedRealtimeClient |
| Push | DevNotificationGateway | FcmNotificationGateway | FailClosedNotificationGateway |
| Map | InMemoryMapController (MapLibre-ready API) | same until SDK key | same |
| Community | DefaultCommunityContainer + seed | same local until backend | same |

Production never silently selects InProcess / Dev / Local when live config is present.

## Feature modules

- `:app` — shell, AuthScreen, OnboardingScreen, FCM service  
- `:athlete` / `:coach` — OS UI  
- `:community` — wired into athlete DI + CommunityScreen  
- `:geo` / `:telemetry` / `:sports` / `:ai` — domain  
- `:wear` / `:core-capture` — scaffold only  

## Fail-closed release

`assembleRelease` requires keystore + Supabase + FCM JSON. Absence = build failure (correct).
