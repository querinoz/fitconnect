package com.fitconnect.android.designui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.atmosphere.HoneycombMesh
import com.fitconnect.android.designui.theme.EliteBorder

@Composable
fun HoneycombDivider(
    modifier: Modifier = Modifier,
    tint: Color = MaterialTheme.colorScheme.primary,
) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(16.dp)
            .testTag("honeycomb_divider"),
    ) {
        val y = size.height / 2f
        val stroke = EliteBorder.Hairline.toPx().coerceAtLeast(1f)
        val radius = size.height * 0.28f
        val centerX = size.width / 2f
        val gap = radius * 1.9f

        drawLine(
            color = tint.copy(alpha = 0.18f),
            start = Offset(0f, y),
            end = Offset((centerX - gap).coerceAtLeast(0f), y),
            strokeWidth = stroke,
        )
        drawLine(
            color = tint.copy(alpha = 0.18f),
            start = Offset((centerX + gap).coerceAtMost(size.width), y),
            end = Offset(size.width, y),
            strokeWidth = stroke,
        )

        val verts = HoneycombMesh.hexVertices(centerX, y, radius)
        val path = Path().apply {
            moveTo(verts[0], verts[1])
            var index = 2
            while (index < verts.size) {
                lineTo(verts[index], verts[index + 1])
                index += 2
            }
            close()
        }
        drawPath(
            path = path,
            color = tint.copy(alpha = 0.42f),
            style = Stroke(width = stroke),
        )
        drawLine(
            color = tint.copy(alpha = 0.24f),
            start = Offset(centerX - radius * 0.6f, y),
            end = Offset(centerX + radius * 0.6f, y),
            strokeWidth = stroke,
        )
    }
}
