package com.fitconnect.android.designui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.design.EliteSurfaceType
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

/**
 * Contract chrome for Ascend: peak mark · FITCONNECT / A S C E N D · hex score.
 */
@Composable
fun AscendCinematicHeader(
    hexScore: Int?,
    onMarkClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    Row(
        modifier = modifier
            .fillMaxWidth()
            .testTag("ascend_cinematic_header"),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Box(
            modifier = Modifier
                .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
                .clickable(onClick = onMarkClick)
                .semantics { contentDescription = "FitConnect home" },
            contentAlignment = Alignment.Center,
        ) {
            AscendPeakMark(
                size = EliteSurfaceInstrument.LOGO_MARK_DP.dp,
                color = volt,
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "FITCONNECT",
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = EliteSurfaceType.OVERLINE_TRACKING.sp,
                ),
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                text = AscendHeroLogic.spacedWordmark("ASCEND"),
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Medium,
                    letterSpacing = (EliteSurfaceType.OVERLINE_TRACKING * 2).sp,
                ),
                color = MaterialTheme.colorScheme.onBackground,
            )
        }
        if (hexScore != null) {
            HexBadge(
                text = hexScore.coerceIn(0, 99).toString(),
                tone = HexBadgeTone.Volt,
            )
        } else {
            Box(modifier = Modifier.size(Accessibility.MIN_TOUCH_TARGET_DP.dp))
        }
    }
}

@Composable
fun AscendPeakMark(
    size: Dp,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .size(size)
            .testTag("ascend_peak_mark")
            .semantics { contentDescription = Accessibility.decorative() }
            .drawBehind {
                val w = this.size.width
                val h = this.size.height
                val path = Path().apply {
                    moveTo(w * 0.50f, h * 0.08f)
                    lineTo(w * 0.92f, h * 0.92f)
                    lineTo(w * 0.72f, h * 0.92f)
                    lineTo(w * 0.50f, h * 0.42f)
                    lineTo(w * 0.28f, h * 0.92f)
                    lineTo(w * 0.08f, h * 0.92f)
                    close()
                }
                drawPath(path, color)
            },
    )
}

@Composable
fun AscendRangeSilhouette(
    modifier: Modifier = Modifier,
    color: Color = EliteSurfaceColors.INSTRUMENT_MUTED.toColor(),
) {
    Box(
        modifier = modifier
            .size(
                width = EliteSpace.Xxxl,
                height = EliteSpace.Xxl,
            )
            .testTag("ascend_range_mark")
            .semantics { contentDescription = Accessibility.decorative() }
            .drawBehind {
                val w = this.size.width
                val h = this.size.height
                val stroke = EliteSpace.Xxs.toPx()
                fun peak(left: Float, top: Float, right: Float) {
                    val path = Path().apply {
                        moveTo(left, h)
                        lineTo((left + right) / 2f, top)
                        lineTo(right, h)
                    }
                    drawPath(path, color, style = Stroke(width = stroke))
                }
                peak(0f, h * 0.42f, w * 0.48f)
                peak(w * 0.22f, h * 0.12f, w * 0.78f)
                peak(w * 0.52f, h * 0.38f, w)
            },
    )
}
