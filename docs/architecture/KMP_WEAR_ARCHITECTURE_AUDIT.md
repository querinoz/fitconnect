# KMP / Wear OS / Real-time Telemetry — Architecture Audit

**Date:** 2026-08-17  
**Branch:** `chore/android-phase-13r-recovery` @ `3d7dbfa`  
**Git status at audit start:** clean (no uncommitted human work)  
**Auditor:** Cursor agent (repository inspection only — no code changes in this phase)

```
PHASE A — AUDIT
STATUS: COMPLETE (this document)
CODE CHANGES IN THIS PHASE: NONE
```

This audit is evidence-based. Classifications use only:

`REAL` · `LOCAL_DEMO` · `SIMULATED` · `SCAFFOLD` · `UNBOUND` · `NO-OP` · `PARTIAL` · `UNSUPPORTED` · `PENDING_HUMAN` · `NOT_PRESENT`

---

## 0. Executive verdict

FitConnect already has a **production-shaped Android multi-module app** (`android/`) with Elite Surface UI, a serious **Kotlin telemetry domain** (`:telemetry`), a **Wear OS application module** (`:wear`), and a **Rust elite-core** for physiology metrics.

It does **not** yet have:

| Capability | Current |
|---|---|
| Kotlin Multiplatform | **NOT_PRESENT** — zero `multiplatform` plugins, zero `expect`/`actual` |
| Wear Health Services | **NOT_PRESENT** — no `androidx.health.services` |
| Health Connect client | **SIMULATED** — class exists, `androidx.health.connect` is not a Gradle dependency |
| Phone ↔ watch DataLayer | **UNBOUND** — `play-services-wearable` listed on `:wear` only; `DataClient`/`MessageClient` never called |
| Live sensor HR/GPS | **LOCAL_DEMO** — `LiveActivityEngine` sine-wave + simulated distance |
| Xiaomi HyperOS | **UNSUPPORTED** — docs only, no adapter |
| iOS / watchOS | **NOT_IMPLEMENTED** — ADR-005/006 architectural only |
| elite-core on Android | **NOT_WIRED** — JNI crate is `version()` stub; no `.so`, no UniFFI |

**Android phone app remains the reference implementation and must stay that way.**

---

## 1. Product identity (must preserve)

| Token / rule | Source | Action |
|---|---|---|
| Voltline `#C8FF00` | `packages/design-tokens`, `android/design` | Do not change |
| Floor / Obsidian | Elite Surface `--eos-floor` / Compose tokens | Do not change |
| Connect `#00DDB4`, telemetry cyan, iris | same | Do not change |
| Syne / Plus Jakarta Sans / JetBrains Mono | design system | Do not change |
| Compose-first phone UI | `:app` `:athlete` `:coach` `:design-ui` | Do not migrate to CMP |
| Expo `apps/mobile` | frozen Path A | Do not revive as product |

---

## 2. Repository map

```
fitconnect/
├── android/                 AUTHORITATIVE mobile + Wear (Kotlin/Compose)
│   ├── app/                 phone host (nav, FCM, auth UI)
│   ├── wear/                Wear OS application (LOCAL_DEMO shell)
│   ├── core-capture/        LiveActivityEngine LOCAL_DEMO
│   ├── design/              kotlin-jvm Elite Surface tokens (no Android APIs)
│   ├── design-ui/           Compose components
│   ├── foundation/          auth, network, realtime ports, offline queue
│   ├── telemetry/           domain + providers + DeviceCenter + sync
│   ├── sports/              metrics/readiness (Kotlin, not elite-core)
│   ├── geo/ athlete/ coach/ community/ ai/
│   └── gradle/libs.versions.toml
├── elite-core/              Rust metrics (NP/TSS/zones/physiology) — bindings stub
├── apps/web/                Next.js production web + LOCAL_DEMO live-telemetry
├── apps/mobile/             Expo FROZEN
├── packages/                types, utils, realtime-client, strava-integration, design-tokens
├── prisma/                  Session, BiometricSample, WearableConnection, StravaActivity
└── docs/                    phase-00…17 + ADRs (no docs/architecture/ before this file)
```

`settings.gradle.kts` includes:

`:app` `:wear` `:core-capture` `:design` `:design-ui` `:foundation` `:sports` `:geo` `:telemetry` `:community` `:ai` `:athlete` `:coach`

---

## 3. Answers A–O

