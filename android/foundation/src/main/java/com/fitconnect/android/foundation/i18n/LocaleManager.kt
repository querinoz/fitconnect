package com.fitconnect.android.foundation.i18n

import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.NumberFormat
import java.util.Locale

enum class AppLocale(
    val bcp47: String,
    val displayName: String,
    val rtl: Boolean = false,
) {
    EN("en", "English"),
    PT("pt", "Português"),
    PT_PT("pt-PT", "Português (Portugal)"),
    ES("es", "Español"),
    FR("fr", "Français"),
    DE("de", "Deutsch"),
}

interface LocaleManager {
    suspend fun current(): AppLocale
    fun observe(): Flow<AppLocale>
    suspend fun set(locale: AppLocale)
    fun formatNumber(value: Number, locale: AppLocale = AppLocale.EN): String
    fun isRtl(locale: AppLocale): Boolean = locale.rtl
}

class DefaultLocaleManager(
    private val keyValueStore: KeyValueStore,
) : LocaleManager {
    override suspend fun current(): AppLocale {
        val raw = keyValueStore.get(PreferenceKeys.LOCALE) ?: return AppLocale.EN
        return AppLocale.entries.firstOrNull { it.bcp47 == raw } ?: AppLocale.EN
    }

    override fun observe(): Flow<AppLocale> =
        keyValueStore.observe(PreferenceKeys.LOCALE).map { raw ->
            AppLocale.entries.firstOrNull { it.bcp47 == raw } ?: AppLocale.EN
        }

    override suspend fun set(locale: AppLocale) {
        keyValueStore.set(PreferenceKeys.LOCALE, locale.bcp47)
    }

    override fun formatNumber(value: Number, locale: AppLocale): String =
        NumberFormat.getInstance(Locale.forLanguageTag(locale.bcp47)).format(value)
}
