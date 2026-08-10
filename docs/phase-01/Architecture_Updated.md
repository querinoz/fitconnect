# Phase 01 — Architecture Updated

**Supersedes (for Android track):** portions of `docs/phase-00/Architecture_Report.md` that assumed Expo as the active mobile surface.

---

## Decision lock

| ID | Decision |
|----|----------|
| ADR-005 / D1 | Native Android (Kotlin + Compose) is the mobile product |
| Phase 01 decision | Expo wording in the Phase 01 prompt maps to native equivalents — see `DECISION-native-vs-expo.md` |
| Path A | `apps/mobile` frozen; no new Expo features |

---

## Target runtime architecture (Android)

```
┌─────────────────────────────────────────────┐
│ :app  FitConnectApplication + NavHost       │
│   theme ← :design (EliteSurfaceColors)      │
│   deps  ← :foundation (AppContainer)        │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│ :foundation                                 │
│  AppError/Result · Logger · AppConfig       │
│  ApiClient (OkHttp) · SessionStore          │
│  DataStore · SecureStore · SyncQueue        │
│  Analytics · ImageLoader · CrashHandler     │
└───────────────────┬─────────────────────────┘
                    │ (later)
┌───────────────────▼─────────────────────────┐
│ elite-core (Rust) via JNI / UniFFI          │
│  streams · metrics · zones · FIT (F1+)      │
└─────────────────────────────────────────────┘
```

Web (`apps/web`) remains the marketing + PWA surface. It does **not** share the Android DI graph; shared domain logic converges in `elite-core` + `packages/design-tokens`.

---

## Navigation model

| Flow | Route | Guard |
|------|-------|-------|
| Splash | `splash` | Reads `SessionStore.isLoggedIn()` |
| Guest | `guest` | Unauthenticated default |
| Auth | `auth` | Foundation demo session only (F3 = Supabase) |
| Logged | `home` | Requires session token |
| Role | `role` | Displays `UserRole` — no feature graphs yet |
| Error | `error` | Recovery destination |

Deep links: `fitconnect://app/{guest|auth|home}`. Android back stack uses standard `NavController` pop behavior.

---

## Networking / storage / offline

- **One** HTTP client (`OkHttpApiClient`). Features must not open raw sockets/URL connections.  
- Tokens only in `SecureStore`. Preferences in DataStore.  
- Offline = `SyncQueue` port + in-memory impl. Conflict resolution / WorkManager = later phase.  
- Analytics / ImageLoader = ports with no-op impls until providers are chosen.

---

## DI

Composition root: `DefaultAppContainer`. No Hilt/KSP in Phase 01 (AGP 9 risk surface). Ports are interface-first so Hilt can replace the root without rewriting call sites.

---

## What remains architectural debt (accepted into checklist)

1. Token refresh Authenticator not yet implemented (F3).  
2. SyncQueue not durable (Room).  
3. Real crash reporter not wired.  
4. Adaptive icons / Play-ready branding assets.  
5. Device-level smoke still blocked (BIOS SVM).
