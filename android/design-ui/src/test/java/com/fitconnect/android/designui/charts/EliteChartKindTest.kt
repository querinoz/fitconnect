package com.fitconnect.android.designui.charts

import com.fitconnect.android.design.EliteSurfaceCharts
import com.fitconnect.android.designui.theme.toColor
import org.junit.Assert.assertEquals
import org.junit.Test

class EliteChartKindTest {
    @Test
    fun kindsResolveToChartTokens() {
        assertEquals(EliteChartPalette.Secondary, EliteChartKind.HRV.tokenColor())
        assertEquals(EliteChartPalette.Secondary, EliteChartKind.READINESS.tokenColor())
        assertEquals(EliteSurfaceCharts.NEGATIVE.toColor(), EliteChartKind.HEART_RATE.tokenColor())
        assertEquals(EliteChartPalette.Muted, EliteChartKind.TRAINING_LOAD.tokenColor())
    }
}
