package com.fitconnect.android.designui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

@Composable
fun EliteAchievementTile(
    emoji: String,
    label: String,
    domain: Color,
    unlocked: Boolean,
    modifier: Modifier = Modifier,
) {
    val spoken = if (unlocked) {
        "achievement unlocked: $label"
    } else {
        "achievement locked: $label"
    }
    Column(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .background(
                domain.copy(alpha = if (unlocked) 0.12f else 0.06f),
                RoundedCornerShape(EliteRadius.Md),
            )
            .padding(EliteSpace.Sm)
            .alpha(if (unlocked) 1f else 0.28f)
            .testTag("elite_achievement_tile")
            .semantics { contentDescription = spoken },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(emoji, style = MaterialTheme.typography.titleLarge)
        Text(
            text = if (unlocked) label else "Locked",
            style = EliteMonoTextStyle,
            color = if (unlocked) {
                MaterialTheme.colorScheme.onBackground
            } else {
                EliteSurfaceColors.INSTRUMENT_MUTED.toColor()
            },
        )
    }
}
