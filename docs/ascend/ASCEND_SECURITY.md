# ASCEND security

- Idempotent `eventId`.
- Anti-abuse: impossible distance/speed, negative values, future timestamps.
- Uncertain-but-plausible data is accepted (do not punish legitimate athletes).
- Offline: local apply + reconcile queue (`pendingReconcile`). LOCAL_DEMO is local-canonical.
- Production: server validation required. Do not trust client totals.
- Demo events must not be sent to production backends.
- No fabricated population statistics.
