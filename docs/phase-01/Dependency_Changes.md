# Phase 01 — Dependency Changes

## Android (`android/gradle/libs.versions.toml`)

### Added

| Library | Version | Used by |
|---------|---------|---------|
| `okhttp` | 4.12.0 | `:foundation` ApiClient |
| `androidx.datastore:datastore-preferences` | 1.1.7 | `:foundation` KeyValueStore |
| `androidx.security:security-crypto` | 1.1.0-alpha06 | `:foundation` SecureStore |
| `kotlinx-coroutines-android` | 1.10.2 | `:foundation`, `:app` |
| `kotlinx-coroutines-test` | 1.10.2 | `:foundation` tests |
| `androidx.navigation:navigation-compose` | 2.9.0 | `:app` NavHost |
| `androidx.core:core-splashscreen` | 1.0.1 | `:app` splash |
| `junit` (catalog entry) | 4.13.2 | unit tests |

### Modules

| Module | Change |
|--------|--------|
| `:foundation` | **New** library module |
| `:app` | Now depends on `:foundation` (+ splash, navigation, coroutines) |
| `:design` / `:wear` / `:core-capture` | Unchanged API surface |

### Not added (deferred)

Hilt, Room, Coil, WorkManager, PostHog Android, Supabase Kotlin, Detox, MMKV, Expo packages.

---

## Web / monorepo

| Change | Detail |
|--------|--------|
| Source deletes | 31 REMOVE_CANDIDATE orphans (see Cleanup_Executed) |
| `packages/ui` | Directory removed (was never a valid workspace package) |
| `framer-motion` | **Not removed** this phase — confirm zero imports in a dedicated dep PR if still desired |
| `apps/web/vitest.config.ts` | Coverage excludes cleaned for deleted paths |
| `imagekit-loader` | Kept |

No new npm dependencies were introduced for Phase 01 Android foundation work.
