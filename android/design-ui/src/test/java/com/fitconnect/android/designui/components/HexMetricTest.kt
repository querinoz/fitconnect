package com.fitconnect.android.designui.components

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class HexMetricTest {
    @Test
    fun normalizedProgressClampsToBounds() {
        assertEquals(0f, normalizedHexProgress(-12), 0.0001f)
        assertEquals(0.42f, normalizedHexProgress(42), 0.0001f)
        assertEquals(1f, normalizedHexProgress(120), 0.0001f)
    }

    @Test
    fun edgeFractionsFillOneHexSideAtATime() {
        assertEquals(listOf(0f, 0f, 0f, 0f, 0f, 0f), hexProgressEdgeFractions(0))
        assertEquals(listOf(1f, 1f, 1f, 0f, 0f, 0f), hexProgressEdgeFractions(50))
        assertEquals(listOf(1f, 1f, 1f, 1f, 1f, 1f), hexProgressEdgeFractions(100))

        val quarter = hexProgressEdgeFractions(25)
        assertEquals(1f, quarter[0], 0.0001f)
        assertTrue(quarter[1] in 0.49f..0.51f)
        assertEquals(0f, quarter[2], 0.0001f)
    }
}
