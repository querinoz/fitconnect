package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Elite OS AI insight surface — evidence, confidence and limitations required.
 * Not a generic chatbot bubble.
 */
@Composable
fun AiInsightCard(
    title: String,
    summary: String,
    confidence: String,
    evidence: List<String>,
    limitations: List<String>,
    recommendedAction: String? = null,
    modifier: Modifier = Modifier,
    onAskWhy: (() -> Unit)? = null,
    onDismiss: (() -> Unit)? = null,
    onAskCoach: (() -> Unit)? = null,
    onFeedbackHelpful: (() -> Unit)? = null,
    onFeedbackNotHelpful: (() -> Unit)? = null,
) {
    EliteCard(
        modifier = modifier.semantics {
            contentDescription = "AI insight $title confidence $confidence"
        },
        variant = EliteCardVariant.Glass,
    ) {
        Text(title, style = MaterialTheme.typography.titleMedium)
        Text(
            text = summary,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(top = EliteSpace.Xs),
        )
        Text(
            text = "Confidence · $confidence",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(top = EliteSpace.Sm),
        )
        if (evidence.isNotEmpty()) {
            Text(
                text = "Evidence",
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.padding(top = EliteSpace.Sm),
            )
            evidence.take(6).forEach { line ->
                Text("· $line", style = MaterialTheme.typography.bodySmall)
            }
        }
        recommendedAction?.let {
            Text(
                text = "Suggested: $it",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(top = EliteSpace.Sm),
            )
        }
        if (limitations.isNotEmpty()) {
            Text(
                text = "Limitations: ${limitations.joinToString(" · ")}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = EliteSpace.Xs),
            )
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = EliteSpace.Md),
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            onAskWhy?.let { EliteButton(label = "Why?", variant = EliteButtonVariant.Ghost, onClick = it) }
            onAskCoach?.let { EliteButton(label = "Ask coach", variant = EliteButtonVariant.Secondary, onClick = it) }
            onDismiss?.let { EliteButton(label = "Dismiss", variant = EliteButtonVariant.Ghost, onClick = it) }
        }
        if (onFeedbackHelpful != null || onFeedbackNotHelpful != null) {
            Row(
                modifier = Modifier.padding(top = EliteSpace.Sm),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                onFeedbackHelpful?.let {
                    EliteButton(label = "Helpful", variant = EliteButtonVariant.Ghost, onClick = it)
                }
                onFeedbackNotHelpful?.let {
                    EliteButton(label = "Not helpful", variant = EliteButtonVariant.Ghost, onClick = it)
                }
            }
        }
    }
}
