package com.fitconnect.android.foundation.flags

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.KeyValueStore
import androidx.datastore.preferences.core.Preferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FeatureFlagStoreTest {
    private val store = object : KeyValueStore {
        private val map = mutableMapOf<Preferences.Key<String>, String>()
        override fun observe(key: Preferences.Key<String>): Flow<String?> = flowOf(map[key])
        override suspend fun get(key: Preferences.Key<String>): String? = map[key]
        override suspend fun set(key: Preferences.Key<String>, value: String): AppResult<Unit> {
            map[key] = value
            return AppResult.Ok(Unit)
        }
        override suspend fun remove(key: Preferences.Key<String>): AppResult<Unit> {
            map.remove(key)
            return AppResult.Ok(Unit)
        }
    }

    @Test
    fun remoteOverrideAndKillSwitch() = runBlocking {
        val flags = DefaultFeatureFlagStore(store)
        assertTrue(flags.isEnabled(FeatureFlag.AUTH_GOOGLE))
        flags.applyRemote(mapOf(FeatureFlag.KILL_SWITCH_NETWORK.key to true))
        assertTrue(flags.killSwitchActive())
        flags.setLocal(FeatureFlag.AUTH_APPLE, true)
        assertTrue(flags.isEnabled(FeatureFlag.AUTH_APPLE))
        flags.applyRemote(mapOf(FeatureFlag.AUTH_APPLE.key to false))
        assertFalse(flags.isEnabled(FeatureFlag.AUTH_APPLE))
    }
}
