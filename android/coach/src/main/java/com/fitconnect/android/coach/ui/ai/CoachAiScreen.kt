package com.fitconnect.android.coach.ui.ai

import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.Modifier
import com.fitconnect.android.ai.assistant.MorningBrief
import com.fitconnect.android.ai.domain.FeedbackLabel
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.AiInsightCard
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun CoachAiScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var brief by remember { mutableStateOf<MorningBrief?>(null) }
    var search by remember { mutableStateOf("") }
    var searchResult by remember { mutableStateOf<List<String>>(emptyList()) }

    fun reload() {
        scope.launch {
            brief = container.aiEngine.engine.coachAthleteSummary(
                coachId = "coach-1",
                athleteId = "a1",
                assigned = setOf("a1", "ath-1"),
            )
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_ai")
        reload()
    }

    CoachScreenScaffold(
        title = "Coach AI",
        subtitle = "Brief · risks · drafts · decision support",
        testTag = "coach_ai",
    ) {
        item {
            EliteCard {
                Text("AI proposes — you decide. Never auto-edits programs.", style = MaterialTheme.typography.bodySmall)
                brief?.summary?.let {
                    Text(it.body, style = MaterialTheme.typography.bodyLarge)
                    Text("Confidence ${it.confidence} · ${it.timestampEpochMs}", style = MaterialTheme.typography.labelSmall)
                }
            }
        }
        items(brief?.insights.orEmpty(), key = { it.id }) { insight ->
            AiInsightCard(
                title = insight.title,
                summary = insight.summary,
                confidence = insight.confidence.name,
                evidence = insight.evidence.map { "${it.claim}: ${it.value}" },
                limitations = insight.limitations,
                recommendedAction = insight.recommendedAction,
                onFeedbackHelpful = {
                    container.aiEngine.feedback.submit(insight.id, "coach-1", FeedbackLabel.HELPFUL)
                },
                onFeedbackNotHelpful = {
                    container.aiEngine.feedback.submit(insight.id, "coach-1", FeedbackLabel.NOT_HELPFUL)
                },
            )
        }
        item {
            EliteTextField(
                value = search,
                onValueChange = { search = it },
                label = "Natural language (authorized tools only)",
                modifier = Modifier.testTag("coach_ai_search"),
            )
        }
        item {
            EliteButton(
                label = "Search roster",
                onClick = {
                    scope.launch {
                        when (val r = container.ai.naturalLanguageSearch(search.ifBlank { "Which athletes need attention?" })) {
                            is AppResult.Ok -> searchResult = r.value
                            is AppResult.Err -> searchResult = listOf(r.error.toString())
                        }
                    }
                },
            )
        }
        items(searchResult) { line ->
            EliteCard { Text(line) }
        }
    }
}
