package com.fitconnect.android.designui.neumorphic

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.graphics.drawscope.Stroke
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteNavItem
import com.fitconnect.android.designui.components.EliteNavTab
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteNavChrome
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

/**
 * Full-width glass dock with a circular TRAIN cradle.
 */
@Composable
fun EosPremiumBottomNavigation(
    items: List<EliteNavItem>,
    modifier: Modifier = Modifier,
    onTrainClick: (() -> Unit)? = null,
    trainSelected: Boolean = false,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val mold = EliteSurfaceColors.MOLD_SURFACE.toColor()
    val rim = EliteSurfaceColors.ON_SURFACE.toColor().copy(alpha = EliteOpacity.Border)
    val cradle = onTrainClick != null && items.size >= 4
    val left = if (cradle) items.take(2) else items
    val right = if (cradle) items.drop(2) else emptyList()

    Box(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(if (cradle) EliteNavChrome.Dock else EliteNavChrome.Bar)
                .align(Alignment.BottomCenter),
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(EliteNavChrome.Bar)
                    .align(Alignment.BottomCenter),
            ) {
                val barH = size.height
                val path = Path()
                if (cradle) {
                    val r = EliteNavChrome.CradleRadius.toPx()
                    val cx = size.width / 2f
                    path.moveTo(0f, 0f)
                    path.lineTo(cx - r, 0f)
                    path.arcTo(
                        rect = Rect(cx - r, -r, cx + r, r),
                        startAngleDegrees = 180f,
                        sweepAngleDegrees = 180f,
                        forceMoveTo = false,
                    )
                    path.lineTo(size.width, 0f)
                } else {
                    path.moveTo(0f, 0f)
                    path.lineTo(size.width, 0f)
                }
                path.lineTo(size.width, barH)
                path.lineTo(0f, barH)
                path.close()
                drawPath(path, mold.copy(alpha = EliteOpacity.Glass), style = Fill)
                drawPath(
                    path,
                    rim,
                    style = Stroke(width = EliteBorder.Hairline.toPx()),
                )
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(EliteNavChrome.Bar)
                    .align(Alignment.BottomCenter)
                    .padding(horizontal = EliteSpace.Xs),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                left.forEach { item ->
                    EliteNavTab(item = item, selectedColor = volt, docked = true)
                }
                if (cradle) {
                    Spacer(Modifier.width(EliteNavChrome.Fab))
                    right.forEach { item ->
                        EliteNavTab(item = item, selectedColor = volt, docked = true)
                    }
                }
            }
        }
        if (onTrainClick != null) {
            EosTrainActionFab(
                onClick = onTrainClick,
                selected = trainSelected,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .offset(y = -EliteNavChrome.FabLift),
            )
        }
    }
}
