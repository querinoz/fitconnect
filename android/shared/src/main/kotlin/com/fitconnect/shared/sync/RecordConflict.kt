package com.fitconnect.shared.sync

/**
 * Last-write-wins for non-session records (ADR-002).
 * Tie-break: lexicographic [deviceId]. Losing writes must be logged, never dropped silently.
 */
object RecordConflict {
    fun winnerDeviceId(
        aUpdatedAtEpochMs: Long,
        aDeviceId: String,
        bUpdatedAtEpochMs: Long,
        bDeviceId: String,
    ): String {
        if (aUpdatedAtEpochMs != bUpdatedAtEpochMs) {
            return if (aUpdatedAtEpochMs > bUpdatedAtEpochMs) aDeviceId else bDeviceId
        }
        return if (aDeviceId <= bDeviceId) aDeviceId else bDeviceId
    }
}
