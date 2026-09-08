# FitConnect — Full Mobile QA Release Gate

**Date:** 2026-09-07  
**Branch:** `feat/elite-os-v2`  
**Git commit (baseline):** `251c62a` (+ uncommitted QA fixes from this gate — see § Fixes)  
**Primary surface:** Native Android Compose (`android/`) — **production mobile**  
**Expo `apps/mobile`:** Frozen Path A (ADR-005) — **FUTURE_SCOPE** for parity; not the release gate surface  
**Design System:** **FROZEN** — no visual/branding changes  
**Playwright Elite-OS visual/landing `@elite-os`:** **OUT_OF_SCOPE_VISUAL_BASELINE** — not treated as Wave 3 / mobile functional failure; baselines not updated  

---

## Executive Summary

```text
OVERALL STATUS: RELEASE READY WITH EXTERNAL BLOCKERS

P0 code-owned: 0 (after gate fixes)
P1 code-owned: 0 (after gate fixes)
P2 code-owned: 0 open required; residual low-priority deep-link surface gaps documented as P3
P3: community/post deep links without shell classification; partial UI E2E scripting

Truth labels used throughout:
  VERIFIED | PARTIAL | BLOCKED_EXTERNAL | DEFERRED_DEVICE | FUTURE_SCOPE | FAIL | OUT_OF_SCOPE_VISUAL_BASELINE
```

**Verdict:** Emulator-proven Android APK launches, navigates, survives cold/warm/force-stop, and the Wave 3 functional contracts (DM, earnings honest zeros, LTHR zones, booking/message realtime publish, offline HTTP flush) hold. This gate closed remaining **code-owned** defects found in audit (outdoor Activity CTA, coach deep links, missing offline handlers, live Discover slot bypass, athlete booking offline enqueue). Full Firebase auth matrix, FCM LIVE, Stripe Connect LIVE, dual-device live Supabase realtime, Redmi/MIUI, and physical GPS remain **not VERIFIED**.

---

## Android device baseline

| Field | Value | Result |
|-------|-------|--------|
| Device | `emulator-5554` (`sdk_gphone16k_x86_64`) | VERIFIED |
| Android | 17 / API 37 | VERIFIED |
| Resolution | 1080×2400 | VERIFIED |
| Package | `com.fitconnect.android` | VERIFIED |
| versionName / versionCode | `0.1.0-rc.1` / `13` | VERIFIED |
| AVD profile | `fitconnect_phone` (default skill) | VERIFIED |
| Physical Redmi / MIUI | Not exercised | DEFERRED_DEVICE |
| Physical GPS | Not exercised | DEFERRED_DEVICE |

Commands:

```text
adb devices
adb shell getprop ro.build.version.release   → 17
adb shell getprop ro.build.version.sdk       → 37
adb shell getprop ro.product.model           → sdk_gphone16k_x86_64
adb shell wm size                            → Physical size: 1080x2400
```

---

## Fixes landed this gate (code-owned)

| ID | Severity | Issue | Fix | Evidence |
|----|----------|-------|-----|----------|
| NAV-ACT | P1 | Home outdoor CTA navigated to `WORKOUT` instead of `ACTIVITY` | `AthleteNav.kt` → `AthleteDest.ACTIVITY` | Code + assembleDebug |
| DL-COACH | P1 | `coach/*` deep links classified `Unknown` and cleared | `DeepLinkTarget.CoachNested` + NavHost + `CoachOsApp` inbox consumer | DeepLinkClassifyTest 8/8 PASS |
| OFF-FAV / OFF-INBOX | P1 | `coach.athlete.favorite` / `coach.inbox.read` enqueued with no flush handler | Handlers in `CoachOfflineHandlers` | Code review + register path |
| BOOK-OFF | P1 | Live `createBooking` had no offline queue | `athlete.booking.create` handler + `HttpAthleteRepository` enqueue | Code |
| BOOK-LIVE-SLOT | P2 | Live Discover forced `isOpen=true` / skipped conflicts | Always use geo availability + conflict check | `DiscoverScreen.kt` |
| COACH-DEP | — | Coach module missing `activity-compose` for `LocalActivity` | `coach/build.gradle.kts` | assembleDebug PASS |

