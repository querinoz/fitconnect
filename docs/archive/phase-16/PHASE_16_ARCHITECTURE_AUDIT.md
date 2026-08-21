# PHASE 16 — Architecture audit

**Date:** 2026-08-15  
**STITCH_ACCESS:** `BLOCKED` (HTTP 500 on the cited Stitch project). No Stitch screenshots invented.  
**Floor token:** `#070B14` (`--eos-floor` / `COLOR_TOKENS.floor`). The brief’s `#090402` is **not** applied — it would fork the design system.

This document was written **before** Phase 16 product code. It does not claim runtime PASS.

---

## 1. Surfaces

| Surface | Location | Role |
|---------|----------|------|
| Web (Next.js 14) | `apps/web` | Landing + PWA + dashboards. Prod: https://fitconnect-phi.vercel.app |
| Expo (frozen) | `apps/mobile` | Legacy Path A — **not** the production mobile track (ADR-005) |
| Android phone | `android/` (12 Gradle modules) | Production Elite OS |
| Wear OS | `android/wear` | Separate application; LOCAL_DEMO shell |
| Shared tokens | `packages/design-tokens` | Single colour/type/motion source → CSS + Kotlin |
| Domain packages | `packages/*`, `prisma/` | Web/API; Android has parallel Kotlin domain in modules |

There is **no** Xcode / watchOS / Swift target in the repo.

---

## 2. Android modules (`android/settings.gradle.kts`)

```
:app :wear :core-capture :design :design-ui :foundation
:sports :geo :telemetry :community :ai :athlete :coach
```

| Module | Responsibility |
|--------|----------------|
| `app` | Application, splash, auth, nav host, FCM stub, QR debug APK |
| `athlete` | Athlete OS UI (Home, Discover, Activity, Community, Profile, nested Sessions/Programs) |
| `coach` | Coach OS UI (Overview, Athletes, Calendar, Inbox, More/Settings) |
| `design` | Generated Elite Surface tokens |
| `design-ui` | Compose components, theme (dark/light), motion |
| `foundation` | Auth, offline, locale, theme prefs, nav guard |
| `geo` | Discovery, booking, `MapProvider` + in-memory controllers |
| `telemetry` | Wear ports, device center, sync |
| `core-capture` | `LiveActivityEngine` (LOCAL_DEMO) + future ForegroundService capture |
| `wear` | Watch UI; **not** mixed into `:app` |
| `community` / `ai` / `sports` | Local engines |

**DI:** `AppContainer` → `AthleteContainer` / `CoachContainer`. No Hilt.

**State:** Compose + `StateFlow` / repositories. Persistence: DataStore / in-memory LOCAL_DEMO stores. Networking: not production IdP.

---

## 3. Web

| Path | What it is |
|------|------------|
| `/` | Landing (Elite OS / Voltline) |
| `/mobile` | Marketing **launcher** (`MobileAppLauncher`) → demo sign-in into `/dashboard` |
| `/dashboard`, `/discover`, … | App shell (`elite-app-shell`) with Stitch-inspired mobile chrome on small viewports |
| `/app/mobile` | **Missing** before this phase — dedicated mobile-web cockpit URL |

PWA: `app/manifest.ts` exists (floor `#070B14`, volt `#C8FF00`). Service worker is **unregistered** in `layout.tsx` / `providers.tsx` — do not claim PWA offline PASS.

i18n web: EN PT ES FR DE IT (`apps/web/lib/i18n`). Default lang `pt`.

---

## 4. Duplication (do not delete without proof)

| Item | Copies | Action |
|------|--------|--------|
| Design colours | `elite-os.css` + `packages/design-tokens` + generated Kotlin | Keep pipeline; do not hand-author hex |
| Readiness | `apps/web/lib/readiness`, Android telemetry/athlete | Shared concept; not one runtime |
| Mobile preview | `MobileAppPreview` (landing) vs Android Compose vs Stitch screens | Different surfaces; align hierarchy, don’t merge APK into Next |
| Expo vs Android | Entire `apps/mobile` | Frozen; do not treat as Wear/Android |

---

## 5. Auth / realtime / push / maps / telemetry

| Concern | Android | Web | Production |
|---------|---------|-----|------------|
| Auth | LOCAL_DEMO personas + fail-closed if IdP unset | Demo credentials + Supabase optional | PENDING_HUMAN |
| Realtime | In-process | Broadcast / Convex optional | Not claimed live |
| FCM | Service class exists | — | PENDING_HUMAN |
| Maps | `MapProvider` + **in-memory** controller (MapLibre/Google names without SDK bind) | MapLibre on web where used | Must label LOCAL_DEMO |
| Activity GPS | `LiveActivityEngine` simulated | N/A | Hardware not bound |
| Wear sync | `NoWearCompanion` NOT_PAIRED | N/A | DataLayer not bound |

---

## 6. Known gaps vs this brief (pre-change)

1. No `/app/mobile` device-frame cockpit for desktop preview of the **same** Athlete tab model (Home / Discover / Activity / Community / Profile).
2. `MapLibreProvider` uses `InMemoryMapController` — naming implies production SDK.
3. Wear event protocol (START/PAUSE/RESUME/END as a typed link) exists only as workout control ports + unpaired companion.
4. Android locales: EN/PT/ES/FR/DE in enum; resources mainly `values` + `values-pt`. No `pt-PT` vs generic `pt`. No `values-es`.
5. Makefile has web `start` only — no `doctor`, `android`, `wear`, `qa`.
6. No watchOS / Xiaomi native projects.
7. Emulator hypervisor **BLOCKED** (`accel: 6`) — device PASS impossible until human BIOS/AEHD.
8. Splash is brand reveal + session restore — not a long fake boot; SYS labels can be clearer without adding delay.

---

## 7. Architectural principle (locked)

```
CORE (domain per platform module)
  ├── Android adapters (:app :athlete :coach …)
  ├── Wear adapter (:wear)
  ├── Web adapter (apps/web)
  └── Future: watchOS (not in this repo)
```

Do **not** create one mega-module. Do **not** run Kotlin on watchOS. Do **not** install the phone APK on HyperOS proprietary watches and call it support.

---

## 8. Phase gate

**PHASE_16A_ARCHITECTURE** = documentation complete.  
Runtime/visual/emulator evidence is **out of scope for 16A**.
