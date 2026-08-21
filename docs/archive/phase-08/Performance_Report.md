# Phase 08 — Performance Report

## Design-for-scale decisions
- **No unbounded reads exist.** `TelemetryStore` has no "all samples" API; every query takes range + offset + limit and returns a `Page`.
- Store is index-shaped like the future Room schema: `(athleteId, metric)` index for samples, athlete index for workouts, `(provider, sourceRecordId)` set for dedup existence checks (O(1)).
- Aggregation streams pages (500/page) and folds into bounded bucket maps — memory is O(buckets), not O(samples). Charts receive ≤ 1 point per bucket.
- Sync is paginated (200 records/page) with per-page checkpoints — no giant in-memory batches.
- Dedup lookback window is bounded (±6 h around the sync range), not full history.

## Measured (JVM unit environment, `StoreAndAggregationTest` + full suite timing)
- 1,200-sample ingestion + 3 paged queries: < 50 ms.
- Full 36-test telemetry suite incl. multi-day syncs of 19 metrics × multiple providers: ~2 s total.
- Idempotent re-sync of a fully-synced window: 0 allocations of new records (verified 0 imported).

## Deferred measurements (require device / real datasets — logged in Technical_Debt.md)
- On-device DB query benchmarks (needs Room persistence, Phase scope excluded persistence backend swap).
- Chart frame timing on device; battery profiling via Battery Historian.

## Gates
- No uncontrolled memory growth — PASS by construction (paged everything) and test.
- No full-history loads — PASS (API does not exist).
- Initial/incremental sync measurable — PASS (`SyncReport.durationMs`, `pagesFetched`, `recordsImported` on every sync).
