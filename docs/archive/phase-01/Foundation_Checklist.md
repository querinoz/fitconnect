# Phase 01 — Foundation Checklist

Legend: ✅ done · 🟨 architecture-only / partial · ❌ blocked or deferred · 🚫 out of scope this phase

## Architecture & DI

- ✅ Single `:foundation` module for cross-cutting concerns  
- ✅ Composition-root `AppContainer`  
- ❌ Hilt (deferred — AGP 9 / KSP risk)  
- ✅ Features cannot bypass network/storage ports (enforced by convention + module boundary)

## Design system

- ✅ App theme consumes generated `EliteSurfaceColors`  
- ✅ Token pipeline `pnpm tokens:kotlin` / `:check` (pre-existing)  
- 🟨 Web still has `ui-glass` duplicates (migration deferred — not REMOVE_CANDIDATE)  
- 🟨 Adaptive / branded launcher icons not yet authored

## Navigation

- ✅ Splash / Guest / Auth / Logged / Role / Error routes  
- ✅ Deep links (`fitconnect://app/…`)  
- ✅ Edge-to-edge + safe drawing padding  
- 🟨 Android system back — standard NavController (no custom predictive-back polish)  
- 🟨 Protected routes = session check on splash; no authenticated route interceptor middleware yet

## Networking

- ✅ OkHttp `ApiClient` + auth interceptor + timeouts + error mapping  
- 🟨 Retry = connection-failure only (no idempotent request retry policy)  
- ❌ Refresh-token Authenticator (F3)  
- 🟨 Offline queue not wired into ApiClient yet

## Storage & offline

- ✅ DataStore preferences  
- ✅ EncryptedSecureStore for tokens  
- ✅ SyncQueue interface + in-memory impl  
- ❌ Room durability / WorkManager background sync  
- ❌ Conflict resolution strategy implementation

## Errors / logging / analytics

- ✅ `AppError` / `AppResult`  
- ✅ `Logger` + `CrashHandler`  
- ✅ Analytics port + NoOp  
- ❌ Production crash reporter / analytics provider

## Performance

- ✅ ImageLoader port  
- 🟨 No Coil / list virtualization product code (no feature lists yet)  
- 🟨 Bundle/R8 minify still off on release (`isMinifyEnabled = false`)

## Android platform

- ✅ Build types debug/release + BuildConfig API URL  
- ✅ INTERNET + ACCESS_NETWORK_STATE  
- ✅ Dark theme window + Compose dark scheme  
- ✅ Keyboard `adjustResize`  
- 🟨 Battery / background task policy not productized  
- ❌ Emulator smoke (BIOS SVM — human queue)

## Accessibility

- ✅ Min touch target constants + applied on foundation CTAs  
- ✅ contentDescription on primary actions  
- 🟨 TalkBack full audit / dynamic type scale / reduced-motion Compose helpers — later

## Testing

- ✅ JUnit foundation + app  
- ✅ Maestro YAML scaffold  
- ❌ Maestro executed on device  
- 🚫 Detox / Playwright-for-Android not applicable on native track  
- 🟨 Snapshot / visual regression not configured

## Cleanup

- ✅ W1 REMOVE_CANDIDATE orphans deleted  
- ✅ False orphan `imagekit-loader` restored  
- 🚫 Broader monorepo reorg into prompt’s `packages/*` feature folders — rejected (creates empty debt)

## Documentation

- ✅ This phase report set under `docs/phase-01/`  
- ✅ `android/README.md`

---

## Gate to Phase 02

Before any feature module:

1. Human accepts honest scores in `Android_Foundation_Report.md` **or** closes remaining ❌ items deemed blocking.  
2. Prefer resolving BIOS SVM / physical device so Maestro smoke can run once.  
3. Explicit “Phase 02 approved” message.
