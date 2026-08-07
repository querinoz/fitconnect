# Android Production QA — `apps/mobile` (Expo)

**Date:** 2026-08-07 · **Auditor:** engineering (static audit) · **Verdict: NOT SHIPPABLE — production readiness 9/100**

> **Score revised down from 14 after the navigation and design-system deep audits (§6, §7).** The decisive finding is M-19: the app almost certainly **does not launch at all**, in either run mode. Everything previously scored assumed a running-but-incomplete app; that assumption is now unsupported.

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
| **Overall production readiness** | **9 / 100** | does not launch (M-19); no store-buildable config; mock data throughout |
| Android readiness | 5 / 100 | no `android` config block, no icon/splash, no permissions, no real EAS project, New Arch unset |
| Design-system compliance | 29 / 100 | correct plumbing, retired palette: 73/146 colour refs off-brand; zero safe-area handling; no brand fonts |
| Navigation & auth | 15 / 100 | session persistence dead, phantom tab slots, no real auth, hardware back unhandled |
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
| M-19 | **P0** | Runtime | `lib/cache.ts:3` + `app.config.ts` | **The app does not launch.** `new MMKV()` runs at module scope and `react-native-mmkv@3.3.3` is a C++ TurboModule that throws when the New Architecture is off. `newArchEnabled` is set nowhere (app.config.ts, eas.json, no prebuilt `android/`), and SDK 52 does **not** enable New Arch for existing projects — only for ones created from the SDK 52 template. In Expo Go the same import fails for a different reason: MMKV is a third-party native module and is not in the Expo Go binary. The throw propagates `lib/cache.ts` → `lib/i18n-provider.tsx:10` → `app/_layout.tsx:6`, i.e. the root layout, so no screen renders in either mode. | Native dependency added without enabling the architecture it requires | Set `newArchEnabled: true` and rebuild, or pin `react-native-mmkv@2.x`; independently make cache construction lazy + fault-tolerant | 0.5d |

