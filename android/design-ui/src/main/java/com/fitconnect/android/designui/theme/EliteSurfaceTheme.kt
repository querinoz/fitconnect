package com.fitconnect.android.designui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalContext
import android.provider.Settings
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.foundation.theme.ThemeMode

private fun darkScheme(highContrast: Boolean): ColorScheme {
    val on = EliteSurfaceColors.ON_SURFACE.toColor()
    return darkColorScheme(
        primary = EliteSurfaceColors.VOLTLINE.toColor(),
        onPrimary = EliteSurfaceColors.FLOOR.toColor(),
        secondary = EliteSurfaceColors.CONNECT.toColor(),
        onSecondary = EliteSurfaceColors.FLOOR.toColor(),
        tertiary = EliteSurfaceColors.TELEMETRY.toColor(),
        background = EliteSurfaceColors.FLOOR.toColor(),
        onBackground = on,
        surface = if (highContrast) EliteSurfaceColors.CARBON.toColor() else EliteSurfaceColors.SURFACE.toColor(),
        onSurface = on,
        surfaceVariant = EliteSurfaceColors.SURFACE_CONTAINER.toColor(),
        onSurfaceVariant = if (highContrast) on else EliteSurfaceColors.ON_SURFACE_MUTED.toColor(),
        error = EliteSurfaceColors.ALERT.toColor(),
        outline = EliteSurfaceColors.ON_SURFACE_MUTED.toColor().copy(alpha = EliteOpacity.Border),
    )
}

private fun lightScheme(highContrast: Boolean): ColorScheme {
    val on = EliteSurfaceColors.FLOOR.toColor()
    return lightColorScheme(
        primary = EliteSurfaceColors.VOLT_600.toColor(),
        onPrimary = EliteSurfaceColors.FLOOR.toColor(),
        secondary = EliteSurfaceColors.CONNECT.toColor(),
        onSecondary = EliteSurfaceColors.FLOOR.toColor(),
        tertiary = EliteSurfaceColors.TELEMETRY.toColor(),
        background = EliteSurfaceColors.ON_SURFACE.toColor(),
        onBackground = on,
        surface = if (highContrast) {
            EliteSurfaceColors.ON_SURFACE.toColor()
        } else {
            EliteSurfaceColors.ON_SURFACE.toColor()
        },
        onSurface = on,
        surfaceVariant = EliteSurfaceColors.ON_SURFACE_MUTED.toColor().copy(alpha = EliteOpacity.Muted),
        onSurfaceVariant = EliteSurfaceColors.CARBON.toColor(),
        error = EliteSurfaceColors.ALERT.toColor(),
        outline = EliteSurfaceColors.CARBON.toColor().copy(alpha = EliteOpacity.Border),
    )
}

@Composable
fun EliteSurfaceTheme(
    mode: ThemeMode = ThemeMode.SYSTEM,
    content: @Composable () -> Unit,
) {
    val systemDark = isSystemInDarkTheme()
    val highContrast = mode == ThemeMode.HIGH_CONTRAST
    val darkTheme = when (mode) {
        ThemeMode.SYSTEM -> systemDark
        ThemeMode.DARK, ThemeMode.HIGH_CONTRAST -> true
        ThemeMode.LIGHT -> false
    }
    val context = LocalContext.current
    val animatorScale = Settings.Global.getFloat(
        context.contentResolver,
        Settings.Global.ANIMATOR_DURATION_SCALE,
        1f,
    )
    val reduceMotion = animatorScale == 0f

    CompositionLocalProvider(
        LocalReduceMotion provides reduceMotion,
        LocalHighContrast provides highContrast,
    ) {
        MaterialTheme(
            colorScheme = if (darkTheme) darkScheme(highContrast) else lightScheme(highContrast),
            typography = EliteTypographyStyles,
            content = content,
        )
    }
}
