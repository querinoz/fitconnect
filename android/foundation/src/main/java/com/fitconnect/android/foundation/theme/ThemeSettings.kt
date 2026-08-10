package com.fitconnect.android.foundation.theme

import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

enum class ThemeMode {
    SYSTEM,
    DARK,
    LIGHT,
    HIGH_CONTRAST,
}

/**
 * Theme preference port. Compose mapping to Elite Surface / Voltline tokens
 * lives in `:app` — this store is the single source for the user's choice.
 */
interface ThemeSettings {
    suspend fun mode(): ThemeMode
    fun observe(): Flow<ThemeMode>
    suspend fun setMode(mode: ThemeMode)
}

class DefaultThemeSettings(
    private val keyValueStore: KeyValueStore,
) : ThemeSettings {
    override suspend fun mode(): ThemeMode {
        val raw = keyValueStore.get(PreferenceKeys.THEME) ?: return ThemeMode.SYSTEM
        return runCatching { ThemeMode.valueOf(raw) }.getOrDefault(ThemeMode.SYSTEM)
    }

    override fun observe(): Flow<ThemeMode> =
        keyValueStore.observe(PreferenceKeys.THEME).map { raw ->
            raw?.let { runCatching { ThemeMode.valueOf(it) }.getOrNull() } ?: ThemeMode.SYSTEM
        }

    override suspend fun setMode(mode: ThemeMode) {
        keyValueStore.set(PreferenceKeys.THEME, mode.name)
    }
}
