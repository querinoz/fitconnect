# ANDROID_DEPENDENCY_AUDIT.md

**Date:** 2026-08-09

## Android Gradle modules (app)

| Dependency | Why | Class |
|------------|-----|-------|
| Firebase BOM + messaging | FCM production path | PRODUCTION (optional JSON) |
| OkHttp (foundation) | HTTP / Supabase | PRODUCTION |
| DataStore + Security crypto | prefs / session | PRODUCTION |
| Compose BOM / Material3 / Navigation | UI | PRODUCTION |
| Coroutines | async | PRODUCTION |
| SplashScreen | cold start | PRODUCTION |
| JUnit / coroutines-test | unit tests | TEST |

## Removal candidates

| Item | Status |
|------|--------|
| Unused NoOp realtime/notification | **Removed** this cycle |
| ArchitectureCoachAiPort | **Removed** |
| Coil / real analytics | Not added (NoOp intentional until provider chosen) |
| MapLibre SDK AAR | Not added — adapter ready; SDK needs human key/decision |

## Upgrade policy

No blind upgrades this cycle. Firebase/Compose versions remain catalog-pinned.
