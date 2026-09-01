package com.fitconnect.android.designui.neumorphic

import com.fitconnect.android.design.EliteSurfaceCharts
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceGlass
import com.fitconnect.android.design.EliteSurfaceRadius
import com.fitconnect.android.designui.theme.toColor
import org.junit.Assert.assertEquals
import org.junit.Test

class EosGlassColorsTest {

    @Test
    fun glassColorsMatchGeneratedTokens() {
        assertEquals(0x12FFFFFFL, EliteSurfaceColors.GLASS_BG)
        assertEquals(0x21FFFFFFL, EliteSurfaceColors.GLASS_BORDER)
        assertEquals(EosGlassColors.Fill, EliteSurfaceColors.GLASS_BG.toColor())
        assertEquals(EosGlassColors.Border, EliteSurfaceColors.GLASS_BORDER.toColor())
    }

    @Test
    fun glassBlurAndRadiusTokensAreCanonical() {
        assertEquals(12, EliteSurfaceGlass.BLUR_STANDARD)
        assertEquals(10, EliteSurfaceGlass.BLUR_MIN)
        assertEquals(16, EliteSurfaceGlass.BLUR_MAX)
        assertEquals(20, EliteSurfaceRadius.NEUMORPHIC)
    }

    @Test
    fun chartPaletteMatchesApprovedSpec() {
        assertEquals(0xFFC8FF00L, EliteSurfaceColors.CHART_VOLTLINE)
        assertEquals(0xFF7ED957L, EliteSurfaceColors.CHART_SUCCESS)
        assertEquals(0xFFE24B4AL, EliteSurfaceColors.CHART_NEGATIVE)
        assertEquals(0xFF5B9BD1L, EliteSurfaceColors.CHART_SECONDARY)
        assertEquals(0xFF262F47L, EliteSurfaceColors.CHART_MUTED)
        assertEquals(0xFF5B6478L, EliteSurfaceColors.CHART_AXIS)
        assertEquals(0xFF5B9BD1L, EliteSurfaceColors.CHART_ZONE_1)
        assertEquals(0xFF5DCAA5L, EliteSurfaceColors.CHART_ZONE_2)
        assertEquals(0xFF97C459L, EliteSurfaceColors.CHART_ZONE_3)
        assertEquals(0xFFEF9F27L, EliteSurfaceColors.CHART_ZONE_4)
        assertEquals(0xFFE24B4AL, EliteSurfaceColors.CHART_ZONE_5)
    }

    @Test
    fun chartSemanticRolesResolveToPalette() {
        assertEquals(EliteSurfaceColors.CHART_VOLTLINE, EliteSurfaceCharts.VOLTLINE)
        assertEquals(EliteSurfaceColors.CHART_SUCCESS, EliteSurfaceCharts.SUCCESS)
        assertEquals(EliteSurfaceColors.CHART_NEGATIVE, EliteSurfaceCharts.NEGATIVE)
        assertEquals(EliteSurfaceColors.CHART_ZONE_3, EliteSurfaceCharts.ZONE_3)
    }
}
