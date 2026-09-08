package com.fitconnect.android.designui.atmosphere

import org.junit.Assert.assertEquals
import org.junit.Test

class HoneycombOverlayTest {
    @Test
    fun overlayHeightClampsCoverage() {
        assertEquals(0f, overlayHeightPx(240f, -1f), 0.0001f)
        assertEquals(67.2f, overlayHeightPx(240f, 0.28f), 0.0001f)
        assertEquals(240f, overlayHeightPx(240f, 3f), 0.0001f)
    }
}
