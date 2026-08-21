package com.fitconnect.android.wear

import android.os.Build
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.dynamicColorScheme
import com.fitconnect.android.design.EliteSurfaceColors

internal val LocalWearAmbient = androidx.compose.runtime.staticCompositionLocalOf { false }

fun eliteWearColorScheme(): ColorScheme {
    val volt = Color(EliteSurfaceColors.VOLTLINE)
    val voltDim = Color(EliteSurfaceColors.VOLT_600)
    val floor = Color(EliteSurfaceColors.FLOOR)
    val onSurface = Color(EliteSurfaceColors.ON_SURFACE)
    val muted = Color(EliteSurfaceColors.ON_SURFACE_MUTED)
    val connect = Color(EliteSurfaceColors.CONNECT)
    val telemetry = Color(EliteSurfaceColors.TELEMETRY)
    val carbon = Color(EliteSurfaceColors.CARBON)
    val alert = Color(EliteSurfaceColors.ALERT)
    return ColorScheme(
        primary = volt,
        primaryDim = voltDim,
        primaryContainer = voltDim,
        onPrimary = floor,
        onPrimaryContainer = onSurface,
        secondary = connect,
        secondaryDim = connect.copy(alpha = 0.72f),
        secondaryContainer = connect.copy(alpha = 0.2f),
        onSecondary = floor,
        onSecondaryContainer = onSurface,
        tertiary = telemetry,
        tertiaryDim = telemetry.copy(alpha = 0.72f),
        tertiaryContainer = telemetry.copy(alpha = 0.2f),
        onTertiary = floor,
        onTertiaryContainer = onSurface,
        surfaceContainerLow = floor,
        surfaceContainer = carbon,
        surfaceContainerHigh = carbon.copy(alpha = 0.8f),
        onSurface = onSurface,
        onSurfaceVariant = muted,
        outline = muted.copy(alpha = 0.5f),
        outlineVariant = muted.copy(alpha = 0.2f),
        background = floor,
        onBackground = onSurface,
        error = alert,
        onError = floor,
        errorContainer = alert.copy(alpha = 0.2f),
        onErrorContainer = onSurface,
    )
}

fun ambientWearColorScheme(): ColorScheme {
    val white = Color(EliteSurfaceColors.ON_SURFACE)
    val black = Color(EliteSurfaceColors.FLOOR)
    return ColorScheme(
        primary = white,
        primaryDim = white.copy(alpha = 0.72f),
        primaryContainer = black,
        onPrimary = black,
        onPrimaryContainer = white,
        secondary = white,
        secondaryDim = white.copy(alpha = 0.72f),
        secondaryContainer = black,
        onSecondary = black,
        onSecondaryContainer = white,
        tertiary = white,
        tertiaryDim = white.copy(alpha = 0.72f),
        tertiaryContainer = black,
        onTertiary = black,
        onTertiaryContainer = white,
        surfaceContainerLow = black,
        surfaceContainer = black,
        surfaceContainerHigh = black,
        onSurface = white,
        onSurfaceVariant = white.copy(alpha = 0.72f),
        outline = white.copy(alpha = 0.4f),
        outlineVariant = white.copy(alpha = 0.2f),
        background = black,
        onBackground = white,
        error = white,
        onError = black,
        errorContainer = black,
        onErrorContainer = white,
    )
}

/**
 * Wear dynamic color for surfaces only. Volt / Connect stay the brand accents
 * so Material You cannot replace `#C8FF00`.
 */
@Composable
fun rememberEliteWearColorScheme(ambient: Boolean): ColorScheme {
    val context = LocalContext.current
    val elite = remember { eliteWearColorScheme() }
    val dynamic = remember(context) {
        if (Build.VERSION.SDK_INT >= 31) {
            runCatching { dynamicColorScheme(context) }.getOrNull()
        } else {
            null
        }
    }
    val merged = remember(dynamic, elite) {
        val source = dynamic ?: return@remember elite
        elite.copy(
            surfaceContainerLow = source.surfaceContainerLow,
            surfaceContainer = source.surfaceContainer,
            surfaceContainerHigh = source.surfaceContainerHigh,
            onSurface = source.onSurface,
            onSurfaceVariant = source.onSurfaceVariant,
            outline = source.outline,
            outlineVariant = source.outlineVariant,
            background = source.background,
            onBackground = source.onBackground,
        )
    }
    return if (ambient) ambientWearColorScheme() else merged
}
