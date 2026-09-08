package com.fitconnect.android.designui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.clickable
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteElevation
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteNavChrome
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
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

/**
 * Medium/expanded rail — same five destinations as [EliteFloatingNavBar].
 */
@Composable
fun EliteNavRail(
    items: List<EliteNavItem>,
    modifier: Modifier = Modifier,
    expanded: Boolean = false,
) {
    Column(
        modifier = modifier
            .statusBarsPadding()
            .navigationBarsPadding()
            .widthIn(
                min = if (expanded) {
                    196.dp
                } else {
                    Accessibility.MIN_TOUCH_TARGET_DP.dp + EliteSpace.Lg * 2
                },
            )
            .fillMaxHeight()
            .padding(horizontal = EliteSpace.Sm, vertical = EliteSpace.Md),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        horizontalAlignment = if (expanded) Alignment.Start else Alignment.CenterHorizontally,
    ) {
        items.forEach { item ->
            EliteNavRailTab(item, expanded)
        }
    }
}

@Composable
private fun EliteNavRailTab(item: EliteNavItem, expanded: Boolean) {
    val selectedColor = MaterialTheme.colorScheme.primary
    val idleColor = MaterialTheme.colorScheme.onSurfaceVariant
    val onSelected = MaterialTheme.colorScheme.onPrimary
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
            .clip(RoundedCornerShape(EliteRadius.Lg))
            .selectable(
                selected = item.selected,
                onClick = item.onClick,
                role = Role.Tab,
            )
            .then(
                if (item.selected) {
                    Modifier.background(
                        MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                        RoundedCornerShape(EliteRadius.Lg),
                    )
                } else {
                    Modifier
                },
            )
            .padding(vertical = EliteSpace.Xs)
            .semantics {
                contentDescription = if (item.selected) {
                    "${item.label}, selected"
                } else {
                    item.label
                }
            }
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
                contentDescription = null,
                tint = if (item.selected) onSelected else idleColor,
                modifier = Modifier.size(22.dp),
            )
        }
        if (expanded) {
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
}

@Composable
fun RowScope.EliteNavTab(
    item: EliteNavItem,
    selectedColor: Color = MaterialTheme.colorScheme.primary,
    docked: Boolean = false,
) {
    val idleColor = MaterialTheme.colorScheme.onSurfaceVariant
    val onSelected = if (docked) selectedColor else MaterialTheme.colorScheme.onPrimary
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val reduceMotion = reduceMotionEnabled()
    val scale by animateFloatAsState(
        targetValue = if (!reduceMotion && pressed) 0.92f else 1f,
        animationSpec = spring(dampingRatio = 0.72f, stiffness = 500f),
        label = "nav_tab_scale",
    )
    Column(
        modifier = Modifier
            .weight(1f)
            .heightIn(min = Accessibility.MIN_TOUCH_TARGET_DP.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(RoundedCornerShape(EliteRadius.Lg))
            .selectable(
                selected = item.selected,
                onClick = item.onClick,
                role = Role.Tab,
                interactionSource = interaction,
                indication = null,
            )
            .padding(vertical = EliteSpace.Xs)
            .semantics {
                contentDescription = if (item.selected) {
                    "${item.label}, selected"
                } else {
                    item.label
                }
            }
            .testTag(item.testTag),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs),
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(
                    width = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                    height = EliteSpace.Xxl,
                )
                .then(
                    if (docked) {
                        Modifier
                    } else {
                        Modifier
                            .shadow(
                                elevation = if (item.selected) EliteElevation.Mid else EliteElevation.None,
                                shape = RoundedCornerShape(EliteRadius.Full),
                                ambientColor = selectedColor.copy(alpha = EliteOpacity.Muted),
                                spotColor = selectedColor.copy(alpha = EliteOpacity.Subtle),
                            )
                            .clip(RoundedCornerShape(EliteRadius.Full))
                            .background(if (item.selected) selectedColor else Color.Transparent)
                    },
                ),
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = if (item.selected) onSelected else idleColor,
                modifier = Modifier.size(EliteSpace.Xl),
            )
        }
        Box(
            modifier = Modifier
                .width(EliteSpace.Xl)
                .height(EliteNavChrome.ActiveIndicator)
                .background(
                    if (item.selected) selectedColor else Color.Transparent,
                    RoundedCornerShape(EliteRadius.Full),
                ),
        )
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
        maxLines = 2,
        overflow = TextOverflow.Ellipsis,
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
