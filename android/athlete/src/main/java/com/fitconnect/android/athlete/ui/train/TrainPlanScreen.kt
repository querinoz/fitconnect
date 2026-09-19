package com.fitconnect.android.athlete.ui.train

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.sports.guided.catalog.GuidedPlanCatalog

/**
 * Dedicated TRAIN PLAN surface — not a wall inside the training hub.
 */
@Composable
fun TrainPlanScreen(
    onOpenGuided: () -> Unit = {},
    onOpenSession: (String) -> Unit = {},
) {
    val container = LocalAthleteContainer.current
    val plans = remember { GuidedPlanCatalog.cards() }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_train_plan")
    }

    AthleteScreenScaffold(
        title = "Train plan",
        subtitle = "Guided blocks · completions are MANUAL — not fabricated biometrics",
        testTag = "athlete_train_plan",
    ) {
        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_plan_header")) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("ACTIVE CATALOG")
                    Text(
                        "${plans.size} executable sessions · open a block to train",
                        style = MaterialTheme.typography.titleMedium,
                    )
                    EliteButton(
                        label = "START GUIDED WORKOUT",
                        onClick = onOpenGuided,
                        variant = EliteButtonVariant.Primary,
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                            .testTag("train_plan_start_guided"),
                    )
                }
            }
        }
        items(plans, key = { it.plan.workoutId }) { card ->
            EosPremiumCard(
                onClick = { onOpenSession(card.plan.workoutId) },
                modifier = Modifier.testTag("train_plan_card_${card.plan.workoutId}"),
            ) {
                Text(card.plan.name, style = MaterialTheme.typography.titleMedium)
                Text(
                    "${card.plan.estimatedDurationMin} min · ${card.difficulty} · ${card.structure.joinToString(" → ")}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        if (plans.isEmpty()) {
            item {
                Text(
                    "No guided plans registered.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.testTag("train_plan_empty"),
                )
            }
        }
    }
}
