# Android documentation (current)

**Status:** LOCAL_DEMO / ENGINEERING PARTIAL

**Athlete neu-glass UI:** ENGINEERING COMPLETE (waves 0–6)

**Watch sync:** UNVERIFIED

**Production:** NO-GO

**Canonical roadmap:** [../master-plan/21_FINAL_ROADMAP.md](../master-plan/21_FINAL_ROADMAP.md)

Native app lives in `android/` (Kotlin + Jetpack Compose). Expo `apps/mobile` is frozen (ADR-005).

## Neu-glass (2026-09)

| Document | Purpose |
|----------|---------|
| [../design/ELITE_OS_NEU_GLASS.md](../design/ELITE_OS_NEU_GLASS.md) | Canonical neu-glass spec (rules, chart palette, typography) |
| [../../android/docs/elite-os-neu-glass-wave6.md](../../android/docs/elite-os-neu-glass-wave6.md) | Wave 6 report, commits, screenshots |

Screenshots: `android/wave1-today-screenshot.png` … `wave5-train-screenshot.png`.

## Canonical current files

| Document | Purpose |
|----------|---------|
| [ANDROID_LOCAL_DEMO_GUIDE.md](ANDROID_LOCAL_DEMO_GUIDE.md) | Debug APK + local demo personas |
| [HEALTH_CONNECT.md](HEALTH_CONNECT.md) | Health Connect integration vs Google dev center |
| [ANDROID_LOCAL_QR_DISTRIBUTION.md](ANDROID_LOCAL_QR_DISTRIBUTION.md) | Same-Wi-Fi QR install |
| [ANDROID_ARCHITECTURE.md](ANDROID_ARCHITECTURE.md) | Module architecture |
| [ANDROID_NAVIGATION_MATRIX.md](ANDROID_NAVIGATION_MATRIX.md) | Athlete IA destinations |
| [ANDROID_DEVICE_CENTER.md](ANDROID_DEVICE_CENTER.md) | Device / AVD notes |
| [ANDROID_EMULATOR_VALIDATION.md](ANDROID_EMULATOR_VALIDATION.md) | Emulator checks (often BLOCKED without hypervisor) |
| [ANDROID_HUMAN_PENDING.md](ANDROID_HUMAN_PENDING.md) | PENDING_HUMAN Android items |
| [HUMAN_FINAL_CONFIGURATION.md](HUMAN_FINAL_CONFIGURATION.md) | Signing, Firebase file, Wear hardware |
| [ANDROID_WEAR_STATUS.md](ANDROID_WEAR_STATUS.md) | Wear module status (device UNVERIFIED) |
| [auth/](auth/) | Firebase auth engineering (PRODUCTION_AUTH PENDING_HUMAN) |
| [wear/WEAR_ARCHITECTURE.md](wear/WEAR_ARCHITECTURE.md) | Wear architecture |
| [wear/WEAR_PRODUCT_GAP_ANALYSIS.md](wear/WEAR_PRODUCT_GAP_ANALYSIS.md) | Watch gaps vs P7 |

Phase 14–16 exit gates and visual QA snapshots: [../archive/android/](../archive/android/).
