package com.fitconnect.android.designui.theme

import com.fitconnect.android.design.EliteSurfaceColors
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class EliteColorRolesTest {
    @Test
    fun darkBackgroundIsLiftedOffFloor() {
        val bg = EliteColorRoles.backgroundArgb(dark = true, highContrast = false)
        assertEquals(EliteSurfaceColors.CARBON, bg)
        assertNotEquals(EliteSurfaceColors.FLOOR, bg)
    }

    @Test
    fun lightUsesPaperTokens() {
        assertEquals(
            EliteSurfaceColors.LIGHT_FLOOR,
            EliteColorRoles.backgroundArgb(dark = false, highContrast = false),
        )
        assertEquals(
            EliteSurfaceColors.LIGHT_ON_SURFACE,
            EliteColorRoles.onSurfaceArgb(dark = false),
        )
        assertEquals(EliteSurfaceColors.FLOOR, EliteColorRoles.onSurfaceArgb(dark = false))
    }

    @Test
    fun darkOnSurfaceStaysReadable() {
        assertEquals(EliteSurfaceColors.ON_SURFACE, EliteColorRoles.onSurfaceArgb(dark = true))
        assertEquals(
            EliteSurfaceColors.SURFACE_CONTAINER,
            EliteColorRoles.surfaceArgb(dark = true, highContrast = false),
        )
    }
}