| # | Question | Answer |
|---|---|---|
| A | Android-only | All Compose UI, manifests, FCM, EncryptedSharedPreferences, DataStore, OkHttp app wiring, Wear Compose, permissions |
| B | Already shared | `packages/design-tokens` (web + generated Kotlin); `packages/types` + `@fitconnect/utils` (web/Expo only); elite-core formulas (Rust, unused by Android) |
| C | Safe KMP candidates | Telemetry domain models, units, provenance, session state machine, outbox/dedup, Wear path schema, Realtime **event types** (not the Android WS client) |
| D | Must stay Android-specific | Jetpack Compose, Wear Compose, Health Connect, Health Services, Data Layer, BLE, FCM, foreground services, Activity lifecycle |
| E | Dead code | Expo app frozen; `EliteCapture` object is a placeholder; Wear `play-services-wearable` unused |
| F | Duplicated | Readiness: Android `PerformanceEngine` vs `@fitconnect/utils` vs elite-core physiology; live HR: web `live-telemetry.ts` vs `LiveActivityEngine` vs simulated providers |
| G | Fake / demo-only | All telemetry **providers** (`BaseSimulatedProvider`); Wear HR; Device Center “LIVE” when simulated connected; web map athlete |
| H | Production-capable | Phone Compose app structure; Supabase auth/realtime **code paths** when secrets exist; Strava on **web**; telemetry **contracts**; sync/dedup **algorithms** (unit-tested, in-memory store) |
| I | Scaffolding | `:wear` (compiles, LOCAL_DEMO); elite-core jni/wasm/napi `version()`; `UnboundDataLayerWearSessionLink` |
| J | Incorrect coupling | `:wear` depends on `:core-capture` (Android library) so watch cannot share JVM-pure engine without pulling Android; `RealtimeClient.subscribe` is `Flow<String>` untyped |
| K | Telemetry owner | `:telemetry` (canonical) + `:core-capture` (live activity LOCAL_DEMO) + web `lib/demo/live-telemetry.ts` (landing only) |
| L | Realtime owner | Android: `foundation/network/Realtime.kt` → Supabase / InProcess / FailClosed. Web: BroadcastChannel default, Convex/Supabase **PARTIAL** |
| M | Persistence | Android telemetry: `InMemoryTelemetryStore` (Room-shaped API, no Room). Session/auth: DataStore + EncryptedSharedPreferences. Cloud: Prisma on web |
| N | Authentication | `SupabaseAuthRepository` when URL+anon; else `LocalAuthRepository` / demo personas |
| O | Watch communication | Ports only: `NoWearCompanion`, `NoWearWorkoutControl`, `InMemoryWearSessionLink` (tests), `UnboundDataLayerWearSessionLink` (fail-closed) |

---

## 4. Module-by-module (Android)

| Module | Plugin | Classification | Notes |
|---|---|---|---|
| `:app` | android.application | REAL shell + LOCAL_DEMO data | `applicationId com.fitconnect.android`, minSdk 26, version `0.1.0-rc.1` / 13. `google-services.json` **absent** → FCM not configured |
| `:wear` | android.application | SCAFFOLD + LOCAL_DEMO | minSdk 30, standalone true, `WearMainActivity` + `LiveActivityEngine`. Material Wear theme — **not** Elite Surface tokens |
| `:core-capture` | android.library | LOCAL_DEMO | Explicit kdoc: no FusedLocation, no BLE. `SOURCE_LABEL = "LOCAL_DEMO"` |
| `:design` | **kotlin-jvm** | REAL shared tokens | Only JVM-pure module today — template for KMP-ready extraction |
| `:design-ui` | android.library | REAL | Elite Compose components — keep Android-only |
| `:foundation` | android.library | PARTIAL | Real OkHttp/DataStore/crypto; realtime/auth live only with secrets |
| `:telemetry` | android.library | REAL contracts + SIMULATED providers | Domain/units/sync/dedup are solid Kotlin. Providers all wrap `SimulatedProviderSource` |
| `:sports` | android.library | REAL Kotlin domain | Readiness **not** elite-core |
| `:athlete` | android.library | REAL UI | Telemetry Center + Activity screen consume demo engines |
| `:coach` | android.library | REAL UI | Roster still has some seed vitals (phase-08 debt) |
| `:geo` `:community` `:ai` | android.library | REAL feature engines | Out of Wear critical path |

---

## 5. Telemetry pipeline — as implemented vs target

**Target (prompt):**

```
WATCH SENSOR → Health Services → Wear adapter → shared model → watch buffer
  → Data Layer → mobile repo → local store → realtime → dashboard → backend
```

