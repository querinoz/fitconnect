package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.sports.intelligence.HonestyStatus
import com.fitconnect.android.sports.intelligence.TodaySessionRecommendation

/**
 * TODAY sport-intelligence session card — sport, type, intent, honest readiness, duration, START.
 * Does not invent biometric values; readiness shows honesty label when not AVAILABLE.
 */
@Composable
fun TodaySportSessionCard(
    recommendation: TodaySessionRecommendation,
    onStart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val profileName = recommendation.sportId.value.replace('_', ' ')
        .replaceFirstChar { it.uppercase() }
    val readinessText = when (recommendation.honesty.readiness.status) {
        HonestyStatus.AVAILABLE ->
            "Readiness ${recommendation.honesty.readinessDisplay()}"
        else ->
            "Readiness ${recommendation.honesty.readiness.label()}"
    }
    val a11y = buildString {
        append(profileName)
        append(" · ")
        append(recommendation.sessionType)
        append(" · ")
        append(recommendation.intent)
        append(" · ")
        append(readinessText)
        append(" · ")
        append("${recommendation.estimatedDurationMin} min")
    }

    EosPremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_sport_session_card")
            .semantics { contentDescription = a11y },
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            EliteSysLabel("TODAY · SPORT SESSION")
            Text(
                text = profileName,
                style = MaterialTheme.typography.titleLarge,
            )
            Text(
                text = recommendation.sessionType.replace('_', ' '),
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                text = recommendation.intent,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                HexStatus(readinessText.uppercase())
                HexStatus("${recommendation.estimatedDurationMin} MIN")
            }
            Text(
                text = recommendation.primaryReason(),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            EliteButton(
                label = "START",
                onClick = onStart,
                variant = EliteButtonVariant.Primary,
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                    .testTag("today_sport_session_start"),
                contentDescription = "Start today's $profileName session",
            )
        }
    }
}
