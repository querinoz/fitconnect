# Adaptive Training Engine (V10.2)

Extends V8.5/V9 sport-intelligence (`adaptTodaySession`, TRAIN machine).

## New module
`recommendSessionAdaptation` — rule-bound suggestions:

- SPIKE load → REDUCE_VOLUME
- Low readiness → SWAP_TO_RECOVERY
- Time shortage → REDUCE_VOLUME
- HIGH load → EXTEND_REST
- else KEEP

Every recommendation: `requiresConfirm: true`, `autoApplied: false`, WHAT/WHY/DATA/CONFIDENCE.
