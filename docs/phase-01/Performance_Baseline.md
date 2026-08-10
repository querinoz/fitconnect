# Phase 01 — Performance Baseline

**Date:** 2026-08-07  
**Scope:** Foundation shell only — no feature screens, lists, or image grids.

---

## Build / compile baselines (measured)

| Metric | Value | Command / note |
|--------|-------|----------------|
| Full Android `build` | ~84s (warm daemon) | `cd android; .\gradlew.bat build` |
| `:app:assembleDebug` + unit tests | ~91s (first Phase 01 wiring) | includes `:foundation:test` |
| Debug APK | produced | `android/app/build/outputs/apk/debug/` |
| Release minify | **off** | baseline before R8 — enable in a later hardening pass |

---

## Runtime baselines (not measured — blocked)

| Metric | Status |
|--------|--------|
| Cold start (TTID / TTFD) | **Not measured** — emulator BIOS SVM blocked; no physical device attached this phase |
| Frame time / jank on splash→guest | Not measured |
| APK size (download / install) | Not recorded this phase — capture on first device install |
| Memory after splash | Not measured |
| Network idle battery | N/A (no background sync yet) |

When a device is available, capture once with:

```powershell
cd android
.\gradlew.bat :app:assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
# Then Android Studio Profiler → cold start + Memory for Splash→Guest
maestro test ..\maestro\android\smoke-foundation.yaml
```

Record numbers into this file before Phase 02 feature work so regressions have a floor.

---

## Architectural performance controls already in place

1. **Single OkHttp client** — connection pool reuse; no per-screen clients.  
2. **ImageLoader port** — prevents ad-hoc bitmap downloads when Coil lands.  
3. **No feature FlashList/LazyColumn content yet** — zero list jank to baseline.  
4. **Generated design tokens** — no runtime JSON theme parsing.  
5. **Edge-to-edge + splash API** — avoids custom splash Activity hop.

---

## Next measurements (Phase 02 entry criteria — recommended)

- [ ] Cold start p50/p90 on Pixel-class API 34+  
- [ ] Debug APK size (MB)  
- [ ] Release APK size with R8 on  
- [ ] Maestro smoke duration  
