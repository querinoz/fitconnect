package com.fitconnect.android.athlete.ui.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.neumorphic.EosGlassSurface
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun ProfileAchievementTile(
    emoji: String,
    label: String,
    domain: Color,
    unlocked: Boolean,
    modifier: Modifier = Modifier,
) {
    if (unlocked) {
        EosGlassSurface(
            modifier = modifier.fillMaxWidth(),
            cornerRadius = 12.dp,
            enableBlur = false,
        ) {
            ProfileAchievementTileContent(
                emoji = emoji,
                label = label,
                domain = domain,
                unlocked = true,
            )
        }
    } else {
        ProfileAchievementTileContent(
            emoji = emoji,
            label = label,
            domain = domain,
            unlocked = false,
            modifier = modifier
                .fillMaxWidth()
                .alpha(0.45f),
        )
    }
}

@Composable
private fun ProfileAchievementTileContent(
    emoji: String,
    label: String,
    domain: Color,
    unlocked: Boolean,
    modifier: Modifier = Modifier,
) {
    androidx.compose.foundation.layout.Column(
        modifier = modifier.padding(EliteSpace.Sm),
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(emoji, style = MaterialTheme.typography.titleLarge)
        Text(
            text = if (unlocked) label else "Locked",
            style = MaterialTheme.typography.labelSmall,
            color = if (unlocked) EosNeumorphicColors.TextPrimary else EosNeumorphicColors.TextMuted,
            maxLines = 2,
        )
    }
}
