# Offline Architecture Report

DurableSyncQueue survives process death.
Fail-closed executor — unknown types stay queued.
Registered local-ack handlers for optimistic athlete/coach mutations.
FreshnessState: LIVE/SYNCED/STALE/OFFLINE/SYNCING/ERROR.
