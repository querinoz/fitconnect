package com.fitconnect.android.athlete.ui.ai

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
import com.fitconnect.android.ai.domain.AiConversationResponse
import com.fitconnect.android.ai.domain.AiRole
import com.fitconnect.android.ai.domain.FeedbackLabel
import com.fitconnect.android.ai.permissions.AiPrincipal
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.AiInsightCard
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteTextField
import kotlinx.coroutines.launch

@Composable
fun AthleteAiScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    val athleteId = LocalAthleteRepository.ATHLETE_ID
    var brief by remember { mutableStateOf<MorningBrief?>(null) }
    var answer by remember { mutableStateOf<AiConversationResponse?>(null) }
    var question by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    fun reload() {
        scope.launch {
            runCatching { container.ai.engine.athleteMorningBrief(athleteId) }
                .onSuccess { brief = it; error = null }
                .onFailure { error = it.message }
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_ai")
        reload()
    }

    AthleteScreenScaffold(
        title = "Performance AI",
        subtitle = "Grounded · explainable · overrideable",
        testTag = "athlete_ai",
    ) {
        item {
            EliteCard {
                Text("Decision support only — not medical advice.", style = MaterialTheme.typography.bodySmall)
                brief?.let { b ->
                    Text(
                        "As of ${b.summary.timestampEpochMs}" + if (b.offline) " · offline" else "",
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
            }
        }
        error?.let { msg ->
            item { Text(msg, color = MaterialTheme.colorScheme.error) }
        }
        items(brief?.insights.orEmpty(), key = { it.id }) { insight ->
            AiInsightCard(
                title = insight.title,
                summary = insight.summary,
                confidence = insight.confidence.name.replace('_', ' '),
                evidence = insight.evidence.map { "${it.claim}: ${it.value ?: "—"} (${it.sourceEngine})" },
                limitations = insight.limitations,
                recommendedAction = insight.recommendedAction,
                onAskWhy = { question = "Why: ${insight.title}"; },
                onDismiss = { },
                onAskCoach = { question = "Help me ask my coach about: ${insight.title}" },
                onFeedbackHelpful = {
                    container.ai.feedback.submit(insight.id, athleteId, FeedbackLabel.HELPFUL)
                },
                onFeedbackNotHelpful = {
                    container.ai.feedback.submit(insight.id, athleteId, FeedbackLabel.NOT_HELPFUL)
                },
            )
        }
        items(brief?.recommendations.orEmpty(), key = { it.id }) { rec ->
            EliteCard {
                Text(rec.title, style = MaterialTheme.typography.titleSmall)
                Text(rec.reason)
                Text("Benefit: ${rec.expectedBenefit}", style = MaterialTheme.typography.bodySmall)
                Text("Risk: ${rec.potentialRisk}", style = MaterialTheme.typography.bodySmall)
                Text("Alternative: ${rec.alternative}", style = MaterialTheme.typography.bodySmall)
                Text("Overrideable · ${rec.confidence}", style = MaterialTheme.typography.labelSmall)
            }
        }
        item {
            EliteTextField(
                value = question,
                onValueChange = { question = it },
                label = "Ask about readiness, training, programs…",
                modifier = Modifier.testTag("athlete_ai_input"),
            )
        }
        item {
            EliteButton(
                label = "Ask",
                onClick = {
                    scope.launch {
                        answer = container.ai.engine.ask(
                            AiPrincipal(athleteId, AiRole.ATHLETE),
                            athleteId,
                            question.ifBlank { "Explain today's readiness" },
                            sessionId = "athlete-ai",
                        )
                    }
                },
            )
        }
        answer?.let { response ->
            item {
                EliteCard {
                    Text(response.message, style = MaterialTheme.typography.bodyMedium)
                    if (response.refused) {
                        Text("Refused: ${response.refusalReason}", color = MaterialTheme.colorScheme.error)
                    }
                    Text(
                        "Model ${response.modelId} · ${response.promptVersion} · ${response.confidence}",
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
            }
        }
    }
}
