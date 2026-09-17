package com.fitconnect.android.sports.intelligence

/**
 * Rest timer driven by wall-clock timestamps (not tick-only).
 * Survives process pauses: remaining is computed from [endsAtWallMs].
 */
data class WallClockRestTimer(
    val durationMs: Long,
    val startedAtWallMs: Long,
    val endsAtWallMs: Long,
    val frozenRemainingMs: Long? = null,
) {
    init {
        require(durationMs > 0) { "durationMs must be positive" }
        require(endsAtWallMs >= startedAtWallMs) { "endsAtWallMs must be >= startedAtWallMs" }
    }

    fun isFrozen(): Boolean = frozenRemainingMs != null

    fun remainingMs(nowWallMs: Long): Long {
        frozenRemainingMs?.let { return it.coerceAtLeast(0) }
        return (endsAtWallMs - nowWallMs).coerceAtLeast(0)
    }

    fun elapsedMs(nowWallMs: Long): Long {
        frozenRemainingMs?.let { return (durationMs - it).coerceIn(0, durationMs) }
        return (nowWallMs - startedAtWallMs).coerceIn(0, durationMs)
    }

    fun isComplete(nowWallMs: Long): Boolean = remainingMs(nowWallMs) <= 0

    fun freeze(nowWallMs: Long): WallClockRestTimer =
        copy(frozenRemainingMs = remainingMs(nowWallMs))

    fun resume(nowWallMs: Long): WallClockRestTimer {
        val left = frozenRemainingMs ?: return this
        return WallClockRestTimer(
            durationMs = durationMs,
            startedAtWallMs = nowWallMs,
            endsAtWallMs = nowWallMs + left,
            frozenRemainingMs = null,
        )
    }

    companion object {
        fun start(durationMs: Long, nowWallMs: Long): WallClockRestTimer =
            WallClockRestTimer(
                durationMs = durationMs,
                startedAtWallMs = nowWallMs,
                endsAtWallMs = nowWallMs + durationMs,
                frozenRemainingMs = null,
            )
    }
}
