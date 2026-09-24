package com.fitconnect.android.fitness.healthconnect

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.KeyValueStore
import androidx.datastore.preferences.core.Preferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HealthConnectWritePrefsTest {
    @Test
    fun defaultsOffAndPersistsOptIn() = runBlocking {
        val store = FakeKeyValueStore()
        val prefs = HealthConnectWritePrefs(store)
        assertFalse(prefs.isOptedIn())
        prefs.setOptIn(true)
        assertTrue(prefs.isOptedIn())
        prefs.setOptIn(false)
        assertFalse(prefs.isOptedIn())
    }

    private class FakeKeyValueStore : KeyValueStore {
        private val map = mutableMapOf<Preferences.Key<String>, MutableStateFlow<String?>>()

        private fun flowFor(key: Preferences.Key<String>) =
            map.getOrPut(key) { MutableStateFlow(null) }

        override fun observe(key: Preferences.Key<String>): Flow<String?> = flowFor(key)

        override suspend fun get(key: Preferences.Key<String>): String? = flowFor(key).value

        override suspend fun set(key: Preferences.Key<String>, value: String): AppResult<Unit> {
            flowFor(key).value = value
            return AppResult.Ok(Unit)
        }

        override suspend fun remove(key: Preferences.Key<String>): AppResult<Unit> {
            flowFor(key).value = null
            return AppResult.Ok(Unit)
        }
    }
}