---

## Global QA matrix

| Area | Feature | Expected | Test | Result | Evidence | Severity |
|------|---------|----------|------|--------|----------|----------|
| App launch | Cold / warm / force-stop reopen | MainActivity resumes | adb am start / force-stop | VERIFIED | topResumedActivity MainActivity; no FATAL | — |
| Auth | Unauth → guard; role Athlete/Coach | Shell NavGuard + role OS | Code audit + restoreSession path | PARTIAL | Firebase full matrix BLOCKED_EXTERNAL | P1 if live auth broken (not repro'd) |
| Onboarding | Role select when needed | `RoleSelectScreen` | Code | PARTIAL | Needs Firebase UID without role | — |
| Athlete | Home → Discover → Programs → Profile | Routes wired | Nav graph + launch | PARTIAL | Full UI journey not scripted end-to-end | — |
| Coach | Overview → Bookings → Revenue → Settings | Routes wired | Nav graph | PARTIAL | Same | — |
| Navigation | ≤4 athlete tabs; Train FAB | IA contract | AthleteDest.bottomTabs | VERIFIED | Code | — |
| Discover | Coaches / book / message | HTTP + offline queue | Wave3 API + code | PARTIAL | Emulator UI not fully scripted | — |
| Programs | Catalog / enroll / tasks | API + offline enroll | Wave2/3 closure | VERIFIED (contract) | 7/7 + 5/5 API tests | — |
| Bookings | Create / coach approve | REST + realtime topic | publish-booking + handlers | PARTIAL | Dual-role live BLOCKED_EXTERNAL | — |
| DM | Discover send | POST `/api/v1/messages` | wave3-api-closure | VERIFIED (API) | UI PARTIAL | — |
| Notifications | List / mark read | HTTP | Code | PARTIAL | FCM LIVE BLOCKED_EXTERNAL | — |
| Profile / Settings | Load / logout | Session clear | Code | PARTIAL | — | — |
| Telemetry | Readiness / HR / charts | Facades + Health Connect | Code + zones | PARTIAL | Emulator sensors limited | — |
| Readiness / HRV | Vitals + remote | HttpAthleteRepository | Code | PARTIAL | — | — |
| HR zones | LTHR 5-zone | HeartRateZones | Unit 4/4 | VERIFIED | HeartRateZonesTest | — |
| Maps / GPS | Render + geo fix | Emulator `emu geo fix` | adb emu geo fix -9.1393 38.7223 → OK | VERIFIED (emulator) | Physical DEFERRED_DEVICE | — |
| Live activity | Session phases | LiveActivity state | Code | PARTIAL | — | — |
| Realtime | booking / message publish→hub | Topics match | Code + wave3 | PARTIAL | Live multi-device BLOCKED_EXTERNAL | — |
| Offline | Queue + HTTP flush | Handlers registered | Code | PARTIAL | Airplane broadcast SecurityException on emu | — |
| Permissions | Location / notif / cam / mic | Manifest + gateway | Manifest audit | PARTIAL | Deny/recovery not fully scripted | — |
| Deep links | athlete/* + coach/* | Classify + handle | Unit + adb VIEW | VERIFIED (classify); PARTIAL (UI assert) | DeepLinkClassifyTest | — |
| Error recovery | 401/5xx/offline | Fail-closed APIs | Wave3 status fail-closed | PARTIAL | Not every status forced on device | — |
| Lifecycle | MMKV/Zustand/session | Persist across force-stop | Force-stop reopen | PARTIAL | Auth persistence needs signed-in Firebase | — |
| Security | No demo bypass prod; UID canonical | SessionAthleteId + guards | Code | VERIFIED (engineering) | Prod demo flag ops BLOCKED_EXTERNAL | — |
| Performance | No ANR/FATAL | logcat sample | adb logcat | VERIFIED (sample) | No FATAL/ANR for package | — |
| Visual functional | Clip/overflow/touch | Manual smoke | Launch only | PARTIAL | No redesign | — |
| Expo mobile | apps/mobile parity | N/A | — | FUTURE_SCOPE | ADR-005 frozen | — |
| Playwright Elite-OS | Visual baseline | CI red | — | OUT_OF_SCOPE_VISUAL_BASELINE | Do not snapshot-update | — |

---

## Athlete

| Feature | Result | Evidence |
|---------|--------|----------|
| Launch → shell | VERIFIED | MainActivity resumed |
| Auth / role | PARTIAL | Code path; Firebase matrix BLOCKED_EXTERNAL |
| Home CTAs | VERIFIED (code) | Outdoor → ACTIVITY fixed |
| Discover / book / DM | PARTIAL | API VERIFIED; UI PARTIAL |
| Programs / tasks | VERIFIED (contract) | Offline enroll handler |
| Body metrics | PARTIAL | Wave 2 carry-forward |
| Notifications | PARTIAL | List API; FCM LIVE blocked |
| Live / outdoor / map | PARTIAL | Deep link athlete/activity delivered; GPS emu OK |
| Telemetry / readiness / HRV | PARTIAL | Facades wired |
| HR zones LTHR | VERIFIED | 4/4 unit tests |
| Profile / settings / logout | PARTIAL | Code |
| Offline booking / message | VERIFIED (code) | enqueue + flush handlers |

---

## Coach

| Feature | Result | Evidence |
|---------|--------|----------|
| Launch → Coach OS | PARTIAL | Role-gated LoggedHome |
| Overview / roster | PARTIAL | HttpCoachRepository |
| Programs publish/draft/clone | VERIFIED (offline handlers) | CoachOfflineHandlers |
| Bookings approve/reject | VERIFIED (contract) | Handlers + realtime topic |
| Favorites offline flush | VERIFIED (code) | Handler added this gate |
| Inbox mark-read offline | VERIFIED (code) | Handler added this gate |
| Earnings ledger | VERIFIED (honest zeros) | `/api/v1/coaches/earnings`; Stripe LIVE BLOCKED_EXTERNAL |
| Deep links coach/* | VERIFIED (classify + consumer) | CoachNested + CoachOsApp |
| Settings / logout | PARTIAL | Code |

---

## Cross-role

| Flow | Result | Evidence |
|------|--------|----------|
| Athlete books → coach booking topic | PARTIAL | publish-booking + ProductRealtimeHub; dual-device live BLOCKED_EXTERNAL |
| Athlete DM → message topic | PARTIAL | publish-message; receiver UI PARTIAL |
| Athlete ↔ Coach identity | VERIFIED (engineering) | Firebase UID canonical; no email-as-ID in live path |

---

## Realtime

| Event | Sender | Receiver | Result |
|-------|--------|----------|--------|
| booking | Web bookings APIs | ProductRealtimeHub / Coach BookingsScreen | PARTIAL (engineering VERIFIED; live dual-device BLOCKED_EXTERNAL) |
| message | Web messages API | Hub subscribers | PARTIAL |
| session / activity topics | — | Subscribed, no web publisher | FUTURE_SCOPE |
| Supabase WS multi-device | External keys | Fail-closed without keys | BLOCKED_EXTERNAL |

---

## Offline

| Scenario | Result | Evidence |
|----------|--------|----------|
| A launch offline | PARTIAL | Airplane broadcast denied on API 37 emu; force-stop+reopen VERIFIED online |
| B go offline after launch | PARTIAL | Connectivity flow exists; not fully automated |
| C mutation offline | VERIFIED (code) | enqueue paths for message/booking/programs/coach ops |
| D kill with pending queue | PARTIAL | Queue persistence engineering; not kill-proven this run |
| E reopen offline | PARTIAL | — |
| F restore network → flush | VERIFIED (handlers) | AthleteOfflineHandlers / CoachOfflineHandlers HTTP |
| G server rejects queued | VERIFIED (code) | Err returned; 409 enroll/booking treated Ok where applicable |
| H retry after rejection | PARTIAL | Coordinator retry semantics; not device-proven |

---

## Android

| Test | Emulator | Physical | Result |
|------|----------|----------|--------|
| assembleDebug | PASS | — | VERIFIED |
| install -r | Success | — | VERIFIED |
| Cold launch | PASS | DEFERRED_DEVICE | VERIFIED |
| Warm / bring-to-front | PASS | DEFERRED_DEVICE | VERIFIED |
| Force-stop reopen | PASS | DEFERRED_DEVICE | VERIFIED |
| Deep link athlete/activity | Intent delivered | — | PARTIAL (no Compose assert) |
| Deep link coach/bookings | Intent delivered | — | PARTIAL |
| `adb emu geo fix` | OK | N/A | VERIFIED |
| Physical GPS | — | — | DEFERRED_DEVICE |
| Redmi/MIUI | — | — | DEFERRED_DEVICE |
| Logcat FATAL/ANR (package) | None in sample | — | VERIFIED (sample) |

---

## Navigation

| Route | Auth | Role | Back | Deep Link | Result |
|-------|------|------|------|-----------|--------|
| Guest / Auth / Home shell | Guarded | — | — | fitconnect://app/{guest,auth,home} | VERIFIED (classify) |
| Athlete nested | Required | ATHLETE | Stack | athlete/* → AthleteNested | VERIFIED |
| Coach nested | Required | COACH | Stack | coach/* → CoachNested | VERIFIED (this gate) |
| Catalog | DEBUG only | — | — | catalog | VERIFIED |
| Unknown | Cleared → HOME/GUEST | — | — | nope | VERIFIED |
| community/post… | — | — | — | Unknown today | P3 / FUTURE_SCOPE |
| Expo Router tree | — | — | — | — | FUTURE_SCOPE (frozen) |

---

## Permissions

| Permission | Allow | Deny | Recovery | Result |
|------------|-------|------|----------|--------|
| LOCATION | Manifest + gateway | Not fully scripted | Gateway | PARTIAL |
| POST_NOTIFICATIONS | Declared | — | — | PARTIAL; FCM LIVE BLOCKED_EXTERNAL |
| CAMERA / MIC | Declared | — | Feature-time request | PARTIAL |
| Health Connect READ_* | Declared | — | — | PARTIAL |
| MEDIA / storage | Declared (API gates) | — | — | PARTIAL |

No permission path found that intentionally crashes on deny (code review).

---

## Errors

| Error | Expected | Actual | Result |
|-------|----------|--------|--------|
| Offline mutation | Queue / honest pending | Handlers + banner count | PARTIAL |
| Network fail booking/DM | Queue or Err | HttpAthleteRepository | VERIFIED (code) |
| Earnings empty | Honest zero + stripeLive false | Earnings API | VERIFIED |
| Integrations status Prisma fail | Fail-closed | Wave 3 route | VERIFIED (prior) |
| 401/403/429/500 forced matrix | Useful UI + recover | Not fully device-forced | PARTIAL |

---

## Security

| Control | Result |
|---------|--------|
| Auth guards on CoreRoute | VERIFIED |
| Role → AthleteOs / CoachOs | VERIFIED |
| Firebase UID canonical identity | VERIFIED (engineering) |
| LOCAL_DEMO gated separately | VERIFIED |
| No localAck fake sync | VERIFIED |
| Earnings not fabricated as LIVE | VERIFIED |
| Strava never social (architecture) | VERIFIED (policy; DB RLS prior) |
| Demo mode prod ops | BLOCKED_EXTERNAL (ops/env) |
| FCM production credentials | BLOCKED_EXTERNAL |
| Stripe Connect LIVE | BLOCKED_EXTERNAL |
| Tokens/secrets in logs | No secrets observed in logcat sample |

---

## Known External Blockers

```text
FCM production delivery / credentials
Stripe Connect LIVE (invoice/transfer fail-closed)
Firebase production auth matrix (all providers / expired session device proof)
Dual-device live Supabase realtime
```

## Deferred Device

```text
Redmi / MIUI install & OEM quirks
Physical GPS accuracy / background location
```

## Future / Out of scope

```text
Wear OS product completeness
Expo apps/mobile parity (ADR-005 frozen)
Playwright Elite-OS visual baseline refresh → OUT_OF_SCOPE_VISUAL_BASELINE
session/activity realtime publishers
Nested OS per-route permission gates
Community post deep-link classification
```

---

## Regression evidence (this gate)

| Check | Command / scope | Result |
|-------|-----------------|--------|
| Typecheck | `pnpm typecheck` | PASS (6/6 tasks) |
| Unit (web) | `pnpm --filter @fitconnect/web test` | PASS **500** passed / 10 skipped |
| Coverage | `pnpm --filter @fitconnect/web test:coverage` | PASS (exit 0) |
| Build | `pnpm --filter @fitconnect/web build` | PASS |
| Wave2 API | wave2-api-closure | **7/7** PASS |
| Wave3 API | wave3-api-closure | **5/5** PASS |
| Deep links | DeepLinkClassifyTest | **8/8** PASS |
| HR zones | HeartRateZonesTest | **4/4** PASS |
| Android APK | `:app:assembleDebug` | PASS |
| Emulator install/launch | adb install -r + am start | PASS |
| Playwright Elite-OS | CI visual | OUT_OF_SCOPE_VISUAL_BASELINE (do not greenwash) |

**Not verified this run:** full Integration·DB·Pact CI job re-run; physical device; Firebase signed-in dual-role UI script; FCM; Stripe LIVE.

---

## Definition of Done

```text
[x] Full mobile route audit completed (Android Compose)
[x] Athlete journey tested (PARTIAL UI + VERIFIED contracts)
[x] Coach journey tested (PARTIAL UI + VERIFIED contracts)
[x] Cross-role journey tested (PARTIAL — publish contracts; live dual-device blocked)
[x] Auth audited (engineering VERIFIED; live matrix BLOCKED_EXTERNAL)
[x] Navigation audited
[x] Deep links audited (+ coach fix)
[x] Permissions audited (PARTIAL)
[x] Map/GPS audited (emulator VERIFIED; physical DEFERRED)
[x] Telemetry audited (PARTIAL)
[x] HR zones audited (VERIFIED)
[x] Programs audited (contract VERIFIED)
[x] Bookings audited (contract VERIFIED + offline fix)
[x] DM audited (API VERIFIED)
[x] Notifications audited (PARTIAL; FCM blocked)
[x] Earnings audited (honest zeros VERIFIED)
[x] Offline audited (handlers VERIFIED; airplane matrix PARTIAL)
[x] Realtime audited (PARTIAL / BLOCKED_EXTERNAL live)
[x] Error recovery audited (PARTIAL)
[x] Lifecycle audited (cold/warm/force-stop VERIFIED)
[x] Security smoke audited
[x] Logcat audited (no FATAL sample)
[x] Visual functional defects audited (PARTIAL smoke)
[x] No fake PASS
[x] P0 resolved
[x] P1 resolved (this gate)
[x] Code-owned P2 resolved/documented
[x] Regression suite PASS (scoped above)
[x] Android assemble PASS
[x] Emulator PASS
[x] Report generated
```

---

## RELEASE DECISION

```text
RELEASE READY WITH EXTERNAL BLOCKERS
```

**Not** “100%”.  
**Not** blocked on code-owned P0/P1 after this gate’s fixes.  
Ship decision for production still requires human/ops clearance of FCM, Stripe LIVE, Firebase auth matrix, and device/OEM validation separately from this engineering gate.

---

*Generated by Full Mobile QA gate · 2026-09-07 · surface = android/ Compose*
