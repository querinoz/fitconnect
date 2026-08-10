package com.fitconnect.android.designui.charts

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceCharts
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

/**
 * Shared chart kinds — feature modules supply points only; colour comes from tokens.
 */
enum class EliteChartKind {
    HRV,
    HEART_RATE,
    READINESS,
    SLEEP,
    RECOVERY,
    PERFORMANCE,
    TRAINING_LOAD,
    WEIGHT,
    HYDRATION,
}

data class EliteChartPoint(val x: Float, val y: Float)

data class EliteChartModel(
    val kind: EliteChartKind,
    val points: List<EliteChartPoint>,
    val contentDescription: String,
)

fun EliteChartKind.tokenColor(): Color = when (this) {
    EliteChartKind.HRV -> EliteSurfaceCharts.HRV.toColor()
    EliteChartKind.HEART_RATE -> EliteSurfaceCharts.HEART_RATE.toColor()
    EliteChartKind.READINESS -> EliteSurfaceCharts.READINESS.toColor()
    EliteChartKind.SLEEP -> EliteSurfaceCharts.SLEEP.toColor()
    EliteChartKind.RECOVERY -> EliteSurfaceCharts.RECOVERY.toColor()
    EliteChartKind.PERFORMANCE -> EliteSurfaceCharts.PERFORMANCE.toColor()
    EliteChartKind.TRAINING_LOAD -> EliteSurfaceCharts.TRAINING_LOAD.toColor()
    EliteChartKind.WEIGHT -> EliteSurfaceCharts.WEIGHT.toColor()
    EliteChartKind.HYDRATION -> EliteSurfaceCharts.HYDRATION.toColor()
}

/**
 * Single chart API for all physiology/performance series. No business logic —
 * pure presentation over [EliteChartModel].
 */
@Composable
fun EliteChart(
    model: EliteChartModel,
    modifier: Modifier = Modifier,
    height: Int = 160,
) {
    val stroke = model.kind.tokenColor()
    val grid = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(height.dp)
            .semantics { contentDescription = model.contentDescription },
    ) {
        // grid
        repeat(4) { i ->
            val y = size.height * (i / 3f)
            drawLine(grid, Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
        }
        val pts = model.points
        if (pts.size < 2) return@Canvas
        val minY = pts.minOf { it.y }
        val maxY = pts.maxOf { it.y }.coerceAtLeast(minY + 0.0001f)
        val minX = pts.minOf { it.x }
        val maxX = pts.maxOf { it.x }.coerceAtLeast(minX + 0.0001f)
        fun mapX(x: Float) = ((x - minX) / (maxX - minX)) * size.width
        fun mapY(y: Float) = size.height - ((y - minY) / (maxY - minY)) * size.height
        val path = Path()
        pts.forEachIndexed { index, p ->
            val o = Offset(mapX(p.x), mapY(p.y))
            if (index == 0) path.moveTo(o.x, o.y) else path.lineTo(o.x, o.y)
        }
        drawPath(
            path = path,
            color = stroke,
            style = Stroke(width = EliteSpace.Xxs.toPx() + 1f, cap = StrokeCap.Round),
        )
    }
}
