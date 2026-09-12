package com.fitconnect.android.designui.brand

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke

/**
 * Canonical FitConnect circular mark geometry (viewBox 0..320).
 * Double reticle + block F + ECG — matches brand-sources/fitconnect-logo-mark.svg.
 */
object EosMarkGeometry {
    const val VIEW = 320f
    const val CX = 160f
    const val CY = 142f
    const val OUTER_R = 108f
    const val INNER_R = 96f
    const val RING_STROKE = 3.5f
    const val INNER_STROKE = 1.75f
    const val TICK = 3.5f

    /** White F body — top bar (notch) + stem with ↗ foot cut. */
    fun fPath(size: Float): Path {
        val s = size / VIEW
        return Path().apply {
            moveTo(118f * s, 68f * s)
            lineTo(216f * s, 68f * s)
            lineTo(216f * s, 94f * s)
            lineTo(205f * s, 94f * s)
            lineTo(200f * s, 88f * s)
            lineTo(195f * s, 94f * s)
            lineTo(146f * s, 94f * s)
            lineTo(146f * s, 208f * s)
            lineTo(118f * s, 238f * s)
            close()
        }
    }

    /** Voltline mid-bar parallelogram. */
    fun midBarPath(size: Float): Path {
        val s = size / VIEW
        return Path().apply {
            moveTo(146f * s, 122f * s)
            lineTo(200f * s, 122f * s)
            lineTo(200f * s, 146f * s)
            lineTo(124f * s, 146f * s)
            close()
        }
    }

    fun ecgPath(size: Float): Path {
        val s = size / VIEW
        return Path().apply {
            moveTo(70f * s, 248f * s)
            lineTo(122f * s, 248f * s)
            lineTo(138f * s, 248f * s)
            lineTo(148f * s, 214f * s)
            lineTo(158f * s, 278f * s)
            lineTo(170f * s, 248f * s)
            lineTo(250f * s, 248f * s)
        }
    }

    /** Sparse outline paths for atmosphere mesh tiles. */
    fun meshPaths(size: Float): List<Path> = listOf(fPath(size), midBarPath(size), ecgPath(size))
}

fun DrawScope.drawFitConnectMark(
    sizePx: Float,
    volt: Color,
    white: Color,
    alpha: Float = 1f,
    glowAlpha: Float = 0f,
) {
    val s = sizePx / EosMarkGeometry.VIEW
    val cx = EosMarkGeometry.CX * s
    val cy = EosMarkGeometry.CY * s
    if (glowAlpha > 0.01f) {
        drawCircle(
            color = volt.copy(alpha = 0.14f * glowAlpha * alpha),
            radius = EosMarkGeometry.OUTER_R * s * 1.08f,
            center = Offset(cx, cy),
        )
    }
    drawCircle(
        color = volt.copy(alpha = alpha),
        radius = EosMarkGeometry.OUTER_R * s,
        center = Offset(cx, cy),
        style = Stroke(width = EosMarkGeometry.RING_STROKE * s),
    )
    drawCircle(
        color = volt.copy(alpha = alpha),
        radius = EosMarkGeometry.INNER_R * s,
        center = Offset(cx, cy),
        style = Stroke(width = EosMarkGeometry.INNER_STROKE * s),
    )
    val tick = EosMarkGeometry.TICK * s
    drawLine(white.copy(alpha = alpha), Offset(cx, 26f * s), Offset(cx, 44f * s), strokeWidth = tick, cap = StrokeCap.Square)
    drawLine(white.copy(alpha = alpha), Offset(cx, 240f * s), Offset(cx, 258f * s), strokeWidth = tick, cap = StrokeCap.Square)
    drawLine(white.copy(alpha = alpha), Offset(44f * s, cy), Offset(62f * s, cy), strokeWidth = tick, cap = StrokeCap.Square)
    drawLine(white.copy(alpha = alpha), Offset(258f * s, cy), Offset(276f * s, cy), strokeWidth = tick, cap = StrokeCap.Square)
    drawPath(EosMarkGeometry.fPath(sizePx), white.copy(alpha = alpha))
    drawPath(EosMarkGeometry.midBarPath(sizePx), volt.copy(alpha = alpha))
    drawPath(
        path = EosMarkGeometry.ecgPath(sizePx),
        color = volt.copy(alpha = alpha),
        style = Stroke(
            width = EosMarkGeometry.RING_STROKE * s,
            cap = StrokeCap.Square,
            join = StrokeJoin.Miter,
        ),
    )
}

/**
 * Legacy name retained for call sites / tests.
 * Bounding boxes approximate mark extents for regression checks.
 */
object EosBoltGeometry {
    const val VIEW = EosMarkGeometry.VIEW

    val TOP_POINTS = listOf(
        52f to 34f,
        268f to 34f,
        268f to 150f,
        52f to 150f,
    )

    val BOTTOM_POINTS = listOf(
        70f to 214f,
        250f to 214f,
        250f to 278f,
        70f to 278f,
    )

    fun topPath(size: Float): Path = EosMarkGeometry.fPath(size)

    fun bottomPath(size: Float): Path = EosMarkGeometry.ecgPath(size)

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
}
