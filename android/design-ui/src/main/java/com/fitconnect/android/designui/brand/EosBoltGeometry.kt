package com.fitconnect.android.designui.brand

import androidx.compose.ui.graphics.Path

/**
 * Split italic FitConnect bolt / S.
 * ViewBox 0..100 — top Voltline, bottom white, diagonal gap for assemble motion.
 */
object EosBoltGeometry {
    const val VIEW = 100f

    val TOP_POINTS = listOf(
        16f to 41f,
        28f to 9f,
        74f to 12f,
        68f to 29f,
        50f to 27f,
        46f to 40f,
        78f to 36f,
        64f to 57f,
        30f to 59f,
        38f to 43f,
        18f to 45f,
    )

    val BOTTOM_POINTS = listOf(
        26f to 64f,
        62f to 61f,
        50f to 76f,
        72f to 73f,
        54f to 94f,
        14f to 88f,
        26f to 76f,
        16f to 78f,
    )

    fun topPath(size: Float): Path = pathFrom(TOP_POINTS, size)

    fun bottomPath(size: Float): Path = pathFrom(BOTTOM_POINTS, size)

    fun extents(points: List<Pair<Float, Float>>, size: Float): FloatArray {
        val s = size / VIEW
        var minX = Float.POSITIVE_INFINITY
        var minY = Float.POSITIVE_INFINITY
        var maxX = Float.NEGATIVE_INFINITY
        var maxY = Float.NEGATIVE_INFINITY
        points.forEach { (x, y) ->
            val sx = x * s
            val sy = y * s
            if (sx < minX) minX = sx
            if (sy < minY) minY = sy
            if (sx > maxX) maxX = sx
            if (sy > maxY) maxY = sy
        }
        return floatArrayOf(minX, minY, maxX, maxY)
    }

    private fun pathFrom(points: List<Pair<Float, Float>>, size: Float): Path {
        val s = size / VIEW
        return Path().apply {
            val first = points.first()
            moveTo(first.first * s, first.second * s)
            points.drop(1).forEach { (x, y) -> lineTo(x * s, y * s) }
            close()
        }
    }
}
