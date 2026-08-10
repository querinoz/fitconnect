# Phase 08 — Data Quality Report

`DataQualityEngine` — every sample is assessed before storage. **Suspicious data is flagged, never silently transformed.** Original values are preserved with `DataQuality` + `qualityFlags` stamped into provenance; INVALID records are rejected and counted (`recordsRejected` in the sync report + observability).

## Checks
| Detection | Mechanism |
|---|---|
| Impossible values | physiological bounds per metric (HR 20–250 bpm, HRV 1–300 ms, SpO2 50–100 %, temp 30–45 °C, sleep ≤ 24 h, …) |
| Future timestamps | `at > now + 5 min` → INVALID `future_timestamp` |
| Negative durations | `endAt < at` → INVALID `negative_duration` |
| Corrupted records | NaN/Infinite → INVALID `non_finite_value` |
| Sensor confidence | provenance confidence < 0.5 → SUSPECT `low_confidence` |
| Outliers | MAD-based (median absolute deviation, factor 6) over sample windows — flags ids, does not delete |
| Duplicates | store-level idempotent upsert + source-record index + workout dedup engine |
| Clock errors | epoch-based `TelemetryInstant` + future-timestamp check; zone offset retained for local reconstruction |
| Unit errors | impossible by construction: values converted explicitly to canonical units at the adapter; `UnitConverter` throws on unsupported pairs |
| Incomplete sessions | modeled by nullable fields + `PARTIAL_RESPONSE` failure class |

Verified by `DataQualityEngineTest` (6 tests) including: impossible HR flagged not corrected, future timestamp, negative duration, low-confidence SUSPECT, valid pass-through, MAD outlier detection.
