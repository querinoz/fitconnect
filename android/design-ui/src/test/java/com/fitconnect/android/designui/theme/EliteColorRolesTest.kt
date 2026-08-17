package com.fitconnect.android.designui.theme

import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.foundation.theme.AccentPreset
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class EliteColorRolesTest {
    @Test
    fun darkBackgroundIsObsidianFloor() {
        val bg = EliteColorRoles.backgroundArgb(dark = true, highContrast = false)
        assertEquals(EliteSurfaceColors.FLOOR, bg)
        assertEquals(
            EliteSurfaceColors.FLOOR,
            EliteColorRoles.backgroundArgb(dark = true, highContrast = true),
        )
        assertNotEquals(EliteSurfaceColors.CARBON, bg)
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
    fun darkPrimaryFollowsVoltSpectrumAccent() {
        assertEquals(
            EliteSurfaceColors.VOLTLINE,
            EliteColorRoles.primaryArgb(dark = true, accent = AccentPreset.VOLTLINE),
        )
        assertEquals(
            EliteSurfaceColors.VOLT_400,
            EliteColorRoles.primaryArgb(dark = true, accent = AccentPreset.VOLT_400),
        )
        assertEquals(
            EliteSurfaceColors.VOLT_600,
            EliteColorRoles.primaryArgb(dark = false, accent = AccentPreset.VOLTLINE),
        )
    }

    @Test
    fun glassLadderKeepsReadableFloor() {
        assertEquals(0.72f, com.fitconnect.android.design.EliteSurfaceGlass.L_2, 0.0f)
        assertEquals(
            com.fitconnect.android.design.EliteSurfaceOpacity.GLASS,
            com.fitconnect.android.design.EliteSurfaceGlass.L_2,
            0.0f,
        )
        assertEquals(20, com.fitconnect.android.design.EliteSurfaceSpacing.INSET)
        assertEquals(40, com.fitconnect.android.design.EliteSurfaceSpacing.SECTION)
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
