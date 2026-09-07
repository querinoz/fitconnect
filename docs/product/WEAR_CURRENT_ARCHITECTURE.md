# Wear — Current Architecture (Wave 2)

**Status:** ENGINEERING PARTIAL · PRODUCT = **BLOCKED / FUTURE PHASE**
**Date:** 2026-09-07

## What exists

| Layer | Location | Notes |
|-------|----------|--------|
| Watch UI | `android/wear` | Purpose-built instrument / ambient, not a phone clone |
| Session mint | `WearMainActivity` | `UUID.randomUUID()` → `WearRuntime.sessionId` (no more `wear-*` prefix) |
| Paths | `shared/wear/WearPaths.kt` | Capability + message paths |
| Phone bridge | `telemetry/wear/*`, `FitConnectWearListenerService` | GMS Wearable Data/Message clients |
| Codec | `SessionControlCodec` | Control commands |

## Identity contract (Wave 2 fix)

Wear session IDs are now UUID-shaped so they **can** map to canonical `activities.id`.
They are still **minted on-watch** until the phone publishes a lease with a server-backed activity id.

## Remaining blockers (see also WEAR_IMPLEMENTATION_BLOCKER.md)

1. Phone↔watch identity sync (Firebase UID + canonical activity id) not end-to-end verified on hardware.
2. LOCAL_DEMO tiles / Ascend demo IDs still present on watch process.
3. Companion state remains `LINK UNVERIFIED` until CapabilityClient pairing is proven.
4. No production claim for live HR → ASCEND without physical Wear E2E.

## Product decision

Wear is **not** required to mark phone Mobile Functional Completion PASS for the current launch slice.
Classify: **WEAR = BLOCKED / FUTURE PHASE**.