**Actual:**

```
SimulatedProviderSource ──► HealthConnectProvider (name only)
                         ► GarminProvider, Whoop, … (all simulated)
                         ► TelemetrySyncEngine (idempotent, in-memory)
                         ► InMemoryTelemetryStore
                         ► Athlete TelemetryScreen (Compose)

LiveActivityEngine (sine HR) ──► ActivityScreen (phone)
                              ──► WearHome (watch)
                              ── X  no DataLayer, two isolated engines
```

| Stage | Status |
|---|---|
| Watch sensor | LOCAL_DEMO (`engine.tick()`) |
| Health Services | NOT_PRESENT |
| Wear adapter | Ports exist; `NoWearCompanion` |
| Shared model | Kotlin in `:telemetry` (Android library, not KMP) |
| Watch buffer | `InMemoryWearSessionLink` queue (tests only) |
| Data Layer | UNBOUND |
| Mobile store | In-memory, not Room |
| Realtime | Untyped string topics; live only with Supabase |
| Backend persistence | Prisma `BiometricSample` unused by Android |

Provenance **is** correctly modeled (`Provenance` + units + quality). That must be kept.

Dedup **is** real algorithm (`DeduplicationEngine`, 70% overlap, provider priority). Keep.

`TelemetrySample.value: Double` + separate `unit` is acceptable (canonical unit per `CanonicalUnits`). Prompt’s `HeartRate(bpm, timestamp)` should be a **typed view**, not a rewrite that throws away MetricType taxonomy.

---

## 6. Wear OS

| Item | Evidence |
|---|---|
| Module compiles | Documented assembleDebug PASS (`docs/android/ANDROID_WEAR_STATUS.md`) |
| UI | Default Wear `MaterialTheme` — identity gap vs Elite OS |
| Session UX | START / PAUSE / RESUME / END — right actions, simulated metrics |
| Phases | IDLE / RUNNING / PAUSED / ENDED — missing PREPARING / FAILED from prompt (map in shared SM) |
| Pairing | `WearCompanionState.NOT_PAIRED` always |
| Battery / capabilities | Not shown |
| Tests | **No** `:wear` unit tests; `WearSessionLinkTest` lives in `:telemetry` |
| Device test | PENDING_HUMAN |

---

## 7. Health Connect

| Claim | Evidence |
|---|---|
| First-class adapter class | `HealthConnectProvider` |
| Gradle `androidx.health.connect` | **Missing** from `libs.versions.toml` and all `build.gradle.kts` |
| Runtime | `BaseSimulatedProvider` |
| Permissions / `<queries>` | Not in manifests for HC |
| Report | `docs/phase-08/HealthConnect_Report.md` — architecture-complete, simulated |

**Authoritative source order (already in DeduplicationEngine, workouts):**  
Garmin > Polar > Whoop > Health Connect > Samsung > Fitbit > Strava > Oura > Manual  

**Live exercise HR (not yet implemented — target):**  
Wear Health Services during ACTIVE session > phone sensors > Health Connect historical > simulated LOCAL_DEMO.

---

## 8. Realtime

### Android (`RealtimeClient`)

```kotlin
fun subscribe(topic: String): Flow<String>
suspend fun publish(topic: String, payload: String)
```

| Impl | When | Class |
|---|---|---|
| `SupabaseRealtimeClient` | `config.usesLiveAuth` | PARTIAL (string payloads, no telemetry schema) |
| `InProcessRealtimeClient` | debug | LOCAL_DEMO |
| `FailClosedRealtimeClient` | release without secrets | NO-OP fail-closed |

### Web

| Surface | Class |
|---|---|
| `lib/demo/live-telemetry.ts` | LOCAL_DEMO (hydration-safe seed) |
| BroadcastChannel | LOCAL_DEMO **default** |
| Convex | PARTIAL (poll + fallback) |
| Supabase transport | PARTIAL |

**Same event model is not shared** across Android / Wear / Web today.

---

## 9. elite-core (Rust) vs KMP (Kotlin)

**ADR-006 (Proposed)** chose **Rust** for FIT/metrics/physiology and **explicitly rejected KMP** for that core (Wasm weakness; iOS out of v1).

**This prompt** asks for KMP for domain/models/contracts/sync.

These are **not the same layer**. Honest split:

