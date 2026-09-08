package com.fitconnect.android.designui.motion

import androidx.compose.animation.core.SpringSpec
import androidx.compose.animation.core.TweenSpec
import com.fitconnect.android.design.EliteSurfaceMotion
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class EliteMotionTest {
    @Test
    fun reduceMotionForcesZeroDuration() {
        assertEquals(0, EliteMotion.durationMs(EliteMotionPreset.PAGE, reduceMotion = true))
    }

    @Test
    fun microUsesToken() {
        assertEquals(
            EliteSurfaceMotion.MICRO_MS,
            EliteMotion.durationMs(EliteMotionPreset.MICRO, reduceMotion = false),
        )
    }

    @Test
    fun springUsesMicroToken() {
        assertEquals(
            EliteSurfaceMotion.MICRO_MS,
            EliteMotion.durationMs(EliteMotionPreset.SPRING, reduceMotion = false),
        )
        assertEquals(0, EliteMotion.durationMs(EliteMotionPreset.SPRING, reduceMotion = true))
    }

    @Test
    fun motionAliasesMapToTokenDurations() {
        assertEquals(EliteSurfaceMotion.MICRO_MS, EliteMotion.motion.fast(reduceMotion = false))
        assertEquals(EliteSurfaceMotion.UI_MS, EliteMotion.motion.medium(reduceMotion = false))
        assertEquals(EliteSurfaceMotion.SCREEN_MS, EliteMotion.motion.slow(reduceMotion = false))
        assertEquals(0, EliteMotion.motion.fast(reduceMotion = true))
        assertEquals(0, EliteMotion.motion.medium(reduceMotion = true))
        assertEquals(0, EliteMotion.motion.slow(reduceMotion = true))
    }

    @Test
    fun springAliasesExposeExpectedProfiles() {
        assertEquals(EliteSpringProfile(0.9f, 260f), EliteMotion.springProfile(EliteSpringPreset.SOFT))
        assertEquals(EliteSpringProfile(0.82f, 380f), EliteMotion.springProfile(EliteSpringPreset.STANDARD))
        assertEquals(EliteSpringProfile(0.72f, 520f), EliteMotion.springProfile(EliteSpringPreset.STRONG))
    }

    @Test
    fun reducedMotionSwapsSpringsForZeroTween() {
        val soft = EliteMotion.spring.soft<Float>(reduceMotion = false)
        val reduced = EliteMotion.spring.soft<Float>(reduceMotion = true)
        assertTrue(soft is SpringSpec<Float>)
        assertTrue(reduced is TweenSpec<Float>)
        assertEquals(0, (reduced as TweenSpec<Float>).durationMillis)
    }
}
