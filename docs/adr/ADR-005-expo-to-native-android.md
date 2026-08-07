# ADR-005 — Migrate mobile from Expo/React Native to native Android (Kotlin + Jetpack Compose)

**Date:** 2026-08-07
**Status:** Accepted (2026-08-07)
**Deciders:** Product owner + engineering

## Context

v1 scope (see `docs/BACKLOG-V2.md` contract) locks two platforms: Android (phone + Wear OS) and Web. iOS is out of scope but must not be structurally foreclosed.

Current state of `apps/mobile`: Expo 52 / RN 0.76, ~50 source files, demo screens over `mock-data.ts`, 2 unit tests, EN/PT locales only. No recording engine, no BLE, no real Health Connect integration, no offline sync beyond an MMKV cache. It is a UI preview, not a product foundation.

## Independent assessment (not just agreement)

### The honest case FOR keeping Expo

1. **Language surface.** The entire monorepo is TypeScript. Native migration means the team simultaneously maintains TS + Kotlin + Rust. For a small team this is the single biggest project risk — bigger than any framework trade-off.
2. **Rewrite is ahead regardless.** The demo screens carry no product logic; whichever stack we pick, the real features are all-new code. Expo's sunk cost is low, but so is its "cost to keep" for pure UI.
3. **iOS optionality.** RN keeps a future iOS build nearly free. Native Android + SwiftUI later means two UI codebases forever.

### The case FOR native (and why it wins)

The v1 feature lockdown is dominated by capabilities where RN is a liability, not a convenience:

| Requirement | In RN | Native |
|---|---|---|
| Foreground Service recording that survives process death and reboot | Custom Kotlin module + bridge anyway | First-class |
| BLE GATT (HR/Power/CSC/RSC), reconnection, sensor battery | Native module (react-native-ble-plx wraps the same APIs with added failure modes) | First-class |
| Health Connect read/write | Community wrapper, lags SDK | First-class |
| Doze/App Standby behaviour, battery exception UX | Must be debugged at the native layer regardless | Direct |
| Wear OS (standalone recording, Tiles, Data Layer) | **Effectively impossible** | Same language, shared Gradle project |
| Home-screen readiness widget (Glance) | Native module | First-class |

Once Elite Capture is a Kotlin service and metrics live in the Rust core, the RN layer would be reduced to rendering chrome around native code — paying bridge, upgrade, and Expo-config costs while delivering none of the cross-platform benefit that justifies them (iOS is out).

**The Wear OS line item alone decides it.** It is in the v1 lockdown and is not realistically deliverable from the Expo codebase.

### iOS escape hatch

All domain logic (FIT, metrics, physiology, sync, permission guard, workout FSM) lives in Elite Core (Rust) per ADR-006. A future iOS app is SwiftUI + UniFFI bindings over the same core — a new UI shell, not a platform rewrite. This satisfies the "don't close the door" constraint.

## Decision

**Migrate to native Android: Kotlin + Jetpack Compose (phone) and Compose for Wear OS (watch), in a new top-level `android/` Gradle project.**

- `apps/mobile` is **frozen** immediately: no new features, `README` banner marking it legacy, excluded from CI required checks. Archived (moved out of the workspace) only after F6 proves the native shell in the field.
- What is salvageable from `apps/mobile`: i18n key structure, readiness copy, screen inventory/navigation map, and the design intent of `recovery-ring`/`nivis-tab-bar`. The code itself is not carried over.

## One material caveat (flagged, not buried) — the kill switch

Approving this ADR implies committing Kotlin (and Rust, ADR-006) capacity, on the working model: engineering writes Kotlin/Rust, the owner reviews and decides. The owner has accepted, explicitly, that Rust code review will initially be slower and less expert than TypeScript review — which is why every Elite Core module ships a `README.md` explaining the *why* of its idiomatic choices, not just the *what*, and why the Rust itself should lean conservative and readable over clever, especially early on.

**Kill switch, checked at the F2 gate:** if, by the end of F2, Kotlin capability is not keeping pace with what the plan needs, the fallback is **not** reverting to Expo — it is **cutting Wear OS and own-recording from v1** and shipping an import-first Android app instead (Health Connect + file import + push-to-Strava, no live recording engine, no watch app). That is a smaller, different, but honest and shippable product. This is re-evaluated at the F2 gate specifically — not before, and not silently slipped past it.

If the owner cannot commit Kotlin capacity at all (in-house or contracted), the same fallback applies immediately rather than waiting for F2.

## Consequences

- New CI lanes: Gradle lint/unit/instrumented; Rust build matrix (ADR-006).
- Design tokens must gain a Kotlin/Compose output (Style Dictionary pipeline, ADR-002 extension).
- `packages/api-client` stays TS for web; Android talks to the same API via generated Kotlin client or hand-rolled Retrofit layer against the tRPC/REST contract (decided in F2).
- Team learning curve is accepted and scheduled (F3 shell phase is deliberately UI-light).
