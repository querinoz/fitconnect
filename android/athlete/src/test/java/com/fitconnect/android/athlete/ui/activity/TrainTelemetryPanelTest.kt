package com.fitconnect.android.athlete.ui.activity

import com.fitconnect.android.designui.charts.EliteChartPalette
import org.junit.Assert.assertEquals
import org.junit.Test

class TrainTelemetryPanelTest {

    @Test
    fun telemetryValueColor_usesChartPaletteSemantics() {
        assertEquals(EliteChartPalette.zone(3), telemetryValueColor("ZONE"))
        assertEquals(EliteChartPalette.Secondary, telemetryValueColor("GPS"))
        assertEquals(EliteChartPalette.Success, telemetryValueColor("ENERGY"))
    }
}
