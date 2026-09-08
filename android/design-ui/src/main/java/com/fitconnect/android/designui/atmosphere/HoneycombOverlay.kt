package com.fitconnect.android.designui.atmosphere

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageShader
import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.theme.EliteBorder

@Composable
fun HoneycombOverlay(
    modifier: Modifier = Modifier,
    tint: Color = MaterialTheme.colorScheme.primary,
    coverage: Float = 0.28f,
    alpha: Float = 0.08f,
) {
    val density = LocalDensity.current
    val radiusPx = with(density) { com.fitconnect.android.designui.theme.EliteAtmosphere.HoneycombCellRadius.toPx() }
    val strokePx = with(density) { EliteBorder.Hairline.toPx() }
    val tile = remember(radiusPx, tint, strokePx) {
        renderHexTile(radiusPx, tint, strokePx)
    }
    val brush = remember(tile) {
        ShaderBrush(ImageShader(tile, TileMode.Repeated, TileMode.Repeated))
    }

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .testTag("honeycomb_overlay"),
    ) {
        val overlayHeight = overlayHeightPx(size.height, coverage)
        if (overlayHeight > 0f) {
            drawRect(
                brush = brush,
                topLeft = androidx.compose.ui.geometry.Offset.Zero,
                size = Size(size.width, overlayHeight),
                alpha = alpha.coerceIn(0f, 1f),
            )
        }
    }
}

internal fun overlayHeightPx(height: Float, coverage: Float): Float =
    (height * coverage.coerceIn(0f, 1f)).coerceAtLeast(0f)
