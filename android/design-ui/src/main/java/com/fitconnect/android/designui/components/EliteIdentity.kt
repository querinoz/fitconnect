package com.fitconnect.android.designui.components

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
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Performance identity card — not a settings form.
 * Callers pass already-translated labels (design-ui does not own i18n tables).
 */
@Composable
fun ElitePlayerCard(
    initials: String,
    displayName: String,
    overline: String,
    sportLine: String,
    levelLabel: String,
    xpLabel: String,
    modifier: Modifier = Modifier,
    title: String? = null,
    streakLabel: String? = null,
    squadLabel: String? = null,
) {
    EliteCard(variant = EliteCardVariant.Glass, modifier = modifier.testTag("elite_player_card")) {
        EliteStack(spacing = EliteSpace.Md) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                EliteAvatar(initials = initials)
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs)) {
                    EliteSysLabel(overline)
                    Text(displayName, style = MaterialTheme.typography.headlineSmall)
                    title?.let {
                        Text(
                            it,
                            style = EliteMetricTextStyle,
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                    Text(
                        sportLine,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            EliteFlowRow {
                EliteBadge(text = levelLabel)
                EliteBadge(text = xpLabel)
                streakLabel?.let { EliteBadge(text = it) }
                squadLabel?.let { EliteBadge(text = it) }
            }
        }
    }
}
