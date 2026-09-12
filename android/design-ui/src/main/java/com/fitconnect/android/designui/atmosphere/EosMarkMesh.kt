package com.fitconnect.android.designui.atmosphere

import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.PaintingStyle
import com.fitconnect.android.designui.brand.EosMarkGeometry
import kotlin.math.ceil

/**
 * Sparse FitConnect circular-mark geometry for premium Floor atmosphere.
 */
object EosMarkMesh {
    fun tilePeriod(cellRadius: Float): Pair<Float, Float> {
        val size = (cellRadius * 5.6f).coerceAtLeast(96f)
        return size to size
    }
}

internal fun renderMarkTile(cellRadius: Float, color: Color, strokePx: Float): ImageBitmap {
    val (periodW, periodH) = EosMarkMesh.tilePeriod(cellRadius)
    val width = ceil(periodW.toDouble()).toInt().coerceAtLeast(32)
    val height = ceil(periodH.toDouble()).toInt().coerceAtLeast(32)
    val bitmap = ImageBitmap(width, height)
    val canvas = Canvas(bitmap)
    val dim = (cellRadius * 2.4f).coerceAtLeast(36f)
    val left = (width - dim) * 0.5f
    val top = (height - dim) * 0.42f
    val paint = Paint().apply {
        this.color = color
        style = PaintingStyle.Stroke
        strokeWidth = strokePx.coerceAtLeast(1.1f)
        isAntiAlias = true
    }
    canvas.save()
    canvas.translate(left, top)
    EosMarkGeometry.meshPaths(dim).forEach { canvas.drawPath(it, paint) }
    canvas.restore()
    return bitmap
}
