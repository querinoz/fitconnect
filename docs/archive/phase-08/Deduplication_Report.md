# Phase 08 — Deduplication Report

Problem: the same workout arrives from Garmin **and** Strava **and** Health Connect.

## Strategy (deterministic)
Two workouts are duplicates iff:
1. same athlete, **and**
2. same source record (provider + sourceRecordId) — re-sync case, **or**
3. same sport key **and** time-range overlap ≥ 70 % of the shorter session.

## Merge rules
- Primary record chosen by fixed provider priority: Garmin > Polar > WHOOP > Health Connect > Samsung Health > Fitbit > Strava > Oura > Manual (device-recording sources outrank aggregators).
- Missing fields on the primary are gap-filled from secondaries (e.g. power from Strava onto a Garmin record).
- **Nothing is discarded**: every secondary's `Provenance` is appended to `mergedFrom` (deduped by provider+sourceRecordId). The Telemetry Center shows "via garmin + strava + health connect".
- Same-source re-syncs replace in place (idempotent).

## Guarantees (tested, `DeduplicationEngineTest` + `SyncEngineTest`)
- 3-provider merge → 1 workout, 2 duplicates counted, provenance ×2 retained, power gap-filled.
- Different sports never merge; non-overlapping sessions never merge.
- Dedup is idempotent: running dedupe over already-merged data yields the same single record.
- Sync-level: re-importing the same window creates 0 new records.
