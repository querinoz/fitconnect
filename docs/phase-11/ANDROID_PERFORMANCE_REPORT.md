# Android Performance Report

## Changes
- Lazy feature DI (sports/geo/telemetry/ai/athlete/coach) after shell
- Lazy EncryptedSecureStore / session / API client
- Async OkHttp enqueue + RequestPolicy (retry/backoff/dedupe)
- LRU HTTP cache (64)
- Telemetry prune + reservoir aggregation
- AI audit ring buffer
- Durable offline queue + fail-closed flush
- Release R8 + shrinkResources enabled

## Budgets
See PerformanceBudget: cold shell 2.5s, warm 1s, nav 300ms.
