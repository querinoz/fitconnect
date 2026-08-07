# Android Production QA — `apps/mobile` (Expo)

**Date:** 2026-08-07 · **Auditor:** engineering (static audit) · **Verdict: NOT SHIPPABLE — production readiness 14/100**

---

## 0. Scope honesty (read this before the scores)

Two constraints shaped what this audit could be, and neither is negotiable by effort:

1. **The app under audit is frozen legacy.** `apps/mobile` was frozen this morning under ADR-005 (owner decision D1): Expo → native Android. The QA request describes it as the production Android app; it is not, and the native replacement (`android/`) is an F0 skeleton with one hello-world screen.
2. **No device or emulator is available.** BIOS virtualization is disabled (see `qa/HUMAN-QUEUE.md`), so the emulator cannot boot. **Phases 3, 5, 7–9, 11–17, 19 require running the app and were NOT executed.** No score below is derived from a running app.

Everything reported here was verified by reading code or running a command. Nothing is inferred from "it looks conventional".

---

## 1. Executive summary

`apps/mobile` is a **UI prototype**, not an application. 56 source files, 2 352 lines, 18 screens, all rendering `lib/mock-data`. The stack described in the QA brief (Convex, Supabase, Stripe, LiveKit, MapLibre, React Query) **is not present in the app's dependencies** — none of those packages are installed. There is no backend integration beyond three `fetch` calls to a `localhost:3001` default, no real authentication, no map, no health data, and no Wear OS capability.

It cannot be built for the Play Store at all: `app.config.ts` has no `android` block, so there is no applicationId, no permissions, no versionCode, and no adaptive icon. The EAS project ID is the placeholder string `"fitconnect-mobile-demo"`.

The gap between this and "indistinguishable from Strava/WHOOP" is not a QA backlog — it is the entire product. That is precisely the conclusion ADR-005 already reached, and this audit independently confirms it with numbers.

## 2. Scores

Scored only where evidence exists. "n/a" means the phase needs a running app and was not faked.

| Dimension | Score | Basis |
|---|---|---|
| **Overall production readiness** | **14 / 100** | builds only in Expo Go; no store-buildable config; mock data throughout |
| Android readiness | 8 / 100 | no `android` config block, no icon/splash, no permissions, no real EAS project |
| Wear OS readiness | 0 / 100 | structurally impossible in Expo/RN; native `wear` module is an empty skeleton |
| Architecture | 30 / 100 | clean file layout and a real token bridge, but no data layer, no auth, no error boundaries |
| Security | 20 / 100 | hardcoded credentials in bundle, unencrypted MMKV, cleartext default endpoint |
| UI (static) | 45 / 100 | consistent token usage in places; typography unachievable (no font loading) |
| UX | n/a | requires a running app |
| Accessibility | n/a (static findings only) | requires TalkBack on device |
| Performance | n/a | requires a running app |

## 3. Findings

Severity: **P0** blocks release · **P1** broken/unusable flow · **P2** degraded · **P3** polish.

