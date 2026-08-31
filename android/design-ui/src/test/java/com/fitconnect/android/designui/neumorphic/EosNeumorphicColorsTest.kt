package com.fitconnect.android.designui.neumorphic

import com.fitconnect.android.design.EliteSurfaceColors
import org.junit.Assert.assertEquals
import org.junit.Test

class EosNeumorphicColorsTest {

    @Test
    fun moldTokensMatchDesignPackage() {
        assertEquals(0xFF0D1321L, EliteSurfaceColors.MOLD_SURFACE)
        assertEquals(0xFF161F34L, EliteSurfaceColors.NEU_HIGHLIGHT_EDGE)
        assertEquals(0xFF020408L, EliteSurfaceColors.NEU_SHADOW_DEEP)
        assertEquals(0xFF8A99ADL, EliteSurfaceColors.NEU_MUTED)
    }
}
