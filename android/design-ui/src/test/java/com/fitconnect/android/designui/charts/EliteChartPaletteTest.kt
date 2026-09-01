package com.fitconnect.android.designui.charts

import com.fitconnect.android.design.EliteSurfaceCharts
import com.fitconnect.android.designui.theme.toColor
import org.junit.Assert.assertEquals
import org.junit.Test

class EliteChartPaletteTest {
    @Test
    fun paletteMatchesApprovedSpec() {
        assertEquals(EliteSurfaceCharts.VOLTLINE.toColor(), EliteChartPalette.Hero)
        assertEquals(EliteSurfaceCharts.SUCCESS.toColor(), EliteChartPalette.Success)
        assertEquals(EliteSurfaceCharts.NEGATIVE.toColor(), EliteChartPalette.Negative)
        assertEquals(EliteSurfaceCharts.SECONDARY.toColor(), EliteChartPalette.Secondary)
        assertEquals(EliteSurfaceCharts.MUTED.toColor(), EliteChartPalette.Muted)
        assertEquals(EliteSurfaceCharts.AXIS.toColor(), EliteChartPalette.Axis)
    }

    @Test
    fun zonePaletteFollowsGarminConvention() {
        assertEquals(EliteSurfaceCharts.ZONE_1.toColor(), EliteChartPalette.zone(1))
        assertEquals(EliteSurfaceCharts.ZONE_2.toColor(), EliteChartPalette.zone(2))
        assertEquals(EliteSurfaceCharts.ZONE_3.toColor(), EliteChartPalette.zone(3))
        assertEquals(EliteSurfaceCharts.ZONE_4.toColor(), EliteChartPalette.zone(4))
        assertEquals(EliteSurfaceCharts.ZONE_5.toColor(), EliteChartPalette.zone(5))
    }
}