| ID | Sev | Area | File | Issue | Root cause | Fix | Effort |
|---|---|---|---|---|---|---|---|
| M-01 | P0 | Build | `app.config.ts` | No `android` block: no `package`, `versionCode`, `permissions`, `adaptiveIcon`. Cannot produce a Play-submittable build. | Config written for Expo Go demo only | Add full `android` config + permission list | 0.5d |
| M-02 | P0 | Build | `app.config.ts:18` | EAS `projectId: "fitconnect-mobile-demo"` is a placeholder, not a UUID — `eas build` cannot resolve the project | Never linked to a real EAS project | `eas init` against a real account | 0.5d |
| M-03 | P0 | Assets | `assets/` | Only `brand/logo.png @2x @3x`. No app icon, no adaptive icon, no splash image; no `icon`/`splash` keys in config → ships Expo's default icon | Assets never produced | Produce icon set + adaptive foreground/background + splash | 1d |
| M-04 | P0 | Wear OS | — | Zero Wear OS support and none is achievable in Expo/RN | Framework limitation (this is ADR-005's core argument) | Native module (already scaffolded at `android/wear`) | n/a |
| M-05 | P1 | Auth/Nav | `app/index.tsx:5-9` | Cold start bounces logged-in users to sign-in: redirect reads `user` from a zustand `persist` store backed by **async** SecureStore, before rehydration completes. No `hasHydrated` gate. | Async storage treated as sync | Gate routing on `persist.onFinishHydration` / `hasHydrated`, render a splash until then | 0.5d |
| M-06 | P1 | Security | `lib/auth-store.ts:14-38` | Hardcoded demo credentials shipped in the bundle (`ines@fitconnect.local`/`Athlete`, `tomas@fitconnect.local`/`Coach`), validated client-side. No real auth anywhere — Supabase is not a dependency of this app. | Demo scaffold | Real Supabase auth + server-side validation | 3-5d |
| M-07 | P1 | Security | `lib/cache.ts:3` | `new MMKV({ id: "fitconnect-cache" })` has no `encryptionKey` → athlete/health-adjacent data cached unencrypted at rest | Default constructor | Supply an encryption key held in SecureStore | 0.5d |
| M-08 | P1 | Tests | `lib/readiness.test.ts:19` | **Failing test.** Expects `"Recovery"`, `@fitconnect/utils` returns `"…consider recovery."` | Readiness copy centralised into `@fitconnect/utils` without updating this test | Fix assertion (or the copy, if capital-R was intended) | 15min |
| M-09 | P1 | Tests | `vitest.config.ts:6` | `include: ["lib/**/*.test.ts"]` — `__tests__/sessions.test.ts` and `__tests__/today.test.ts` **never run**. Proven by forcing them: 2/2 pass. 40% of test files were dark. | Include glob too narrow | Widen include to cover `__tests__/` | 15min |
| M-10 | P1 | Network | `lib/notifications.ts:5`, `lib/realtime/use-mobile-channel.ts:3` | `API_BASE` defaults to `http://localhost:3001` — unreachable from a device, and cleartext HTTP is blocked by default on Android 9+. All three calls swallow errors (`.catch(() => undefined)`), so failures are silent. | Dev default shipped as prod default | Require `EXPO_PUBLIC_WEB_URL`, fail loudly, use HTTPS | 0.5d |
| M-11 | P1 | Map | `app/(athlete)/map.tsx` | Phase 9 is entirely unimplemented — the screen renders a text panel, no map. MapLibre is not a dependency. | Placeholder screen | Implement or remove from nav | 3-5d |
| M-12 | P1 | Telemetry | `lib/health/health-connect.ts` | Health Connect bridge is a stub: `requestHealthConnectPermissions()` returns `false`, `syncHealthConnectSamples()` returns `0`. No HR/HRV/sleep/steps ingestion exists. | Never implemented (needs a native build) | Native Health Connect integration (planned F8) | 5d+ |
| M-13 | P1 | Data | 11 files import `lib/mock-data` | Every screen renders mock data. No Convex, Supabase, or React Query in dependencies; realtime is a `fetch` bridge to the web API. | Prototype by design | Real data layer | 10d+ |
| M-14 | P2 | Typography | `package.json` | `expo-font` is not a dependency and no `useFonts` call exists → brand fonts (Syne, Plus Jakarta Sans, JetBrains Mono) cannot render; everything silently falls back to system | Fonts never wired | Add `expo-font` + load brand faces | 0.5d |
| M-15 | P2 | Splash | `app/_layout.tsx:21` | `AppIntroSplash` is a React component rendered after JS boots; `expo-splash-screen` is absent → blank frame before it appears | No native splash | Add `expo-splash-screen`, hide on ready | 0.5d |
| M-16 | P2 | Offline | `hooks/useOffline.ts`, `lib/cache.ts` | Offline banner + MMKV cache exist, but there is no mutation queue and no conflict resolution — Phase 13 requirements are unmet by design | Not built | Outbox pattern (planned in Elite Core F2) | 5d |
| M-17 | P2 | Scope | `app.config.ts:11` | `platforms: ["ios","android"]` still advertises iOS, contradicting the v1 scope contract (iOS must not appear in v1 code/UI/docs) | Pre-decision config | Drop `"ios"` | 5min |
| M-18 | P3 | Process | `.github/workflows/ci.yml` | Excluding `apps/mobile` from CI this morning (part of the freeze) also **masked the failing test M-08** rather than fixing it | Freeze applied broadly | Fix M-08 regardless of freeze status | — |

Navigation and design-system deep audits were dispatched in parallel; their findings append here when complete.

## 4. What could not be verified (and why)

Phases 3 (visual/overflow/responsive), 5 (button audit), 7–9 (athlete/coach/map journeys), 11–17 (telemetry, realtime, offline, performance, Android versions, Wear, TalkBack), 19 (crash/stress) all require the app running on a device or emulator. **The emulator is blocked on BIOS virtualization; no physical device is connected.** Any score for these would be fabrication.

**To unblock:** enable SVM Mode in BIOS/UEFI, or connect an Android phone over USB with debugging enabled — the AVD, SDK, and adb are all ready.

## 5. Action plan

The honest recommendation is not a fix list for this app. Every P0 here is a "build the thing" item, and M-04 (Wear OS) cannot be fixed in this stack at any effort. Reaching genuine production quality on `apps/mobile` means rebuilding the data layer, auth, map, and telemetry inside a framework the v1 scope has already rejected — roughly 25–35 engineer-days that would be discarded when the native app lands.

Two coherent paths, in preference order:

**A. Stay the course (recommended).** Leave `apps/mobile` frozen. Fix only M-08 and M-09 (30 minutes, removes a red test and un-darkens two test files) and let this report stand as the documented state of the legacy app. Android quality effort goes into `android/` on the F1→F4 path.

**B. Unfreeze for an interim release.** If a shippable Android app is needed before the native one is ready, the minimum viable list is M-01, M-02, M-03, M-05, M-06, M-07, M-10, M-14, M-15 (~8–10 days) — and it would still be a mock-data app with no map, no health data, and no watch.

This is a product decision, not an engineering one, and it is escalated rather than assumed.
