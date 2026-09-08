package com.fitconnect.android.athlete.ui.vault

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material.icons.outlined.MonitorHeart
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.AscendHeroLogic
import com.fitconnect.android.designui.components.AscendPeakMark
import com.fitconnect.android.designui.components.AscendRangeSilhouette
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

@Composable
fun AscendProgressionRows(
    streakDays: Int,
    telemetryLevel: Int,
    modifier: Modifier = Modifier,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val telemetry = EliteSurfaceColors.TELEMETRY.toColor()
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("ascend_progression_rows"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(EliteBorder.Hairline)
                    .background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
            )
            Text(
                text = "ASCEND PROGRESSION",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(EliteBorder.Hairline)
                    .background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
            )
        }
        ProgressionRow(
            icon = {
                Icon(
                    Icons.AutoMirrored.Outlined.TrendingUp,
                    contentDescription = null,
                    tint = volt,
                    modifier = Modifier.size(EliteSpace.Xl),
                )
            },
            accent = volt,
            overline = "STREAK",
            value = streakDays.toString(),
            unit = "DAYS",
            filled = AscendHeroLogic.chunkFill(streakDays, AscendHeroLogic.STREAK_CYCLE_DAYS),
        )
        ProgressionRow(
            icon = {
                Icon(
                    Icons.Outlined.MonitorHeart,
                    contentDescription = null,
                    tint = telemetry,
                    modifier = Modifier.size(EliteSpace.Xl),
                )
            },
            accent = telemetry,
            overline = "LEVEL",
            value = telemetryLevel.toString(),
            unit = "TELEMETRY",
            filled = AscendHeroLogic.chunkFill(telemetryLevel, AscendHeroLogic.TELEMETRY_CAP),
        )
        EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
            ) {
                AscendPeakMark(
                    size = EliteSpace.Xl,
                    color = volt,
                )
                Text(
                    text = buildAnnotatedString {
                        append("EVERY REP. EVERY CHOICE. ")
                        withStyle(SpanStyle(color = volt, fontWeight = FontWeight.Bold)) {
                            append("ASCEND.")
                        }
                    },
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.weight(1f),
                )
                AscendRangeSilhouette()
            }
        }
    }
}

@Composable
private fun ProgressionRow(
    icon: @Composable () -> Unit,
    accent: Color,
    overline: String,
    value: String,
    unit: String,
    filled: Int,
) {
    EosPremiumCard(
        modifier = Modifier
            .fillMaxWidth()
            .drawBehind {
                val glowW = EliteSpace.Md.toPx()
                drawRect(
                    brush = Brush.horizontalGradient(
                        colors = listOf(accent.copy(alpha = 0.55f), Color.Transparent),
                        startX = 0f,
                        endX = glowW,
                    ),
                    size = Size(glowW, size.height),
                )
            },
        cornerRadius = EliteRadius.Lg,
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        ) {
            Box(
                modifier = Modifier
                    .size(EliteSpace.Xxl + EliteSpace.Sm)
                    .clip(CircleShape)
                    .background(accent.copy(alpha = 0.15f))
                    .border(EliteBorder.Thin, accent.copy(alpha = 0.85f), CircleShape),
                contentAlignment = Alignment.Center,
            ) { icon() }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
            ) {
                Text(
                    overline,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Row(
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
                ) {
                    Text(
                        value,
                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    )
                    Text(
                        unit,
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                AscendChunkTrack(
                    filled = filled,
                    slots = AscendHeroLogic.CHUNK_SLOTS,
                    fillColor = accent,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            Icon(
                Icons.Outlined.ChevronRight,
                contentDescription = Accessibility.decorative(),
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun AscendChunkTrack(
    filled: Int,
    slots: Int,
    fillColor: Color,
    modifier: Modifier = Modifier,
) {
    val rest = EliteSurfaceColors.INSTRUMENT_TRACK.toColor()
    Box(
        modifier = modifier
            .height(EliteSpace.Lg)
            .testTag("ascend_chunk_track")
            .semantics { contentDescription = Accessibility.decorative() }
            .drawBehind {
                val gap = EliteSpace.Xxs.toPx()
                val skew = EliteSpace.Xs.toPx()
                val slotW = ((size.width - gap * (slots - 1).coerceAtLeast(0)) / slots)
                    .coerceAtLeast(1f)
                val h = size.height
                repeat(slots) { index ->
                    val x = index * (slotW + gap)
                    val path = Path().apply {
                        moveTo(x + skew, 0f)
                        lineTo(x + slotW, 0f)
                        lineTo((x + slotW - skew).coerceAtLeast(x), h)
                        lineTo(x, h)
                        close()
                    }
                    drawPath(path, if (index < filled) fillColor else rest)
                }
            },
    )
}
