package com.fitconnect.android.athlete.ui.vault

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.charts.EliteChartPalette
import com.fitconnect.android.designui.components.EliteProgress
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosGlassBadge
import com.fitconnect.android.designui.neumorphic.EosGlassSurface
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun VaultAchievementBadge(
    name: String,
    description: String,
    rarity: String,
    progressLabel: String,
    ownership: String?,
    unlocked: Boolean,
    modifier: Modifier = Modifier,
) {
    if (unlocked) {
        EosGlassSurface(
            modifier = modifier
                .fillMaxWidth()
                .testTag("vault_achievement_badge"),
            cornerRadius = 16.dp,
            enableBlur = false,
        ) {
            VaultAchievementBadgeContent(
                name = name,
                description = description,
                rarity = rarity,
                progressLabel = progressLabel,
                ownership = ownership,
                unlocked = true,
            )
        }
    } else {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .alpha(0.55f)
                .testTag("vault_achievement_badge"),
        ) {
            VaultAchievementBadgeContent(
                name = name,
                description = description,
                rarity = rarity,
                progressLabel = progressLabel,
                ownership = ownership,
                unlocked = false,
            )
        }
    }
}

@Composable
private fun VaultAchievementBadgeContent(
    name: String,
    description: String,
    rarity: String,
    progressLabel: String,
    ownership: String?,
    unlocked: Boolean,
) {
    Column(
        modifier = Modifier.padding(EliteSpace.Md),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        EosGlassBadge(
            text = rarity,
            contentColor = if (unlocked) {
                EliteChartPalette.Hero
            } else {
                EosNeumorphicColors.TextMuted
            },
        )
        Text(
            text = name,
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = if (unlocked) FontWeight.Bold else FontWeight.Normal,
            ),
            color = if (unlocked) {
                EosNeumorphicColors.TextPrimary
            } else {
                EosNeumorphicColors.TextMuted
            },
        )
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = EosNeumorphicColors.TextMuted,
        )
        Text(
            text = progressLabel,
            style = MaterialTheme.typography.labelMedium,
            color = if (unlocked) EliteChartPalette.Success else EliteChartPalette.Axis,
        )
        ownership?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodySmall,
                color = EliteChartPalette.Axis,
            )
        }
        if (!unlocked) {
            val percent = progressLabel.substringBefore("%").toFloatOrNull()?.div(100f)
            EliteProgress(progress = percent)
        }
    }
}
