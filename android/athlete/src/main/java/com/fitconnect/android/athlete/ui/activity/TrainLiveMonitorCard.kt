package com.fitconnect.android.athlete.ui.activity

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextOverflow
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.designui.components.EliteLiveDot
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosGlassBadge
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.isCompactAthleteWidth

@Composable
fun TrainLiveMonitorCard(
    phase: LiveActivityPhase,
    sport: String,
    sourceLabel: String,
    sessionState: String,
    sessionId: String,
    liveSession: Boolean,
    phaseCopy: String,
    gpsCopy: String,
    hrLine: String,
    modifier: Modifier = Modifier,
) {
    val compact = isCompactAthleteWidth()
    val statusLabel = when (phase) {
        LiveActivityPhase.RUNNING, LiveActivityPhase.RESUMING -> "LIVE TELEMETRY"
        LiveActivityPhase.COUNTDOWN -> "SYS.COUNTDOWN"
        LiveActivityPhase.PAUSED -> "PAUSED"
        LiveActivityPhase.FINISHING -> "SYS.FINISH"
        LiveActivityPhase.ENDED -> "COMPLETE"
        else -> "IDLE"
    }
    EosPremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("activity_monitor"),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
            if (compact) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteLiveDot(
                        live = phase == LiveActivityPhase.RUNNING ||
                            phase == LiveActivityPhase.RESUMING,
                        label = statusLabel,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                        EosGlassBadge(
                            text = sourceLabel,
                            modifier = Modifier.weight(1f, fill = false),
                            contentColor = EosNeumorphicColors.TextPrimary,
                        )
                        EosGlassBadge(
                            text = sessionState,
                            modifier = Modifier.weight(1f, fill = false),
                            contentColor = EosNeumorphicColors.TextMuted,
                        )
                    }
                }
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    EliteLiveDot(
                        live = phase == LiveActivityPhase.RUNNING ||
                            phase == LiveActivityPhase.RESUMING,
                        label = statusLabel,
                        modifier = Modifier.weight(1f, fill = false),
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                        EosGlassBadge(
                            text = sourceLabel,
                            contentColor = EosNeumorphicColors.TextPrimary,
                        )
                        EosGlassBadge(
                            text = sessionState,
                            contentColor = EosNeumorphicColors.TextMuted,
                        )
                    }
                }
            }
            EliteSysLabel("LIVE MONITOR · ${sport.uppercase()}")
            if (sessionId.isNotBlank()) {
                Text(
                    "session $sessionId",
                    style = MaterialTheme.typography.labelSmall,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            if (!liveSession) {
                Text(
                    "—",
                    style = EliteMetricTextStyle,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.testTag("activity_timer"),
                )
            }
            Text(
                phaseCopy,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
            )
            Text(gpsCopy, style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Text(hrLine, style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
    }
}
