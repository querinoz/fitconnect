package com.fitconnect.android.designui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.designui.identity.Patent
import com.fitconnect.android.designui.identity.PatentLogic
import com.fitconnect.android.designui.identity.PatentRank
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

fun Patent.fillColor(): Color = when (this) {
    Patent.INICIADO -> EliteSurfaceColors.PATENT_STEEL.toColor()
    Patent.ATIVO -> EliteSurfaceColors.TELEMETRY.toColor()
    Patent.CONSTANTE -> EliteSurfaceColors.PATENT_MINT.toColor()
    Patent.FORTE -> EliteSurfaceColors.RECOVERY.toColor()
    Patent.ELITE -> EliteSurfaceColors.VOLTLINE.toColor()
    Patent.LENDA -> EliteSurfaceColors.PATENT_LEGEND.toColor()
}

fun Patent.onFillColor(): Color = when (this) {
    Patent.INICIADO -> EliteSurfaceColors.ON_PATENT_STEEL.toColor()
    Patent.ATIVO -> EliteSurfaceColors.ON_PATENT_CYAN.toColor()
    Patent.CONSTANTE -> EliteSurfaceColors.ON_PATENT_MINT.toColor()
    Patent.FORTE -> EliteSurfaceColors.ON_PATENT_AMBER.toColor()
    Patent.ELITE -> EliteSurfaceColors.ON_VOLT.toColor()
    Patent.LENDA -> EliteSurfaceColors.ON_PATENT_LEGEND.toColor()
}

@Composable
fun EliteTierBadge(
    rank: PatentRank?,
    modifier: Modifier = Modifier,
    diameter: Dp = EliteSurfaceInstrument.HEXATAR_BADGE_DP.dp,
) {
    val fill = rank?.patent?.fillColor() ?: EliteSurfaceColors.PATENT_STEEL.toColor()
    val onFill = rank?.patent?.onFillColor() ?: EliteSurfaceColors.ON_PATENT_STEEL.toColor()
    val roman = rank?.let { PatentLogic.roman(it.grade) }.orEmpty()
    val spoken = if (rank == null) {
        "no patent earned yet"
    } else {
        "patent ${rank.patent.name.lowercase()}, grade ${PatentLogic.spokenGrade(rank.grade)}"
    }
    Box(
        modifier = modifier
            .size(diameter)
            .testTag("elite_tier_badge")
            .semantics { contentDescription = spoken }
            .drawWithCache {
                val center = Offset(this.size.width / 2f, this.size.height / 2f)
                val hex = pointyHex(center, this.size.minDimension / 2f - 0.5f)
                onDrawBehind {
                    drawPath(hex, color = fill)
                    drawPath(hex, color = fill, style = Stroke(width = 1.2f, cap = StrokeCap.Round))
                }
            },
        contentAlignment = Alignment.Center,
    ) {
        if (roman.isNotEmpty()) {
            Text(
                text = roman,
                style = EliteMonoTextStyle,
                color = onFill,
            )
        }
    }
}

@Composable
fun EliteTierChip(
    rank: PatentRank,
    modifier: Modifier = Modifier,
) {
    val fill = rank.patent.fillColor()
    val onFill = rank.patent.onFillColor()
    Row(
        modifier = modifier
            .background(fill, RoundedCornerShape(EliteRadius.Full))
            .padding(horizontal = EliteSpace.Md, vertical = EliteSpace.Xs)
            .testTag("elite_tier_chip")
            .semantics {
                contentDescription =
                    "patent ${rank.patent.name.lowercase()}, grade ${PatentLogic.spokenGrade(rank.grade)}"
            },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        Text(
            text = "${rank.patent.name} · ${PatentLogic.roman(rank.grade)}",
            style = EliteMonoTextStyle,
            color = onFill,
        )
    }
}

@Composable
fun EliteTierProgress(
    title: String,
    progress: Float,
    remaining: String,
    fill: Color,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("elite_tier_progress"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        EliteSysLabel(title)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .background(
                    EliteSurfaceColors.INSTRUMENT_TRACK.toColor(),
                    RoundedCornerShape(EliteRadius.Full),
                ),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progress.coerceIn(0f, 1f))
                    .height(6.dp)
                    .background(fill, RoundedCornerShape(EliteRadius.Full)),
            )
        }
        Text(
            remaining,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
