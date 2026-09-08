package com.fitconnect.android.designui.motion

import org.junit.Assert.assertEquals
import org.junit.Test

class EliteMotionTokensTest {
    @Test
    fun fastMediumSlowDurations() {
        assertEquals(120, EliteMotionTokens.durationMs(MotionToken.FAST, reduceMotion = false))
        assertEquals(260, EliteMotionTokens.durationMs(MotionToken.MEDIUM, reduceMotion = false))
        assertEquals(420, EliteMotionTokens.durationMs(MotionToken.SLOW, reduceMotion = false))
        assertEquals(0, EliteMotionTokens.durationMs(MotionToken.FAST, reduceMotion = true))
    }
}
