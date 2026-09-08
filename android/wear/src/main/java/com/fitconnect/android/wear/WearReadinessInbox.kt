package com.fitconnect.android.wear

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Watch-side inbox for phone → Wear readiness sync ([com.fitconnect.shared.wear.WearPaths.SYNC_HEALTH]).
 * Does not invent scores; rejects malformed wires.
 */
object WearReadinessInbox {
    private val _lastSynced = MutableStateFlow<ReadinessSource.SyncedFromPhone?>(null)
    val lastSyncedFlow: StateFlow<ReadinessSource.SyncedFromPhone?> = _lastSynced.asStateFlow()

    val lastSynced: ReadinessSource.SyncedFromPhone?
        get() = _lastSynced.value

    @Volatile
    var acceptedCount: Int = 0
        private set

    @Volatile
    var rejectedCount: Int = 0
        private set

    fun clear() {
        _lastSynced.value = null
        acceptedCount = 0
        rejectedCount = 0
    }

    fun ingest(wire: String): Boolean {
        val parsed = parse(wire) ?: run {
            rejectedCount += 1
            return false
        }
        _lastSynced.value = parsed
        acceptedCount += 1
        return true
    }

    fun parse(wire: String): ReadinessSource.SyncedFromPhone? {
        if (wire.isBlank()) return null
        val header = runCatching {
            wire.split(';').associate { token ->
                val eq = token.indexOf('=')
                require(eq > 0) { "Malformed readiness sync" }
                token.substring(0, eq) to token.substring(eq + 1)
            }
        }.getOrNull() ?: return null

        val version = header["v"] ?: return null
        if (version != SCHEMA) return null
        val score = header["readiness"]?.toIntOrNull()?.coerceIn(0, 100) ?: return null
        val ts = header["ts"]?.toLongOrNull() ?: return null
        return ReadinessSource.SyncedFromPhone(score = score, syncedAtEpochMs = ts)
    }

    fun toWire(score: Int, syncedAtEpochMs: Long): String =
        "v=$SCHEMA;readiness=${score.coerceIn(0, 100)};ts=$syncedAtEpochMs"

    const val SCHEMA = "health.v1"
}
