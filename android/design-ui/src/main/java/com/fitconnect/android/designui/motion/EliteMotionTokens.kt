package com.fitconnect.android.designui.motion

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.SpringSpec
import androidx.compose.animation.core.spring
import androidx.compose.runtime.Composable
import com.fitconnect.android.designui.theme.reduceMotionEnabled

/**
 * Zenith motion tokens — aliases over EliteSurfaceMotion / springs.
 * Visual DNA: Press 100–140 · Micro 150–200 · Card 220–280 · Nav 250–350 · Hero 350–500.
 * Respects reduced motion via [reduceMotionEnabled].
 */
object EliteMotionTokens {
    const val FAST_MS = 120
    const val MEDIUM_MS = 260
    const val SLOW_MS = 420

    fun durationMs(token: MotionToken, reduceMotion: Boolean): Int {
        if (reduceMotion) return 0
        return when (token) {
            MotionToken.FAST -> FAST_MS
            MotionToken.MEDIUM -> MEDIUM_MS
            MotionToken.SLOW -> SLOW_MS
        }
    }

    fun <T> springSoft(): SpringSpec<T> =
        spring(dampingRatio = 0.9f, stiffness = Spring.StiffnessLow)

    fun <T> springStandard(): SpringSpec<T> =
        spring(dampingRatio = 0.82f, stiffness = 380f)

    fun <T> springStrong(): SpringSpec<T> =
        spring(dampingRatio = 0.72f, stiffness = Spring.StiffnessMedium)
}

enum class MotionToken { FAST, MEDIUM, SLOW }

@Composable
fun motionDurationMs(token: MotionToken): Int =
    EliteMotionTokens.durationMs(token, reduceMotionEnabled())
