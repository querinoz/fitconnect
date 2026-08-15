package com.fitconnect.android.foundation.theme

import androidx.datastore.preferences.core.Preferences
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ThemeSettingsTest {
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
    fun defaultsToSystem() = runBlocking {
        val settings = DefaultThemeSettings(store)
        assertEquals(ThemeMode.SYSTEM, settings.mode())
    }

    @Test
    fun persistsLightAndDark() = runBlocking {
        val settings = DefaultThemeSettings(store)
        settings.setMode(ThemeMode.LIGHT)
        assertEquals(ThemeMode.LIGHT, settings.mode())
        assertEquals(ThemeMode.LIGHT.name, store.get(PreferenceKeys.THEME))
        settings.setMode(ThemeMode.DARK)
        assertEquals(ThemeMode.DARK, settings.mode())
    }

    @Test
    fun resolveDark() {
        assertTrue(ThemeMode.DARK.resolveDark(systemDark = false))
        assertFalse(ThemeMode.LIGHT.resolveDark(systemDark = true))
        assertTrue(ThemeMode.SYSTEM.resolveDark(systemDark = true))
        assertFalse(ThemeMode.SYSTEM.resolveDark(systemDark = false))
        assertTrue(ThemeMode.HIGH_CONTRAST.resolveDark(systemDark = false))
    }
}
