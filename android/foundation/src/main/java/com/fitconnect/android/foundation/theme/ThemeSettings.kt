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
    ;

    fun resolveDark(systemDark: Boolean): Boolean = when (this) {
        SYSTEM -> systemDark
        DARK, HIGH_CONTRAST -> true
        LIGHT -> false
    }
}

/**
 * Volt-spectrum personal accent. Not a second brand —
 * only existing Volt tokens, never arbitrary hues.
 */
enum class AccentPreset {
    VOLTLINE,
    VOLT_300,
    VOLT_400,
    VOLT_600,
}

/**
 * Honeycomb atmosphere intensity. Theme chrome, not a feature flag.
 * Off | Subtle only — no Full, no confetti.
 */
enum class HoneycombIntensity {
    OFF,
    SUBTLE,
}

/**
 * Theme preference port. Compose mapping to Elite Surface / Voltline tokens
 * lives in `:app` — this store is the single source for the user's choice.
 */
interface ThemeSettings {
    suspend fun mode(): ThemeMode
    fun observe(): Flow<ThemeMode>
    suspend fun setMode(mode: ThemeMode)
    suspend fun accent(): AccentPreset
    fun observeAccent(): Flow<AccentPreset>
    suspend fun setAccent(accent: AccentPreset)
    suspend fun honeycomb(): HoneycombIntensity
    fun observeHoneycomb(): Flow<HoneycombIntensity>
    suspend fun setHoneycomb(intensity: HoneycombIntensity)
}

class DefaultThemeSettings(
    private val keyValueStore: KeyValueStore,
) : ThemeSettings {
    override suspend fun mode(): ThemeMode {
        val raw = keyValueStore.get(PreferenceKeys.THEME) ?: return ThemeMode.DARK
        return runCatching { ThemeMode.valueOf(raw) }.getOrDefault(ThemeMode.DARK)
    }

    override fun observe(): Flow<ThemeMode> =
        keyValueStore.observe(PreferenceKeys.THEME).map { raw ->
            raw?.let { runCatching { ThemeMode.valueOf(it) }.getOrNull() } ?: ThemeMode.DARK
        }

    override suspend fun setMode(mode: ThemeMode) {
        keyValueStore.set(PreferenceKeys.THEME, mode.name)
    }

    override suspend fun accent(): AccentPreset {
        val raw = keyValueStore.get(PreferenceKeys.ACCENT) ?: return AccentPreset.VOLTLINE
        return runCatching { AccentPreset.valueOf(raw) }.getOrDefault(AccentPreset.VOLTLINE)
    }

    override fun observeAccent(): Flow<AccentPreset> =
        keyValueStore.observe(PreferenceKeys.ACCENT).map { raw ->
            raw?.let { runCatching { AccentPreset.valueOf(it) }.getOrNull() } ?: AccentPreset.VOLTLINE
        }

    override suspend fun setAccent(accent: AccentPreset) {
        keyValueStore.set(PreferenceKeys.ACCENT, accent.name)
    }

    override suspend fun honeycomb(): HoneycombIntensity {
        val raw = keyValueStore.get(PreferenceKeys.HONEYCOMB) ?: return HoneycombIntensity.SUBTLE
        return parseHoneycomb(raw)
    }

    override fun observeHoneycomb(): Flow<HoneycombIntensity> =
        keyValueStore.observe(PreferenceKeys.HONEYCOMB).map { raw ->
            raw?.let(::parseHoneycomb) ?: HoneycombIntensity.SUBTLE
        }

    override suspend fun setHoneycomb(intensity: HoneycombIntensity) {
        keyValueStore.set(PreferenceKeys.HONEYCOMB, intensity.name)
    }

    private fun parseHoneycomb(raw: String): HoneycombIntensity =
        when (raw) {
            HoneycombIntensity.OFF.name -> HoneycombIntensity.OFF
            HoneycombIntensity.SUBTLE.name -> HoneycombIntensity.SUBTLE
            else -> HoneycombIntensity.SUBTLE
        }
}
