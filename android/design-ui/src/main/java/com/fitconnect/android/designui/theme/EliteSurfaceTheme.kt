package com.fitconnect.android.designui.theme

import android.app.Activity
import android.provider.Settings
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowInsetsControllerCompat
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.foundation.theme.AccentPreset
import com.fitconnect.android.foundation.theme.ThemeMode

val LocalDarkTheme = staticCompositionLocalOf { true }

object EliteColorRoles {
    fun backgroundArgb(dark: Boolean, highContrast: Boolean): Long = when {
        !dark -> EliteSurfaceColors.LIGHT_FLOOR
        else -> EliteSurfaceColors.FLOOR
    }

    fun surfaceArgb(dark: Boolean, highContrast: Boolean): Long = when {
        !dark -> EliteSurfaceColors.LIGHT_SURFACE
        highContrast -> EliteSurfaceColors.SURFACE_CONTAINER_HIGH
        else -> EliteSurfaceColors.SURFACE_CONTAINER
    }

    fun surfaceVariantArgb(dark: Boolean): Long =
        if (dark) EliteSurfaceColors.SURFACE_CONTAINER_HIGH else EliteSurfaceColors.LIGHT_SURFACE_CONTAINER

    fun onSurfaceArgb(dark: Boolean): Long =
        if (dark) EliteSurfaceColors.ON_SURFACE else EliteSurfaceColors.LIGHT_ON_SURFACE

    fun onSurfaceMutedArgb(dark: Boolean, highContrast: Boolean): Long = when {
        !dark -> EliteSurfaceColors.LIGHT_ON_SURFACE_MUTED
        highContrast -> EliteSurfaceColors.ON_SURFACE
        else -> EliteSurfaceColors.ON_SURFACE_MUTED
    }

    fun primaryArgb(dark: Boolean, accent: AccentPreset): Long {
        if (!dark) return EliteSurfaceColors.VOLT_600
        return when (accent) {
            AccentPreset.VOLTLINE -> EliteSurfaceColors.VOLTLINE
            AccentPreset.VOLT_300 -> EliteSurfaceColors.VOLT_300
            AccentPreset.VOLT_400 -> EliteSurfaceColors.VOLT_400
            AccentPreset.VOLT_600 -> EliteSurfaceColors.VOLT_600
        }
    }

    fun scheme(
        dark: Boolean,
        highContrast: Boolean,
        accent: AccentPreset = AccentPreset.VOLTLINE,
    ): ColorScheme {
        val on = onSurfaceArgb(dark).toColor()
        val muted = onSurfaceMutedArgb(dark, highContrast).toColor()
        val bg = backgroundArgb(dark, highContrast).toColor()
        val surface = surfaceArgb(dark, highContrast).toColor()
        val variant = surfaceVariantArgb(dark).toColor()
        val primary = primaryArgb(dark, accent).toColor()
        val onPrimary = EliteSurfaceColors.FLOOR.toColor()
        return if (dark) {
            darkColorScheme(
                primary = primary,
                onPrimary = onPrimary,
                secondary = EliteSurfaceColors.CONNECT.toColor(),
                onSecondary = onPrimary,
                tertiary = EliteSurfaceColors.TELEMETRY.toColor(),
                background = bg,
                onBackground = on,
                surface = surface,
                onSurface = on,
                surfaceVariant = variant,
                onSurfaceVariant = muted,
                error = EliteSurfaceColors.ALERT.toColor(),
                outline = muted.copy(alpha = EliteOpacity.Border),
            )
        } else {
            lightColorScheme(
                primary = primary,
                onPrimary = onPrimary,
                secondary = EliteSurfaceColors.CONNECT.toColor(),
                onSecondary = onPrimary,
                tertiary = EliteSurfaceColors.TELEMETRY.toColor(),
                background = bg,
                onBackground = on,
                surface = surface,
                onSurface = on,
                surfaceVariant = variant,
                onSurfaceVariant = muted,
                error = EliteSurfaceColors.ALERT.toColor(),
                outline = muted.copy(alpha = EliteOpacity.Border),
            )
        }
    }
}

@Composable
fun EliteSurfaceTheme(
    mode: ThemeMode = ThemeMode.SYSTEM,
    accent: AccentPreset = AccentPreset.VOLTLINE,
    content: @Composable () -> Unit,
) {
    val systemDark = isSystemInDarkTheme()
    val highContrast = mode == ThemeMode.HIGH_CONTRAST
    val darkTheme = mode.resolveDark(systemDark)
    val context = LocalContext.current
    val animatorScale = Settings.Global.getFloat(
        context.contentResolver,
        Settings.Global.ANIMATOR_DURATION_SCALE,
        1f,
    )
    val reduceMotion = animatorScale == 0f
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window ?: return@SideEffect
            WindowInsetsControllerCompat(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
                isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    CompositionLocalProvider(
        LocalReduceMotion provides reduceMotion,
        LocalHighContrast provides highContrast,
        LocalDarkTheme provides darkTheme,
    ) {
        MaterialTheme(
            colorScheme = EliteColorRoles.scheme(darkTheme, highContrast, accent),
            typography = EliteTypographyStyles,
            content = content,
        )
    }
}

@Composable
fun eliteTrackColor(): Color {
    return if (LocalDarkTheme.current) {
        EliteSurfaceColors.ELEVATED.toColor().copy(alpha = 0.72f)
    } else {
        EliteSurfaceColors.LIGHT_SURFACE_CONTAINER.toColor()
    }
}
