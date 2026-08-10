package com.fitconnect.android.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.staticCompositionLocalOf
import com.fitconnect.android.designui.theme.EliteSurfaceTheme
import com.fitconnect.android.foundation.di.AppContainer
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
    val mode by container.themeSettings.observe().collectAsState(initial = ThemeMode.SYSTEM)
    CompositionLocalProvider(LocalAppContainer provides container) {
        EliteSurfaceTheme(mode = mode, content = content)
    }
}
