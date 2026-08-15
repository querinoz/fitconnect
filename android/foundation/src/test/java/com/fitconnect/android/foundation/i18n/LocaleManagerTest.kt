package com.fitconnect.android.foundation.i18n

import androidx.datastore.preferences.core.Preferences
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LocaleManagerTest {
    private val store = object : KeyValueStore {
        private val map = mutableMapOf<Preferences.Key<String>, String>()
        private val flows = mutableMapOf<Preferences.Key<String>, MutableStateFlow<String?>>()
        override fun observe(key: Preferences.Key<String>): Flow<String?> =
            flows.getOrPut(key) { MutableStateFlow(map[key]) }
        override suspend fun get(key: Preferences.Key<String>): String? = map[key]
        override suspend fun set(key: Preferences.Key<String>, value: String): AppResult<Unit> {
            map[key] = value
            flows.getOrPut(key) { MutableStateFlow(value) }.value = value
            return AppResult.Ok(Unit)
        }
        override suspend fun remove(key: Preferences.Key<String>): AppResult<Unit> {
            map.remove(key)
            flows[key]?.value = null
            return AppResult.Ok(Unit)
        }
    }

    @Test
    fun defaultsToEnglish() = runBlocking {
        val manager = DefaultLocaleManager(store)
        assertEquals(AppLocale.EN, manager.current())
    }

    @Test
    fun persistsPortugueseAndSpanish() = runBlocking {
        val manager = DefaultLocaleManager(store)
        manager.set(AppLocale.PT)
        assertEquals(AppLocale.PT, manager.current())
        assertEquals("pt", store.get(PreferenceKeys.LOCALE))
        manager.set(AppLocale.ES)
        assertEquals(AppLocale.ES, manager.current())
    }

    @Test
    fun catalogIncludesEnPtAndWesternEuropean() {
        val tags = AppLocale.entries.map { it.bcp47 }
        assertTrue(tags.containsAll(listOf("en", "pt", "pt-PT", "es", "fr", "de")))
        assertEquals("Português (Portugal)", AppLocale.PT_PT.displayName)
    }
}
