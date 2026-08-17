package com.fitconnect.android.designui.atmosphere

import com.fitconnect.android.design.EliteSurfaceAtmosphere
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

data class HoneycombLayout(
    val radius: Float,
    val centers: List<Pair<Float, Float>>,
)

/**
 * Hex mesh geometry for Elite Surface atmosphere.
 * Draw cost is one cached stroke path plus a handful of pulse fills —
 * never one drawPath per cell, never rebuilt every frame.
 */
object HoneycombMesh {
    val maxCells: Int get() = EliteSurfaceAtmosphere.HONEYCOMB_MAX_CELLS
    val pulseCells: Int get() = EliteSurfaceAtmosphere.HONEYCOMB_PULSE_CELLS
    val coverage: Float get() = EliteSurfaceAtmosphere.HONEYCOMB_COVERAGE
    val budgetNs: Long
        get() = (EliteSurfaceAtmosphere.HONEYCOMB_BUDGET_MS * 1_000_000L).toLong()

    fun radiusFor(width: Float, height: Float, preferred: Float): Float {
        var radius = preferred.coerceAtLeast(8f)
        var guard = 0
        while (estimateCellCount(width, height, radius) > maxCells && guard < 24) {
            radius *= 1.12f
            guard++
        }
        return radius
    }

    fun estimateCellCount(width: Float, height: Float, radius: Float): Int {
        if (width <= 0f || height <= 0f || radius <= 0f) return 0
        val colW = radius * 1.5f
        val rowH = (sqrt(3.0) * radius).toFloat()
        val cols = ceil((width / colW).toDouble()).toInt() + 2
        val rows = ceil(((height * coverage) / rowH).toDouble()).toInt() + 2
        return (cols * rows).coerceAtLeast(0)
    }

    fun layout(width: Float, height: Float, preferredRadius: Float): HoneycombLayout {
        if (width <= 0f || height <= 0f) {
            return HoneycombLayout(radius = preferredRadius.coerceAtLeast(8f), centers = emptyList())
        }
        val radius = radiusFor(width, height, preferredRadius)
        val colW = radius * 1.5f
        val rowH = (sqrt(3.0) * radius).toFloat()
        val fadeUntil = height * coverage
        val centers = ArrayList<Pair<Float, Float>>(min(maxCells, 64))
        var row = 0
        var y = -radius
        while (y <= fadeUntil + radius && centers.size < maxCells) {
            val xOff = if (row % 2 == 0) 0f else colW * 0.5f
            var x = -radius + xOff
            while (x <= width + radius && centers.size < maxCells) {
                centers.add(x to y)
                x += colW
            }
            row++
            y += rowH
        }
        return HoneycombLayout(radius = radius, centers = centers)
    }

    fun hexVertices(cx: Float, cy: Float, radius: Float): FloatArray {
        val out = FloatArray(12)
        var i = 0
        var a = 0
        while (a < 6) {
            val rad = Math.toRadians(60.0 * a)
            out[i++] = (cx + radius * cos(rad)).toFloat()
            out[i++] = (cy + radius * sin(rad)).toFloat()
            a++
        }
        return out
    }

    fun tilePeriod(radius: Float): Pair<Float, Float> {
        val safe = radius.coerceAtLeast(8f)
        val colW = safe * 1.5f
        val rowH = (sqrt(3.0) * safe).toFloat()
        return (colW * 2f) to (rowH * 2f)
    }

    /** Tiled shader rect + vertical fade + optional pulse fills. */
    fun perFrameDrawOps(animated: Boolean): Int =
        2 + if (animated) pulseCells else 0

    fun passesCellBudget(layout: HoneycombLayout): Boolean =
        layout.centers.size in 1..maxCells

    fun medianLayoutNs(width: Float, height: Float, radius: Float, samples: Int = 41): Long {
        layout(width, height, radius)
        val times = LongArray(samples)
        repeat(samples) { index ->
            val started = System.nanoTime()
            layout(width, height, radius)
            times[index] = System.nanoTime() - started
        }
        times.sort()
        return times[samples / 2]
    }
}
