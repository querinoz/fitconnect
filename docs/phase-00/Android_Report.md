# Phase 00 — Android Readiness Report

**Date:** 2026-08-07 · **No code changed**

Two Android surfaces exist. They must not be conflated.

---

## 1. Surface A — Native (`android/`) — TARGET

| Item | Status | Evidence |
|------|--------|----------|
| Gradle project | ✅ Compiles | `gradlew build` SUCCESS (F0 gate) |
| Modules | `:app` `:wear` `:core-capture` `:design` | `settings.gradle.kts` |
| AGP / Kotlin | AGP 9.3 + built-in Kotlin | kotlin.android plugin removed (required) |
| Wrapper | Gradle 9.5.0 committed | `gradle/wrapper/` |
| applicationId | `com.fitconnect.android` | Named assumption; veto until Play upload |
| minSdk / targetSdk | 26 / 35 (phone); wear min 30 | Health Connect floor |
| Tokens | Generated Kotlin ARGB consts | `pnpm tokens:kotlin` |
| Elite Core JNI | Skeleton only | F1 bindings pending |
| Capture engine | Stub object | F4 |
| Wear OS | Empty compiling module | D5 — cut decision at F13 |
| Permissions / Manifest | Minimal | Expand F3/F4/F8 |
| Deep links | Not configured | F3 |
| Fonts / assets | Not yet | F3 (Elite Surface) |
| Offline / Room | Not yet | F2 |
| Notifications / FGS | Not yet | F4 |
| BLE | Not yet | F5 |
| Emulator | **BLOCKED** | BIOS virtualization disabled (`qa/HUMAN-QUEUE.md`) |
| Physical device | Not provided | D3 open |

**Native readiness score: 22 / 100** — structure green, product features not started. This is expected at F0→F1.

---

## 2. Surface B — Expo (`apps/mobile`) — LEGACY FROZEN

Full audit: `qa/reports/mobile-android-audit.md` (49 findings). Headline:

| Item | Status |
|------|--------|
| Production readiness | **9 / 100** |
| Launches? | **Almost certainly no** (MMKV 3 + New Arch unset; also fails Expo Go) |
| Play-store config | Missing entire `android` block |
| Wear OS | Impossible in this stack |
| Design system | 29/100 — wrong token package, zero safe areas, no fonts |
| Auth | Demo credentials; role self-assign |
| Map / Health / Realtime | Placeholders / stubs |

**Owner decision:** Path A — do not unfreeze. Quality effort goes to Surface A.

---

## 3. Android checklist (Phase 00 Step 7)

| Topic | Expo | Native | Notes |
|-------|------|--------|-------|
| Android project | Expo prebuild (none checked in) | ✅ Gradle | |
| Gradle | N/A | ✅ | |
| Permissions | Not declared | Minimal | Need location, notifications, BT, Health Connect, FOREGROUND_SERVICE_* |
| Manifest | Generated at prebuild | Minimal MainActivity | |
| Navigation | Broken (phantom tabs, back) | Single activity stub | Compose Navigation in F3 |
| Deep Links | scheme only, broken URLs | None | |
| Fonts | None loaded | None yet | |
| Assets | Logo only | None | |
| Performance | Not measured | Not measured | Emulator blocked |
| Animations | Reanimated present unused-ish | Compose later | |
| Memory | Not measured | — | |
| Offline | MMKV unencrypted, no queue | Planned F2 | |
| Notifications | Demo schedule | Planned F4 ongoing notification | |
| Background tasks | None real | FGS + WorkManager F4/F2 | |
| Wear OS | ❌ | Scaffold only | |
| Tablets / fold | Untested | Untested | Large-screen later |
| Android 10–15 matrix | Untested | Untested | Needs emulator/device |

---

## 4. Recommendation

1. Treat **native `android/`** as the only Android product.
2. Keep Expo tree frozen until archive criteria (native shell proven in field — F6).
3. Unblock **BIOS virtualization or physical device** before F3 visual QA (HUMAN-QUEUE).
4. Do not spend Phase 01 polishing Expo.

---

## 5. Acceptance for "Android ready to build features"

Phase 01 (maps to F1 completion + F2 start) may begin only when:

- [x] Phase 00 reports approved (this set)
- [ ] Elite Core F1 gate green (FIT parity) — *implementation phase, not Phase 00*
- [ ] Emulator or device available for UI work
- [ ] HUMAN-QUEUE D3 answered before F4 physical gates