| Layer | Owner | KMP? |
|---|---|---|
| NP, IF, TSS, GAP, CTL/ATL/TSB, rMSSD | `elite-core` Rust | **No** — do not reimplement in KMP |
| Telemetry envelopes, session SM, outbox, Wear paths | Kotlin | **Yes (shared JVM/KMP)** |
| UI | Compose / Wear Compose | **No** |

**IOS_TARGET_STATUS = ARCHITECTURALLY_READY / NOT_IMPLEMENTED**  
Future iOS = SwiftUI + UniFFI (ADR-005), not Compose Multiplatform.

**KMP plugin risk:** AGP 9.3.1 uses **built-in Kotlin**; `libs.versions.toml` warns the standalone `kotlin-android` plugin **conflicts**. Adding `org.jetbrains.kotlin.multiplatform` can destabilize `:app`.  

**Phase B decision (gate):** introduce a **kotlin-jvm `:shared` module** (same proven pattern as `:design`) with zero Android APIs. Promote to full KMP (`android()` + `jvm()`, **no ios()**) only if a isolated Gradle probe passes. Do **not** add `ios()` target in this cycle.

---

## 10. Auth / security / secrets

| Item | Status |
|---|---|
| Service role on device | Not found in android source (good) |
| Release signing | `keystore.properties` required — PENDING_HUMAN |
| FCM | Code in `:app`; inactive without `google-services.json` |
| Telemetry auth fields | Sample has `athleteId`; no `sequenceNumber` / `schemaVersion` on live packets yet |
| Play Console | LOCKED |

---

## 11. Tests (measured)

| Suite | Count | Notes |
|---|---|---|
| Android `*Test.kt` | 34 files / ~154 `@Test` | No `androidTest` instrumentation found |
| `:wear` tests | 0 | Gap |
| `:telemetry` | Engine, stress, WearSessionLink | In-memory only |
| `:core-capture` | LiveActivityEngineTest | LOCAL_DEMO engine |
| elite-core | 63 lib tests | Not on Android CI path |
| Web Vitest | 260 (measured in prior session) | Out of Android gate |

Emulator sensor: **EMULATOR_SENSOR_LIMITATION** expected — fixtures must be labeled `TEST_FIXTURE` / `LOCAL_DEMO`.

---

## 12. Xiaomi

| SKU | Status |
|---|---|
| Xiaomi watch that **is** Wear OS | Same `:wear` module — **untested** |
| HyperOS / proprietary | **UNSUPPORTED** / `BLOCKED_EXTERNAL_DEPENDENCY` — no official SDK in repo; **do not fake** `XiaomiAdapter` |

Interface-only `WearablePlatformAdapter` is allowed later. No fake implementation.

---

## 13. Migration matrix

| Component | Current | Android-only | KMP / shared-JVM candidate | Wear-specific | Future iOS |
|---|---|---|---|---|---|
| Elite Surface tokens | `:design` jvm + Compose UI | UI yes | tokens already JVM | Wear must consume tokens | Swift tokens from same dictionary |
| Domain athlete/coach/session (product) | Kotlin in feature modules | mixed | **partial** (IDs, session SM) | session controls | UniFFI or Kotlin/Native later |
| Readiness math | `PerformanceEngine` Kotlin | yes today | **No duplicate** — bind elite-core | display only | UniFFI |
| Telemetry models | `:telemetry.domain` | library is Android | **YES** extract | consume | consume |
| Units / provenance | Kotlin | no Android APIs | **YES** | consume | consume |
| Provider adapters | Simulated + ports | **YES** | interfaces only | Wear HS adapter | HealthKit adapter later |
| Health Connect | Simulated class | **YES** | no | no | n/a |
| Health Services | missing | **YES** | no | **YES** | n/a |
| LiveActivityEngine | Android + Time | mostly pure | **YES** (clock injected) | uses it | rewrite WatchKit |
| Wear DataLayer | UNBOUND | **YES** | protocol/schema **YES** | MessageClient | WatchConnectivity |
| Device Center | Kotlin + Compose | UI yes | DeviceEntry **YES** | status surface | companion UI |
| Realtime transport | OkHttp/WS Android | **YES** | event DTOs **YES** | may publish | own transport |
| Realtime payloads | `String` | accidental | **YES** versioned JSON | same | same |
| Persistence | InMemory / DataStore | DataStore yes | store **interface** | watch buffer | Core Data later |
| Auth | Supabase Android | **YES** | session DTO maybe | no login UX on watch | AppAuth later |
| FCM | `:app` | **YES** | no | no | APNs later |
| Maps | `:geo` | **YES** | no | glance only | later |
| Strava | Simulated on Android; REAL on web | Android adapter | contracts | no | later |
| elite-core | Rust stubs | JNI later | **not KMP** | same `.so` | UniFFI |
| Expo | frozen | n/a | n/a | n/a | n/a |
| Web live demo | TS LOCAL_DEMO | n/a | shared schema JSON | n/a | n/a |

