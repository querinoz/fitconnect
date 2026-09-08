package com.fitconnect.android.designui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

/**
 * Week progress hero — reference density (ring + twin metrics), FitConnect palette.
 * Skills: interface-design · ui-ux-pro-max · impeccable
 */
@Composable
fun EliteWeekProgressHero(
    progressPercent: Int,
    title: String,
    leftLabel: String,
    leftValue: String,
    rightLabel: String,
    rightValue: String,
    modifier: Modifier = Modifier,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val telemetry = EliteSurfaceColors.TELEMETRY.toColor()
    val carbon = EliteSurfaceColors.CARBON.toColor()
    val shape = RoundedCornerShape(EliteRadius.Media)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(carbon)
            .border(
                EliteBorder.Hairline,
                MaterialTheme.colorScheme.onBackground.copy(alpha = 0.08f),
                shape,
            )
            .padding(EliteSpace.Lg)
            .testTag("elite_week_progress_hero")
            .semantics {
                contentDescription =
                    "$title $progressPercent percent. $leftLabel $leftValue. $rightLabel $rightValue"
            },
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Lg),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        EliteInstrumentRing(
            progress = progressPercent / 100f,
            diameter = 112.dp,
            contentDescription = "$progressPercent percent",
            pulsing = progressPercent in 1..99,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "$progressPercent%",
                    style = EliteMetricTextStyle,
                    color = volt,
                )
                Text(
                    text = "WEEK",
                    style = EliteMonoTextStyle,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    EliteSysLabel(leftLabel)
                    Text(
                        text = leftValue,
                        style = EliteMetricTextStyle,
                        color = MaterialTheme.colorScheme.onBackground,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                Column(modifier = Modifier.weight(1f)) {
                    EliteSysLabel(rightLabel)
                    Text(
                        text = rightValue,
                        style = EliteMetricTextStyle,
                        color = telemetry,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
    }
}

data class EliteQuickAccessItem(
    val id: String,
    val label: String,
    val icon: ImageVector,
    val onClick: () -> Unit,
)

/** Horizontal quick-access rail — thumb-friendly 48dp targets (mobile-design). */
@Composable
fun EliteQuickAccessRail(
    items: List<EliteQuickAccessItem>,
    modifier: Modifier = Modifier,
) {
    val iris = EliteSurfaceColors.IRIS.toColor()
    LazyRow(
        modifier = modifier
            .fillMaxWidth()
            .testTag("elite_quick_access_rail"),
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        items(items, key = { it.id }) { item ->
            Column(
                modifier = Modifier
                    .width(72.dp)
                    .clickable(onClick = item.onClick)
                    .semantics { contentDescription = "Open ${item.label}" },
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
            ) {
                Box(
                    modifier = Modifier
                        .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
                        .clip(CircleShape)
                        .background(iris.copy(alpha = 0.18f))
                        .border(1.dp, iris.copy(alpha = 0.35f), CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = null,
                        tint = iris,
                        modifier = Modifier.size(22.dp),
                    )
                }
                Text(
                    text = item.label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

/**
 * Session / workout hero card — editorial fitness density from reference,
 * Voltline primary CTA + Iris depth (not reference purple).
 */
@Composable
fun EliteSessionHeroCard(
    title: String,
    subtitle: String,
    metaLeft: String,
    metaRight: String,
    ctaLabel: String,
    onCta: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val floor = EliteSurfaceColors.FLOOR.toColor()
    val iris = EliteSurfaceColors.IRIS.toColor()
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val shape = RoundedCornerShape(EliteRadius.Media)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(248.dp)
            .clip(shape)
            .clickable(onClick = onClick)
            .background(
                Brush.horizontalGradient(
                    colors = listOf(
                        iris.copy(alpha = 0.55f),
                        floor,
                        floor,
                    ),
                ),
            )
            .border(
                EliteBorder.Hairline,
                MaterialTheme.colorScheme.onBackground.copy(alpha = 0.10f),
                shape,
            )
            .testTag("elite_session_hero")
            .semantics { contentDescription = "Today session. $title. $subtitle. Double tap to $ctaLabel" },
    ) {
        Column(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .padding(EliteSpace.Lg)
                .fillMaxWidth(0.78f),
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
        ) {
            EliteSysLabel("TODAY · SESSION")
            Text(
                text = title,
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onBackground,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = "$metaLeft · $metaRight",
                style = EliteMonoTextStyle,
                color = volt.copy(alpha = 0.9f),
            )
            Spacer(modifier = Modifier.height(EliteSpace.Xs))
            EliteButton(
                label = ctaLabel,
                onClick = onCta,
                variant = EliteButtonVariant.Primary,
                contentDescription = "$ctaLabel. $title",
            )
        }
    }
}
