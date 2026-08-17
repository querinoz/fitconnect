package com.fitconnect.android.telemetry.observability

import android.util.Log
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

enum class WatchDiagEvent {
    WATCH_CONNECTED,
    WATCH_DISCONNECTED,
    SESSION_STARTED,
    TELEMETRY_STARTED,
    TELEMETRY_SAMPLE,
    SYNC_STARTED,
    SYNC_COMPLETED,
    SYNC_FAILED,
    REALTIME_CONNECTED,
    REALTIME_DISCONNECTED,
}

/**
 * Structured watch pipeline counters. Logs event names only — never tokens,
 * never heart-rate values, never athlete PII.
 */
class WatchDiagnostics {
    private val counts = ConcurrentHashMap<WatchDiagEvent, AtomicInteger>()

    fun record(event: WatchDiagEvent) {
        counts.getOrPut(event) { AtomicInteger() }.incrementAndGet()
        Log.i(TAG, event.name)
    }

    fun count(event: WatchDiagEvent): Int = counts[event]?.get() ?: 0

    companion object {
        const val TAG = "FITCONNECT_WATCH"
    }
}
