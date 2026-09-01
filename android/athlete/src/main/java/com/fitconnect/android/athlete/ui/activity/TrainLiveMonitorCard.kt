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
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.designui.components.EliteLiveDot
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosGlassBadge
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace

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
    EosPremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("activity_monitor"),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                EliteLiveDot(
                    live = phase == LiveActivityPhase.RUNNING ||
                        phase == LiveActivityPhase.RESUMING,
                    label = when (phase) {
                        LiveActivityPhase.RUNNING, LiveActivityPhase.RESUMING -> "LIVE TELEMETRY"
                        LiveActivityPhase.COUNTDOWN -> "SYS.COUNTDOWN"
                        LiveActivityPhase.PAUSED -> "PAUSED"
                        LiveActivityPhase.FINISHING -> "SYS.FINISH"
                        LiveActivityPhase.ENDED -> "COMPLETE"
                        else -> "IDLE"
                    },
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
            EliteSysLabel("LIVE MONITOR · ${sport.uppercase()}")
            if (sessionId.isNotBlank()) {
                Text("session $sessionId", style = MaterialTheme.typography.labelSmall)
            }
            if (!liveSession) {
                Text(
                    "—",
                    style = EliteMetricTextStyle,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.testTag("activity_timer"),
                )
            }
            Text(phaseCopy, style = MaterialTheme.typography.bodyMedium)
            Text(gpsCopy, style = MaterialTheme.typography.bodySmall)
            Text(hrLine, style = MaterialTheme.typography.bodySmall)
        }
    }
}
