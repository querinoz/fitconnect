package com.fitconnect.android.foundation.security

import androidx.datastore.preferences.core.stringPreferencesKey
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.offline.SyncQueue
import com.fitconnect.android.foundation.session.SessionStore
import com.fitconnect.android.foundation.storage.KeyValueStore

/**
 * Cross-account isolation on logout / account switch / deletion.
 * Clears session material and ephemeral outbox so the next user cannot see
 * prior offline mutations or session tokens.
 */
class AccountIsolationController(
    private val sessionStore: SessionStore,
    private val syncQueue: SyncQueue,
    private val keyValueStore: KeyValueStore,
    private val logger: Logger,
    private val extraWipers: List<suspend () -> Unit> = emptyList(),
) {
    suspend fun wipeForLogout(): AppResult<Unit> {
        logger.i(TAG, "account isolation wipe (logout)")
        syncQueue.clear()
        keyValueStore.remove(LAST_USER_KEY)
        extraWipers.forEach { runCatching { it() } }
        return sessionStore.clear()
    }

    suspend fun wipeForAccountSwitch(newUserId: String?): AppResult<Unit> {
        val previous = keyValueStore.get(LAST_USER_KEY)
        if (previous != null && newUserId != null && previous != newUserId) {
            logger.i(TAG, "account switch detected — clearing outbox")
            syncQueue.clear()
            extraWipers.forEach { runCatching { it() } }
        }
        if (newUserId != null) {
            keyValueStore.set(LAST_USER_KEY, newUserId)
        }
        return AppResult.Ok(Unit)
    }

    companion object {
        private const val TAG = "AccountIsolation"
        val LAST_USER_KEY = stringPreferencesKey("security.last_user_id")
    }
}
