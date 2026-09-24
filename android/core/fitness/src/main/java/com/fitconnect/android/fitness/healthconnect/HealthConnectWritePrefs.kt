package com.fitconnect.android.fitness.healthconnect

import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Explicit user opt-in for writing completed workouts to Health Connect.
 * Default is off — never silent-write.
 */
class HealthConnectWritePrefs(
    private val store: KeyValueStore,
) {
    fun observeOptIn(): Flow<Boolean> =
        store.observe(PreferenceKeys.HEALTH_CONNECT_WRITE_OPT_IN).map { it == "true" }

    suspend fun isOptedIn(): Boolean =
        store.get(PreferenceKeys.HEALTH_CONNECT_WRITE_OPT_IN) == "true"

    suspend fun setOptIn(enabled: Boolean) {
        store.set(
            PreferenceKeys.HEALTH_CONNECT_WRITE_OPT_IN,
            if (enabled) "true" else "false",
        )
    }
}
