package com.fitconnect.android.designui.motion

import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.SpringSpec
import androidx.compose.animation.core.spring
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
    SPRING,
    DECELERATE,
    EMPHASIS,
    ENTER,
    EXIT,
}

enum class EliteMotionSpeed {
    FAST,
    MEDIUM,
    SLOW,
}

enum class EliteSpringPreset {
    SOFT,
    STANDARD,
    STRONG,
}

data class EliteSpringProfile(
    val dampingRatio: Float,
    val stiffness: Float,
)

object EliteMotion {
    fun durationMs(preset: EliteMotionPreset, reduceMotion: Boolean): Int {
        if (reduceMotion) return 0
        return when (preset) {
            EliteMotionPreset.MICRO, EliteMotionPreset.SUCCESS, EliteMotionPreset.ERROR,
            EliteMotionPreset.SPRING,
            -> EliteSurfaceMotion.MICRO_MS
            EliteMotionPreset.FADE, EliteMotionPreset.SCALE, EliteMotionPreset.CARD_EXPAND,
            EliteMotionPreset.DECELERATE, EliteMotionPreset.EMPHASIS,
            -> EliteSurfaceMotion.UI_MS
            EliteMotionPreset.SLIDE, EliteMotionPreset.BOTTOM_SHEET, EliteMotionPreset.NAVIGATION,
            EliteMotionPreset.PAGE, EliteMotionPreset.ENTER, EliteMotionPreset.EXIT,
            -> EliteSurfaceMotion.SCREEN_MS
            EliteMotionPreset.LOADING -> EliteSurfaceMotion.DATA_MS
        }
    }

    fun <T> spec(preset: EliteMotionPreset, reduceMotion: Boolean): AnimationSpec<T> {
        if (reduceMotion) return tween(0)
        return when (preset) {
            EliteMotionPreset.MICRO, EliteMotionPreset.SPRING ->
                spring(dampingRatio = 0.82f, stiffness = 380f)
            else -> tween(
                durationMillis = durationMs(preset, reduceMotion = false),
                easing = FastOutSlowInEasing,
            )
        }
    }

    fun aliasDurationMs(speed: EliteMotionSpeed, reduceMotion: Boolean): Int {
        if (reduceMotion) return 0
        return when (speed) {
            EliteMotionSpeed.FAST -> EliteSurfaceMotion.MICRO_MS
            EliteMotionSpeed.MEDIUM -> EliteSurfaceMotion.UI_MS
            EliteMotionSpeed.SLOW -> EliteSurfaceMotion.SCREEN_MS
        }
    }

    fun springProfile(preset: EliteSpringPreset): EliteSpringProfile = when (preset) {
        EliteSpringPreset.SOFT -> EliteSpringProfile(dampingRatio = 0.9f, stiffness = 260f)
        EliteSpringPreset.STANDARD -> EliteSpringProfile(dampingRatio = 0.82f, stiffness = 380f)
        EliteSpringPreset.STRONG -> EliteSpringProfile(dampingRatio = 0.72f, stiffness = 520f)
    }

    fun <T> springSpec(preset: EliteSpringPreset, reduceMotion: Boolean): AnimationSpec<T> {
        if (reduceMotion) return tween(0)
        val profile = springProfile(preset)
        return spring(
            dampingRatio = profile.dampingRatio,
            stiffness = profile.stiffness,
        )
    }

    val motion = MotionAliases
    val spring = SpringAliases

    object MotionAliases {
        fun fast(reduceMotion: Boolean): Int = aliasDurationMs(EliteMotionSpeed.FAST, reduceMotion)
        fun medium(reduceMotion: Boolean): Int = aliasDurationMs(EliteMotionSpeed.MEDIUM, reduceMotion)
        fun slow(reduceMotion: Boolean): Int = aliasDurationMs(EliteMotionSpeed.SLOW, reduceMotion)

        @Composable
        fun fast(): Int = fast(reduceMotionEnabled())

        @Composable
        fun medium(): Int = medium(reduceMotionEnabled())

        @Composable
        fun slow(): Int = slow(reduceMotionEnabled())
    }

    object SpringAliases {
        fun <T> soft(reduceMotion: Boolean): AnimationSpec<T> =
            springSpec(EliteSpringPreset.SOFT, reduceMotion)

        fun <T> standard(reduceMotion: Boolean): AnimationSpec<T> =
            springSpec(EliteSpringPreset.STANDARD, reduceMotion)

        fun <T> strong(reduceMotion: Boolean): AnimationSpec<T> =
            springSpec(EliteSpringPreset.STRONG, reduceMotion)

        @Composable
        fun <T> soft(): AnimationSpec<T> = soft(reduceMotionEnabled())

        @Composable
        fun <T> standard(): AnimationSpec<T> = standard(reduceMotionEnabled())

        @Composable
        fun <T> strong(): AnimationSpec<T> = strong(reduceMotionEnabled())
    }
}

@Composable
fun <T> eliteMotionSpec(preset: EliteMotionPreset): AnimationSpec<T> =
    EliteMotion.spec(preset, reduceMotionEnabled())
