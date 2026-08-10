package com.fitconnect.android.designui.charts

import com.fitconnect.android.design.EliteSurfaceCharts
import com.fitconnect.android.designui.theme.toColor
import org.junit.Assert.assertEquals
import org.junit.Test

class EliteChartKindTest {
    @Test
    fun kindsResolveToChartTokens() {
        assertEquals(EliteSurfaceCharts.READINESS.toColor(), EliteChartKind.READINESS.tokenColor())
        assertEquals(EliteSurfaceCharts.HRV.toColor(), EliteChartKind.HRV.tokenColor())
        assertEquals(EliteSurfaceCharts.HEART_RATE.toColor(), EliteChartKind.HEART_RATE.tokenColor())
    }
}
