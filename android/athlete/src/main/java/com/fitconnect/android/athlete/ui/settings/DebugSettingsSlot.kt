package com.fitconnect.android.athlete.ui.settings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf

/** Optional debug-only slot provided by :app (Crashlytics probe). */
val LocalDebugSettingsSlot = staticCompositionLocalOf<(@Composable () -> Unit)?> { null }
