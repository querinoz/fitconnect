package com.fitconnect.android.designui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

data class EliteNavItem(
    val label: String,
    val icon: ImageVector,
    val selected: Boolean,
    val onClick: () -> Unit,
    val testTag: String,
)

/**
 * Floating pill bottom navigation — Elite OS shell, not default Material NavigationBar.
 */
@Composable
fun EliteFloatingNavBar(
    items: List<EliteNavItem>,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = EliteSpace.Lg, vertical = EliteSpace.Sm),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(EliteRadius.Xl))
                .background(com.fitconnect.android.design.EliteSurfaceColors.CARBON.toColor().copy(alpha = 0.94f))
                .border(
                    width = EliteBorder.Hairline,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = EliteOpacity.Border),
                    shape = RoundedCornerShape(EliteRadius.Xl),
                )
                .padding(horizontal = EliteSpace.Xs, vertical = EliteSpace.Xs),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            items.forEach { item ->
                EliteNavTab(item)
            }
        }
    }
}

@Composable
private fun RowScope.EliteNavTab(item: EliteNavItem) {
    val selectedColor = MaterialTheme.colorScheme.primary
    val idleColor = MaterialTheme.colorScheme.onSurfaceVariant
    val onSelected = MaterialTheme.colorScheme.onPrimary
    Column(
        modifier = Modifier
            .weight(1f)
            .heightIn(min = Accessibility.MIN_TOUCH_TARGET_DP.dp)
            .clip(RoundedCornerShape(EliteRadius.Lg))
            .selectable(
                selected = item.selected,
                onClick = item.onClick,
                role = Role.Tab,
            )
            .padding(vertical = EliteSpace.Xs)
            .testTag(item.testTag),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs),
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(width = 48.dp, height = 32.dp)
                .clip(RoundedCornerShape(EliteRadius.Full))
                .background(if (item.selected) selectedColor else Color.Transparent),
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = item.label,
                tint = if (item.selected) onSelected else idleColor,
                modifier = Modifier.size(22.dp),
            )
        }
        Text(
            text = item.label,
            style = MaterialTheme.typography.labelSmall,
            color = if (item.selected) selectedColor else idleColor,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            softWrap = false,
        )
    }
}

@Composable
fun EliteSysLabel(
    text: String,
    modifier: Modifier = Modifier,
) {
    Text(
        text = text.uppercase(),
        style = EliteMonoTextStyle,
        color = com.fitconnect.android.design.EliteSurfaceColors.INSTRUMENT_MUTED.toColor(),
        modifier = modifier,
    )
}

@Composable
fun EliteSectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    overline: String? = null,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs)) {
        overline?.let { EliteSysLabel(it) }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                title,
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier
                    .weight(1f)
                    .semantics { heading() },
            )
            if (actionLabel != null && onAction != null) {
                Text(
                    text = actionLabel.uppercase(),
                    style = EliteMonoTextStyle,
                    color = com.fitconnect.android.design.EliteSurfaceColors.INSTRUMENT_MUTED.toColor(),
                    modifier = Modifier
                        .heightIn(min = Accessibility.MIN_TOUCH_TARGET_DP.dp)
                        .clickable(onClick = onAction)
                        .padding(horizontal = EliteSpace.Sm)
                        .semantics { contentDescription = actionLabel },
                )
            }
        }
    }
}

@Composable
fun EliteOnboardingProgress(
    step: Int,
    total: Int,
    modifier: Modifier = Modifier,
) {
    val clamped = step.coerceIn(0, (total - 1).coerceAtLeast(0))
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
        EliteSysLabel("SYS.INIT · STEP ${clamped + 1}/$total")
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
        ) {
            repeat(total) { index ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(4.dp)
                        .clip(RoundedCornerShape(EliteRadius.Full))
                        .background(
                            if (index <= clamped) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.surfaceVariant
                            },
                        ),
                )
            }
        }
    }
}
