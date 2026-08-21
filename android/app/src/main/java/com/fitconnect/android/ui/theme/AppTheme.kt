package com.fitconnect.android.ui.theme

import androidx.activity.ComponentActivity
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalContext
import com.fitconnect.android.BuildConfig
import com.fitconnect.android.athlete.ui.settings.LocalDebugSettingsSlot
import com.fitconnect.android.auth.AndroidFederatedAuthHost
import com.fitconnect.android.auth.GoogleWebClientIds
import com.fitconnect.android.designui.identity.LocalFederatedAuthHost
import com.fitconnect.android.designui.theme.EliteSurfaceTheme
import com.fitconnect.android.firebase.DebugCrashlyticsCard
import com.fitconnect.android.foundation.auth.UnavailableFederatedAuthHost
import com.fitconnect.android.foundation.di.AppContainer
import com.fitconnect.android.foundation.i18n.AppLocale
import com.fitconnect.android.foundation.i18n.LocaleApplier
import com.fitconnect.android.foundation.theme.AccentPreset
import com.fitconnect.android.foundation.theme.ThemeMode

val LocalAppContainer = staticCompositionLocalOf<AppContainer> {
    error("AppContainer not provided")
}

/**
 * App shell theme — always delegates to :design-ui EliteSurfaceTheme.
 * Feature modules must not define competing MaterialTheme roots.
 */
@Composable
fun FitConnectTheme(
    container: AppContainer,
    content: @Composable () -> Unit,
) {
    val mode by container.themeSettings.observe().collectAsState(initial = ThemeMode.DARK)
    val accent by container.themeSettings.observeAccent().collectAsState(initial = AccentPreset.VOLTLINE)
    val locale by container.localeManager.observe().collectAsState(initial = AppLocale.EN)
    val context = LocalContext.current
    val activity = context as? ComponentActivity
    val federatedHost = remember(activity, container.config.firebaseAuthConfigured) {
        if (container.config.firebaseAuthConfigured && activity != null) {
            AndroidFederatedAuthHost(activity) { GoogleWebClientIds.resolve(activity) }
        } else {
            UnavailableFederatedAuthHost
        }
    }
    LaunchedEffect(locale) {
        LocaleApplier.apply(context, locale)
    }
    CompositionLocalProvider(
        LocalAppContainer provides container,
        LocalFederatedAuthHost provides federatedHost,
        LocalDebugSettingsSlot provides if (BuildConfig.DEBUG) {
            { DebugCrashlyticsCard() }
        } else {
            null
        },
    ) {
        EliteSurfaceTheme(mode = mode, accent = accent, content = content)
    }
}
