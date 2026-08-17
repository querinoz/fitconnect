package com.fitconnect.android.designui.motion

import com.fitconnect.android.design.EliteSurfaceMotion
import org.junit.Assert.assertEquals
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
}
