package com.fitconnect.android.foundation.i18n

import android.app.Activity
import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.os.LocaleList
import java.util.Locale

object LocaleApplier {
    fun apply(context: Context, locale: AppLocale) {
        val desired = Locale.forLanguageTag(locale.bcp47)
        Locale.setDefault(desired)
        if (Build.VERSION.SDK_INT >= 33) {
            val manager = context.getSystemService(android.app.LocaleManager::class.java) ?: return
            val current = manager.applicationLocales.toLanguageTags()
            if (!current.startsWith(locale.bcp47)) {
                manager.applicationLocales = LocaleList.forLanguageTags(locale.bcp47)
            }
            return
        }
        val resources = context.resources
        val existing = resources.configuration.locales.get(0)
        if (existing.language == desired.language) return
        val config = Configuration(resources.configuration)
        config.setLocale(desired)
        @Suppress("DEPRECATION")
        resources.updateConfiguration(config, resources.displayMetrics)
        (context as? Activity)?.recreate()
    }
}
