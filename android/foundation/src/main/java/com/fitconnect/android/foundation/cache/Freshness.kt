package com.fitconnect.android.foundation.cache

/**
 * Explicit freshness for cacheable resources. UI must never imply stale data is live.
 */
enum class FreshnessState {
    LIVE,
    SYNCED,
    STALE,
    OFFLINE,
    SYNCING,
    ERROR,
}

data class CacheMeta(
    val fetchedAtEpochMs: Long,
    val expiresAtEpochMs: Long,
    val source: String,
    val version: String? = null,
    val syncStatus: FreshnessState = FreshnessState.SYNCED,
) {
    fun stateAt(nowEpochMs: Long, online: Boolean): FreshnessState {
        if (!online) return FreshnessState.OFFLINE
        if (syncStatus == FreshnessState.SYNCING || syncStatus == FreshnessState.ERROR) return syncStatus
        return if (nowEpochMs > expiresAtEpochMs) FreshnessState.STALE else FreshnessState.SYNCED
    }
}

object FreshnessPolicy {
    const val PROFILE_TTL_MS = 15 * 60_000L
    const val PROGRAM_TTL_MS = 10 * 60_000L
    const val SESSION_TTL_MS = 5 * 60_000L
    const val TELEMETRY_TTL_MS = 3 * 60_000L
    const val FEED_TTL_MS = 2 * 60_000L
    const val DISCOVER_TTL_MS = 10 * 60_000L

    fun meta(source: String, ttlMs: Long, now: Long = System.currentTimeMillis(), version: String? = null) =
        CacheMeta(
            fetchedAtEpochMs = now,
            expiresAtEpochMs = now + ttlMs,
            source = source,
            version = version,
            syncStatus = FreshnessState.SYNCED,
        )
}