**Confidence on M-19:** verified statically (installed version 3.3.3, its `ModuleNotFoundError` path, absence of `newArchEnabled` in every config surface, and Expo's published SDK 52 default). Not verified by execution — no device or emulator available. One EAS build would settle it definitively.

---

## 6. Navigation / auth / persistence audit (21 findings)

Every behavioural claim below was checked against the **installed** library source in `node_modules`, not documentation.

| ID | Sev | File:Line | Issue | Fix |
|---|---|---|---|---|
| NAV-01 | P0 | `lib/auth-store.ts:52-63`, `app/index.tsx:5-9` | Session persistence is functionally dead. `persist` hydrates via `SecureStore.getItemAsync` (a real Promise), so `set(stateFromStorage)` lands after first render; `<Redirect>` fires from `useFocusEffect` and wins the race. Cold start always sends the user to sign-in, and nothing re-routes once hydration completes — the restored session is silently discarded. | Gate on `persist.hasHydrated()` / `onFinishHydration`; render a splash, not a `Redirect`, while unhydrated |
| NAV-02 | P0 | `components/nivis-tab-bar.tsx:18` | Custom tab bar maps `state.routes` and ignores `options.tabBarButton`/`tabBarItemStyle` — which is exactly how expo-router implements `href: null`. Athlete bar renders **9** slots (4 invisible but tappable), coach 6. Tapping the phantom `sessions/[id]/room` slot navigates with no `id` → renders "Session undefined" and POSTs to `/api/v1/sessions/undefined/feedback`. Real tabs are also squeezed by 4 phantom `flex:1` slots. | Filter routes whose `tabBarButton` is defined or whose `tabBarItemStyle.display === 'none'`; compute focus from `state.routes.indexOf(route)` |
| NAV-03 | P0 | `lib/cache.ts:3` | See M-19 (app does not launch). | See M-19 |
| NAV-04 | P0 | `app/(auth)/signup.tsx:16-25` | No authentication exists. `submit()` validates nothing — empty email, empty password — and mints a user with a role taken from a **client-side radio button**. Anyone self-assigns `role: "coach"` and gets the full coach surface. Every route guard is therefore decorative. | Server-issued session; derive role server-side; store an opaque token, not a plaintext user object |
| NAV-05 | P1 | `components/session-card.tsx:27` ← `app/(coach)/sessions.tsx:12` | `SessionCard` hardcodes an `(athlete)` room href but is reused on the coach agenda. A coach tapping "Join video room" is bounced by the athlete guard back to coach Overview. **Coaches can never join a session room** — no coach-side room route exists. | Move the room to a role-agnostic route, or pass the href in as a prop |
| NAV-06 | P1 | `lib/notifications.ts:53` | Broken deep link twice over: `fitconnect://sessions/s-101` resolves to a path no route matches (only `/sessions` and `/sessions/[id]/room` exist) → `+not-found`; and **no notification-response listener exists anywhere**, so `data.url` is never read regardless. | `fitconnect:///sessions/s-101/room` + a response listener in the root layout, including cold-start handling |
| NAV-07 | P1 | `app/(athlete)/sessions/[id]/room.tsx` | The video room is a tab sibling, not a stack push, with `headerShown:false` and no close control. Android back goes to the **Today** tab (TabRouter `backBehavior: 'firstRoute'`); a second back exits the app. | Add `sessions/_layout.tsx` with a `Stack`, or an explicit close calling `router.back()` |
| NAV-08 | P1 | `lib/auth-store.ts:57` + 3 call sites | Logout only sets `user: null`. MMKV is untouched — cached readiness, HRV, sleep and sessions **survive into the next account**. `persist` also rewrites `{"state":{"user":null}}` rather than deleting the key. Logout is duplicated inline in 3 screens. | One `signOut()` action: clear state + `cache.clearAll()` + `persist.clearStorage()` |
| NAV-09 | P2 | `(athlete)/map.tsx` vs `(coach)/map.tsx` (and sessions, index) | Duplicate public paths across sibling groups; group segments are optional in path matching and the tie-break returns 0, so `(athlete)` wins permanently. A coach deep-linking `/map` lands on the athlete map, then gets guard-redirected — never reaching their own. | Distinct paths per group, or one route that branches on role |
| NAV-10 | P2 | `(athlete)/discover.tsx`, `programs.tsx`, `community.tsx` | Orphan screens: referenced only in `href: null` declarations. No `Link`, `push`, or `navigate` targets them anywhere. | Add real entry points or delete |
| NAV-11 | P2 | `app/(coach)/settings.tsx` | Same orphan pattern; the only reachable coach sign-out is buried at the bottom of the **Earnings** screen. | Link Settings from Overview; move sign-out there |
| NAV-12 | P2 | app-wide | Android hardware back is entirely unhandled — no `BackHandler` import exists. On a root tab, back exits instantly with no confirmation; the RPE form has no discard interception. | Double-tap-to-exit on root tabs; confirm-discard on the form |
| NAV-13 | P2 | `room.tsx:26,66` | Logic dead end: once `submitted` is true the RPE branch fails and the screen falls back to the **live video room UI** for a session just ended. | Add a terminal confirmation branch that navigates back |
| NAV-14 | P2 | `app.config.ts:12` | `_sitemap` ships in release builds as a root-level route outside both guards — `fitconnect:///_sitemap` enumerates the whole route tree while logged out. | `["expo-router", { sitemap: false }]` |
| NAV-15 | P2 | `components/app-intro-splash.tsx:25` | Unhandled promise: if `isReduceMotionEnabled()` rejects, `setVisible(false)` never runs → permanent opaque black overlay at `zIndex:9999` with no recovery. | `.catch(() => setVisible(false))` + an unconditional dismissal timer |
| NAV-16 | P2 | `app.config.ts` | No `android.package`, no intent filters, no associated domains — no App Links, and prebuild has no stable application id. `expo-linking` is a dependency but never imported. | Add package id + intent filters; drop or use `expo-linking` |
| NAV-17 | P3 | 3 guards | `admin` handled inconsistently: root and athlete guards only special-case `coach`, so an admin silently lands in and stays in the athlete UI. | One shared `resolveHomeRoute(role)` |
| NAV-18 | P3 | `app/(auth)/_layout.tsx:4` | No reverse guard: a signed-in user deep-linking `/signin` gets the login form. | `if (user) return <Redirect href="/" />` |
| NAV-19 | P3 | all layouts | No `unstable_settings.initialRouteName`; deep links produce a stack with no back anchor. | Export it from root and both tab layouts |
| NAV-20 | P3 | `app/_layout.tsx:9` | Docblock claims "Realtime via useMobileChannel bridge"; the hook is never imported. Dead code plus misleading comment. | Wire up or remove both |
| NAV-21 | P3 | `app-intro-splash.tsx:71` | The 3.2s opaque intro uses `pointerEvents="none"` — taps pass through to the invisible sign-in form beneath, hitting buttons and inputs blind. | `pointerEvents="auto"` while visible |

## 7. Design-system audit (28 findings) — compliance 29/100

**The structural finding:** `apps/mobile/lib/tokens.ts` re-exports `@fitconnect/config/tokens`, **not** the canonical `COLOR_TOKENS`. `@fitconnect/design-tokens` is not even a dependency of the app, while `docs/DESIGN_SYSTEM.md:12` designates `COLOR_TOKENS` as the mobile source of truth. The shim carries a leftover Tailwind slate/cyan ramp, so **73 of 146 colour references (50%) resolve to retired values** — the app is rigorously consistent with a palette that no longer exists.

| ID | Sev | File:Line | Issue | Fix |
|---|---|---|---|---|
| DS-01 | P0 | `lib/tokens.ts:1` | Points at the pre-rebrand config shim; 7 of 10 `ink.*` values are raw Tailwind slate with no EOS equivalent. `ink[50]` (every screen title) and `ink[900]` (every card background) both diverge. | Depend on `@fitconnect/design-tokens`; rebuild as an EOS-derived RN palette; deprecate `ink.*` |
| DS-02 | P0 | all 17 screens | `react-native-safe-area-context` is installed but **imported zero times**. No provider, no insets. With `headerShown:false` everywhere, all content renders at y=0 under the notch and gesture bar. | `SafeAreaProvider` + an `EliteScreen` wrapper applying insets |
| DS-03 | P0 | `lib/layout.ts:4-5` | Bottom inset is guessed with a hardcoded per-platform constant instead of real insets — wrong on Android gesture nav. | Derive from `useSafeAreaInsets().bottom` |
| DS-04 | P1 | `assets/**` | **No brand fonts exist.** Zero matches for `expo-font`, `useFonts`, or `fontFamily`; no font files bundled. Syne / Plus Jakarta Sans / JetBrains Mono never reach the device. | Add `expo-font`, bundle the 3 families, load with a gated splash |
| DS-05 | P1 | 62 text styles | No type scale: 15 distinct inline `fontSize` values; screen titles vary 22/24/28/32 across screens. | Define a `TYPE_SCALE` with paired line heights |
| DS-06 | P1 | `ui/badge.tsx:23,27`, `coach-card.tsx:53,57` | **Visible bug:** cyan-400 background behind volt-lime text — two unrelated hues in one component. | `voltlineDim` fill, or telemetry fill + telemetry text |
| DS-07 | P1 | `ui/card.tsx:44-45` | **Visible bug:** the AI-nudge card is purple-500 bordered around iris/indigo text. | `irisGlow` + an iris-derived fill |
| DS-08 | P1 | 15 of 15 data screens | **1 of 15 has any loading/empty/error state.** `(athlete)/index.tsx:24` fakes refresh with `onRefresh={() => undefined}`; `(athlete)/coach.tsx:10` indexes `DEMO_COACHES[0]` unguarded. | Shared `<ScreenState>`; wire real refresh |
| DS-09 | P1 | `room.tsx:18-23` | Failures swallowed, then `setSubmitted(true)` unconditionally — the user is told feedback saved when it was not. | Track `idle/pending/error/done`; surface retry |
| DS-10 | P1 | ~97 strings / 19 files | i18n coverage ≈ **17%** (20 keys), 2 locales vs web's 6. Worst: `coach-finder-quiz.tsx` (26 strings), `room.tsx` (11). | Extend the dict; lint against bare JSX text |
| DS-11 | P1 | `packages/utils/src/readiness.ts:105-110` | `readinessGreeting()` returns hardcoded English **and always says "Good morning"** regardless of time — rendered as the athlete home hero. | Return semantic keys; resolve in the UI layer |
| DS-12 | P2 | 17 literals, 8 files | Hardcoded colours; 8 of 17 have an exact token today, 9 need new `outline` / `glassFill` / `alertDim` tokens. | Add `no-color-literals` lint + the 3 tokens |
| DS-13 | P2 | `nivis-tab-bar.tsx:90` | The entire nav dock is 40px tall — below the 44px minimum. | Raise to 44, or `hitSlop` |
| DS-14/24 | P2/P3 | `signup.tsx:88`, `coach-finder-quiz.tsx:80` | Two more targets at ~37px and ~41px. | `minHeight: 44` |
| DS-15 | P2 | 7 `TextInput`s | No `accessibilityLabel` — placeholder-only labelling disappears on focus, leaving fields unnamed to TalkBack. | Add labels |
| DS-16 | P2 | all 17 titles | No `accessibilityRole="header"` anywhere — no heading navigation for screen-reader users. | Add the role |
| DS-17 | P2 | `recovery-ring.tsx:41-69` | The primary data visualisation has no `progressbar` role or `accessibilityValue`. | Add role + value + one combined label |
| DS-18 | P2 | `offline-banner.tsx:8` | `accessibilityRole="text"` on a dynamic banner — never announced. | `accessibilityLiveRegion="polite"` + `role="alert"` |
| DS-19 | P2 | 26 declarations | `fontWeight: "800"` with no font loaded; Roboto has no 800 weight, so the brand display weight never renders. | Ships with DS-04 |
| DS-20 | P2 | `app.config.ts` | No `splash`, `icon`, `backgroundColor` — white flash on cold start before the dark app mounts. | Add dark splash + `backgroundColor: "#070b14"` |
| DS-21 | P2 | `packages/config/src/tokens.ts:29-37` | The shared shim itself hardcodes 7 slate hexes existing in no EOS token — the root cause of DS-01. | Re-derive from `COLOR_TOKENS` |
| DS-22/23/25 | P3 | various | 5 radius magic numbers; `tokens.spacing` and `tokens.typography` have **zero usages** (4 values break the 4px grid); only 8 `lineHeight` declarations across 62 text styles. | RN spacing scale; route radii through tokens |
| DS-26/27/28 | P3 | various | Emoji read aloud mid-sentence; progress bar unannotated; no `hitSlop` anywhere. | Icons marked decorative; annotate; add hit slop |

**Credit where due:** `allowFontScaling={false}` appears **zero** times (Dynamic Type is never blocked), `AppIntroSplash` honours reduce-motion, and the tab bar has proper `accessibilityRole`/`Label`/`State`.

**Highest-payoff sequence** (if the app were ever unfrozen): DS-01 + DS-21 move ~50% of the app onto canonical colour in a two-file change without touching a screen; then DS-02 + DS-03 (safe areas, 100% of screens); then DS-04 + DS-05. Those six take the DS estimate from 29 to roughly 65.

## 4. What could not be verified (and why)

Phases 3 (visual/overflow/responsive), 5 (button audit), 7–9 (athlete/coach/map journeys), 11–17 (telemetry, realtime, offline, performance, Android versions, Wear, TalkBack), 19 (crash/stress) all require the app running on a device or emulator. **The emulator is blocked on BIOS virtualization; no physical device is connected.** Any score for these would be fabrication.

**To unblock:** enable SVM Mode in BIOS/UEFI, or connect an Android phone over USB with debugging enabled — the AVD, SDK, and adb are all ready.

## 5. Action plan

The honest recommendation is not a fix list for this app. Every P0 here is a "build the thing" item, and M-04 (Wear OS) cannot be fixed in this stack at any effort. Reaching genuine production quality on `apps/mobile` means rebuilding the data layer, auth, map, and telemetry inside a framework the v1 scope has already rejected — roughly 25–35 engineer-days that would be discarded when the native app lands.

Two coherent paths, in preference order:

**A. Stay the course (recommended).** Leave `apps/mobile` frozen. Fix only M-08 and M-09 (30 minutes, removes a red test and un-darkens two test files) and let this report stand as the documented state of the legacy app. Android quality effort goes into `android/` on the F1→F4 path.

**B. Unfreeze for an interim release.** Revised after the deep audits: the minimum list is now M-19 (make it launch at all), M-01, M-02, M-03, M-05, M-06, M-07, M-10, M-14, M-15 plus NAV-01/02/04/08 and DS-01/02/03/04 — **~20–25 days**, and the result would still be a mock-data app with no map, no health data, and no watch.

**Owner decision (2026-08-07): Path A.** `apps/mobile` stays frozen. Only M-08 and M-09 were fixed (red test, dark test files); mobile is now 5/5 passing. This report is the documented final state of the legacy app.

This is a product decision, not an engineering one, and it is escalated rather than assumed.
