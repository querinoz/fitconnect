package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.neumorphic.EosPremiumWell
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun TodayCompactAiCta(
    body: String,
    actionLabel: String,
    onAction: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_ai_cta"),
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = body,
            style = MaterialTheme.typography.bodyMedium,
            color = EosNeumorphicColors.TextMuted,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f),
        )
        EliteButton(
            label = actionLabel,
            variant = EliteButtonVariant.Primary,
            onClick = onAction,
        )
    }
}

data class TodaySessionCardUi(
    val id: String,
    val title: String,
    val subtitle: String,
    val sparkline: List<Float>,
    val isDemo: Boolean,
)

@Composable
fun TodaySessionCarousel(
    sessions: List<TodaySessionCardUi>,
    onSessionClick: (String) -> Unit,
    onSeeAll: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_session_carousel"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "Recent sessions",
                style = MaterialTheme.typography.titleMedium,
            )
            EliteButton(
                label = "See all",
                variant = EliteButtonVariant.Ghost,
                onClick = onSeeAll,
            )
        }
        if (sessions.isEmpty()) {
            EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "No sessions yet. Connect Health Connect or start a workout.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = EosNeumorphicColors.TextMuted,
                )
            }
        } else {
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                items(sessions.take(6), key = { it.id }) { session ->
                    TodaySessionCarouselCard(
                        session = session,
                        onClick = { onSessionClick(session.id) },
                        modifier = Modifier.width(200.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun TodaySessionCarouselCard(
    session: TodaySessionCardUi,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    EosPremiumCard(
        modifier = modifier.testTag("today_session_card_${session.id}"),
        onClick = onClick,
        cornerRadius = 16.dp,
    ) {
        Text(
            text = session.title,
            style = MaterialTheme.typography.titleSmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = session.subtitle,
            style = MaterialTheme.typography.bodySmall,
            color = EosNeumorphicColors.TextMuted,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        EosPremiumWell(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .padding(top = EliteSpace.Sm),
            cornerRadius = 10.dp,
        ) {
            EliteChart(
                model = EliteChartModel(
                    kind = EliteChartKind.PERFORMANCE,
                    points = session.sparkline.mapIndexed { index, y ->
                        EliteChartPoint(index.toFloat(), y)
                    },
                    contentDescription = "Session trend for ${session.title}",
                ),
                modifier = Modifier.fillMaxWidth(),
                height = 48,
            )
        }
    }
}
