package com.fitconnect.android.designui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceType
import com.fitconnect.android.designui.motion.EliteMotionPreset
import com.fitconnect.android.designui.motion.eliteMotionSpec
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor

/**
 * Ascend hero — split greeting + cinematic LEVEL ring (contract primary signal).
 */
@Composable
fun AscendXPBar(
    rankLabel: String,
    level: Int,
    xpLabel: String,
    remainingLabel: String,
    progress: Float,
    nextUnlock: String?,
    modifier: Modifier = Modifier,
    greetingPrefix: String? = null,
    athleteName: String? = null,
    greeting: String? = null,
) {
    val reduce = reduceMotionEnabled()
    val animated by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = eliteMotionSpec(EliteMotionPreset.SUCCESS),
        label = "ascend-xp",
    )
    val shown = if (reduce) progress.coerceIn(0f, 1f) else animated
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("ascend_xp_bar")
            .padding(vertical = EliteSpace.Md),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        when {
            !greetingPrefix.isNullOrBlank() && !athleteName.isNullOrBlank() -> {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("ascend_greeting"),
                    horizontalAlignment = Alignment.Start,
                ) {
                    Text(
                        text = "$greetingPrefix,",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onBackground,
                    )
                    Text(
                        text = athleteName,
                        style = MaterialTheme.typography.displayMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onBackground,
                    )
                }
            }
            !greeting.isNullOrBlank() -> {
                Text(
                    text = greeting,
                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("ascend_greeting"),
                )
            }
        }
        if (rankLabel.isNotBlank()) {
            Text(
                rankLabel,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        AscendHeroRing(
            progress = shown,
            diameter = EliteRingAscend,
            contentDescription = remainingLabel,
            trackColor = volt,
            pulsing = shown in 0.01f..0.99f && !reduce,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "LEVEL",
                    style = MaterialTheme.typography.labelMedium.copy(
                        letterSpacing = EliteSurfaceType.OVERLINE_TRACKING.sp,
                    ),
                    color = volt,
                )
                Text(
                    text = level.toString(),
                    style = MaterialTheme.typography.displayLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onBackground,
                )
                Spacer(Modifier.height(EliteSpace.Xxs))
                Text(xpLabel, style = EliteMetricTextStyle.copy(fontWeight = FontWeight.Bold), color = volt)
                Text(
                    remainingLabel.uppercase(),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        nextUnlock?.let {
            EliteSysLabel("NEXT UNLOCK")
            Text(it, style = MaterialTheme.typography.bodyLarge)
        }
    }
}
