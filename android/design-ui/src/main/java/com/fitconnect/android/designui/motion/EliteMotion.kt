package com.fitconnect.android.designui.motion

import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import com.fitconnect.android.design.EliteSurfaceMotion
import com.fitconnect.android.designui.theme.reduceMotionEnabled

enum class EliteMotionPreset {
    FADE,
    SLIDE,
    SCALE,
    CARD_EXPAND,
    BOTTOM_SHEET,
    NAVIGATION,
    MICRO,
    LOADING,
    SUCCESS,
    ERROR,
    PAGE,
}

object EliteMotion {
    fun durationMs(preset: EliteMotionPreset, reduceMotion: Boolean): Int {
        if (reduceMotion) return 0
        return when (preset) {
            EliteMotionPreset.MICRO, EliteMotionPreset.SUCCESS, EliteMotionPreset.ERROR ->
                EliteSurfaceMotion.MICRO_MS
            EliteMotionPreset.FADE, EliteMotionPreset.SCALE, EliteMotionPreset.CARD_EXPAND ->
                EliteSurfaceMotion.UI_MS
            EliteMotionPreset.SLIDE, EliteMotionPreset.BOTTOM_SHEET, EliteMotionPreset.NAVIGATION,
            EliteMotionPreset.PAGE,
            -> EliteSurfaceMotion.SCREEN_MS
            EliteMotionPreset.LOADING -> EliteSurfaceMotion.DATA_MS
        }
    }

    fun <T> spec(preset: EliteMotionPreset, reduceMotion: Boolean): AnimationSpec<T> =
        tween(
            durationMillis = durationMs(preset, reduceMotion),
            easing = FastOutSlowInEasing,
        )
}

@Composable
fun <T> eliteMotionSpec(preset: EliteMotionPreset): AnimationSpec<T> =
    EliteMotion.spec(preset, reduceMotionEnabled())
