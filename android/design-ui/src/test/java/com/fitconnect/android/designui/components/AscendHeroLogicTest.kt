package com.fitconnect.android.designui.components

import org.junit.Assert.assertEquals
import org.junit.Test

class AscendHeroLogicTest {
    @Test
    fun chunkFillClampsEmptyAndFull() {
        assertEquals(0, AscendHeroLogic.chunkFill(0, AscendHeroLogic.STREAK_CYCLE_DAYS))
        assertEquals(0, AscendHeroLogic.chunkFill(-4, AscendHeroLogic.STREAK_CYCLE_DAYS))
        assertEquals(11, AscendHeroLogic.chunkFill(21, AscendHeroLogic.STREAK_CYCLE_DAYS))
        assertEquals(11, AscendHeroLogic.chunkFill(40, AscendHeroLogic.STREAK_CYCLE_DAYS))
    }

    @Test
    fun chunkFillMatchesContractRatios() {
        assertEquals(7, AscendHeroLogic.chunkFill(14, AscendHeroLogic.STREAK_CYCLE_DAYS))
        assertEquals(6, AscendHeroLogic.chunkFill(7, AscendHeroLogic.TELEMETRY_CAP))
    }

    @Test
    fun spacedWordmarkInsertsCapsTracking() {
        assertEquals("A S C E N D", AscendHeroLogic.spacedWordmark("ASCEND"))
        assertEquals("F I T C O N N E C T", AscendHeroLogic.spacedWordmark("FITCONNECT"))
        assertEquals("", AscendHeroLogic.spacedWordmark("   "))
    }
}