---

## 14. Dead / obsolete / do-not-delete

| Item | Verdict |
|---|---|
| `apps/mobile` Expo | Keep frozen — do not delete this cycle |
| `NoWearCompanion` | Keep as fail-closed default until DataLayer nodes exist |
| Simulated providers | Keep labeled LOCAL_DEMO until vendor SDKs exist |
| `EliteCapture` placeholder | Replace with real capture **or** keep kdoc; not unused |
| Wear unused GMS dependency | **Wire it** or remove — unused dep is debt, not deletion without replacement |

---

## 15. Coupling problems to fix (without rewrite)

1. **Two live engines, no bus** — phone ActivityScreen and WearHome each `remember { LiveActivityEngine() }`.
2. **Untyped realtime** — cannot share events with web.
3. **Watch UI off-brand** — Material default vs Elite Surface.
4. **`:wear` → `:core-capture` Android library** — blocks sharing engine with a JVM test without Robolectric.
5. **In-memory store** — process death loses telemetry (offline-first incomplete).
6. **Device Center lists Garmin/Whoop as connectable** — they are simulated; UX must keep `LOCAL_DEMO` / `DemoPersona.MODE_LABEL` (already on Telemetry Center subtitle).

---

## 16. Target module shape (adapted to this repo — no explosion)

```
android/
  shared/          NEW kotlin-jvm (KMP-ready). Domain + session + envelope + outbox.
  telemetry/       Android adapters, HC, DeviceCenter, store
  core-capture/    Android capture service (later); engine logic moves to :shared
  wear/            Wear Compose UI + Health Services + DataLayer
  app/             Phone UI + DataLayer client + Device Center
  design + design-ui  unchanged
  foundation       Android realtime/auth
elite-core/        unchanged owner of physiology (bind later, not this phase’s P0)
```

Do **not** create `androidApp`/`wearApp`/`future-ios` top-level folders. The repo already uses `android/app` and `android/wear`.

---

## 17. Phase gate — Phase A acceptance

| Criterion | Result |
|---|---|
| Full repo inspected | PASS |
| Migration matrix written | PASS |
| LOCAL_DEMO vs REAL classified | PASS |
| ADR-006 vs KMP prompt reconciled | PASS (split layers) |
| iOS not implemented | PASS (documented) |
| Xiaomi not faked | PASS |
| Code unchanged this phase | PASS |

**PHASE A = PASS.** Next: Phase B (`:shared` foundation) without breaking `:app` assemble/test.

---

## 18. Human / blocked (preview)

| Item | Status |
|---|---|
| Physical Wear device pairing | PENDING_HUMAN |
| `google-services.json` / FCM | PENDING_HUMAN |
| Supabase production secrets | PENDING_HUMAN |
| Release keystore | PENDING_HUMAN |
| Play Console | LOCKED |
| Xiaomi proprietary SDK | BLOCKED_EXTERNAL_DEPENDENCY |
| Emulator HR optical sensor | EMULATOR_SENSOR_LIMITATION |
| elite-core UniFFI + NDK | PENDING (toolchain / not wired) |
| iOS target | NOT_IMPLEMENTED |

---

## 19. Sources (primary)

- `android/settings.gradle.kts`, `android/gradle/libs.versions.toml`
- `android/wear/src/main/java/.../WearMainActivity.kt`
- `android/telemetry/**` (domain, providers, DeviceCenter, WearPorts, WearSessionLink, SyncEngine, Deduplication)
- `android/core-capture/.../LiveActivityEngine.kt`
- `android/foundation/network/Realtime.kt`, `AppContainer.kt`
- `docs/android/ANDROID_WEAR_STATUS.md`
- `docs/phase-08/HealthConnect_Report.md`
- `docs/phase-13r/ANDROID_ARCHITECTURE_FINAL.md`
- `docs/phase-17/WEARABLE_SUPPORT_MATRIX.md`
- `docs/adr/ADR-005-expo-to-native-android.md`, `docs/adr/ADR-006-elite-core-rust.md`
- `elite-core/core/src/lib.rs`, `elite-core/jni/src/lib.rs`
