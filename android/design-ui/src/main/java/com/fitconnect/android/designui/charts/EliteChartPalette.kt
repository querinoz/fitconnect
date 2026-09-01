package com.fitconnect.android.designui.charts

import androidx.compose.ui.graphics.Color
import com.fitconnect.android.design.EliteSurfaceCharts
import com.fitconnect.android.designui.theme.toColor

/**
 * Canonical neu-glass chart colours — mirrors [EliteSurfaceCharts] semantic roles.
 */
object EliteChartPalette {
    val Hero = EliteSurfaceCharts.VOLTLINE.toColor()
    val Success = EliteSurfaceCharts.SUCCESS.toColor()
    val Negative = EliteSurfaceCharts.NEGATIVE.toColor()
    val Secondary = EliteSurfaceCharts.SECONDARY.toColor()
    val Muted = EliteSurfaceCharts.MUTED.toColor()
    val Axis = EliteSurfaceCharts.AXIS.toColor()

    fun zone(level: Int): Color = when (level.coerceIn(1, 5)) {
        1 -> EliteSurfaceCharts.ZONE_1.toColor()
        2 -> EliteSurfaceCharts.ZONE_2.toColor()
        3 -> EliteSurfaceCharts.ZONE_3.toColor()
        4 -> EliteSurfaceCharts.ZONE_4.toColor()
        5 -> EliteSurfaceCharts.ZONE_5.toColor()
        else -> Muted
    }

    val zones: List<Color> = listOf(
        zone(1), zone(2), zone(3), zone(4), zone(5),
    )
}

data class EliteWeeklyLoadBar(
    val label: String,
    val load: Float,
    val isToday: Boolean = false,
)

data class EliteZoneSegment(
    val zone: Int,
    val minutes: Int,
    val label: String = "Z$zone",
)
