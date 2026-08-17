package com.fitconnect.android.designui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.designui.identity.PatentRank
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

@Composable
fun EliteHeader(
    userId: String,
    userName: String,
    onLogoTap: () -> Unit,
    onAvatarTap: () -> Unit,
    onNotificationsTap: () -> Unit,
    modifier: Modifier = Modifier,
    streakDays: Int? = null,
    rank: PatentRank? = null,
    collapsedFraction: Float = 0f,
) {
    val height = EliteSurfaceInstrument.HEADER_DP.dp
    val visible = (1f - collapsedFraction).coerceIn(0f, 1f)
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val ember = EliteSurfaceColors.PATENT_EMBER.toColor()
    Column(
        modifier = modifier
            .fillMaxWidth()
            .graphicsLayer {
                alpha = visible
                translationY = -height.toPx() * collapsedFraction
            }
            .testTag("elite_header"),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(height)
                .padding(horizontal = EliteSpace.Lg),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(
                modifier = Modifier
                    .clickable(onClick = onLogoTap)
                    .semantics { contentDescription = "FitConnect home" }
                    .padding(end = EliteSpace.Sm),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                Box(
                    modifier = Modifier
                        .size(EliteSurfaceInstrument.LOGO_MARK_DP.dp)
                        .drawBehind {
                            val hex = pointyHex(
                                Offset(this.size.width / 2f, this.size.height / 2f),
                                this.size.minDimension / 2f - 1f,
                            )
                            drawPath(hex, color = volt, style = Stroke(width = 1.6.dp.toPx(), cap = StrokeCap.Round))
                            drawPath(
                                pointyHex(
                                    Offset(this.size.width / 2f, this.size.height / 2f),
                                    this.size.minDimension / 5f,
                                ),
                                color = volt,
                            )
                        },
                )
                Text(
                    text = "FitConnect",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground,
                )
            }
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                if (streakDays != null && streakDays > 0) {
                    Text(
                        text = "$streakDays",
                        style = EliteMonoTextStyle,
                        color = ember,
                        modifier = Modifier
                            .background(
                                ember.copy(alpha = 0.14f),
                                RoundedCornerShape(EliteRadius.Full),
                            )
                            .padding(horizontal = EliteSpace.Sm, vertical = EliteSpace.Xxs)
                            .semantics { contentDescription = "$streakDays day streak" }
                            .testTag("elite_header_streak"),
                    )
                }
                IconButton(
                    onClick = onNotificationsTap,
                    modifier = Modifier.size(Accessibility.MIN_TOUCH_TARGET_DP.dp),
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Notifications,
                        contentDescription = "Notifications",
                        tint = EliteSurfaceColors.INSTRUMENT_MUTED.toColor(),
                    )
                }
                Box(
                    modifier = Modifier
                        .clickable(onClick = onAvatarTap)
                        .semantics { contentDescription = userName },
                ) {
                    EliteHexatar(
                        userId = userId,
                        contentDescription = userName,
                        diameter = EliteHexatarHeader,
                    )
                    EliteTierBadge(
                        rank = rank,
                        modifier = Modifier.align(Alignment.BottomEnd),
                    )
                }
            }
        }
        HorizontalDivider(
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.06f),
        )
    }
}
