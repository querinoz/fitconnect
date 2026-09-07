# Wear Implementation Blocker

**Status:** BLOCKED / FUTURE PHASE
**Date:** 2026-09-07
**Does NOT block phone Mobile Functional Completion** (product evidence: Wear is companion surface, not launch-critical phone path).

## Root cause

1. **Session identity incomplete end-to-end**
   Watch now mints UUID `sessionId` (Wave 2), but phone outdoor/guided completion still owns durable `activities.id` creation. Without a phone→watch lease that carries the canonical activity id, Wear telemetry cannot reliably attach to the same Activity row.

2. **Companion pairing unverified**
   UI shows `LINK UNVERIFIED`. CapabilityClient registration exists; no automated/physical proof that DataClient/MessageClient round-trips under the same Firebase UID.

3. **Demo contamination risk**
   `WearRuntime.ascend` still seeds `LocalDemoIdentity.ATHLETE_ID`. Acceptable only if watch never presents that as production identity — needs a LOCAL_DEMO badge gate equivalent to phone SM-004.

4. **Hardware gate**
   No Wear OS device attached in this cycle (`adb devices` empty for phone and watch).

## Safe progress already landed

- Removed `wear-*` string mint at session start; use UUID.
- Documented architecture in `docs/product/WEAR_CURRENT_ARCHITECTURE.md`.

## Required before WEAR = PASS

- [ ] Phone publishes canonical activity UUID + userId to watch on session start
- [ ] Watch refuses to start outdoor/workout without lease when not LOCAL_DEMO
- [ ] Physical Wear E2E: connect → start → HR sample → phone inbox → activity row
- [ ] LOCAL_DEMO badge correctness on watch chrome
