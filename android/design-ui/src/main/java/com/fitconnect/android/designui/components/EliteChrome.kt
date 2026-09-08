package com.fitconnect.android.designui.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceSpacing
import com.fitconnect.android.designui.brand.EosBoltMark
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.designui.brand.EosFitConnectWordmark
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteElevation
import com.fitconnect.android.designui.theme.EliteGlass
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.foundation.a11y.Accessibility

@Composable
fun EliteDivider(modifier: Modifier = Modifier) {
    HorizontalDivider(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.outline.copy(alpha = EliteOpacity.Border),
    )
}

@Composable
fun EliteBadge(
    text: String,
    modifier: Modifier = Modifier,
    containerColor: Color = MaterialTheme.colorScheme.primary,
    contentColor: Color = MaterialTheme.colorScheme.onPrimary,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(EliteRadius.Full))
            .background(containerColor)
            .padding(horizontal = EliteSpace.Sm, vertical = EliteSpace.Xxs),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MaterialTheme.typography.labelSmall, color = contentColor)
    }
}

@Composable
fun EliteChip(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    contentDescription: String? = null,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val reduceMotion = reduceMotionEnabled()
    val scale by animateFloatAsState(
        targetValue = if (!reduceMotion && pressed) 0.94f else 1f,
        animationSpec = spring(dampingRatio = 0.72f, stiffness = 480f),
        label = "chip_scale",
    )
    val volt = MaterialTheme.colorScheme.primary
    val floor = MaterialTheme.colorScheme.background
    val shape = RoundedCornerShape(EliteRadius.Full)
    val elevation by animateDpAsState(
        targetValue = when {
            reduceMotion -> EliteElevation.None
            pressed -> EliteElevation.None
            selected -> EliteElevation.Mid
            else -> EliteElevation.Low
        },
        label = "chip_elev",
    )
    Box(
        modifier = modifier
            .defaultMinSize(minHeight = Accessibility.MIN_TOUCH_TARGET_DP.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .shadow(
                elevation = elevation,
                shape = shape,
                ambientColor = if (selected) volt.copy(alpha = 0.4f) else Color.Black.copy(alpha = 0.5f),
                spotColor = if (selected) volt.copy(alpha = 0.55f) else Color.Black.copy(alpha = 0.6f),
            )
            .clip(shape)
            .background(
                brush = if (selected) {
                    Brush.verticalGradient(
                        listOf(
                            androidx.compose.ui.graphics.lerp(volt, Color.White, 0.18f),
                            volt,
                        ),
                    )
                } else {
                    Brush.verticalGradient(
                        listOf(
                            Color.White.copy(alpha = EliteGlass.Highlight),
                            MaterialTheme.colorScheme.surfaceVariant,
                        ),
                    )
                },
                shape = shape,
            )
            .border(
                EliteBorder.Hairline,
                if (selected) Color.White.copy(alpha = EliteGlass.Highlight) else volt.copy(alpha = 0.22f),
                shape,
            )
            .clickable(
                interactionSource = interaction,
                indication = null,
                onClick = onClick,
            )
            .padding(horizontal = EliteSpace.Lg, vertical = EliteSpace.Sm)
            .semantics {
                this.contentDescription = contentDescription ?: "Action $label"
            },
        contentAlignment = Alignment.Center,
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelLarge,
            color = if (selected) floor else MaterialTheme.colorScheme.onSurface,
        )
    }
}

/**
 * Quiet filter pill — solid Voltline when selected, hairline stroke when idle.
 * No yellow-white gradient (Feed / Create chrome).
 */
@Composable
fun EliteFilterChip(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val floor = EliteSurfaceColors.FLOOR.toColor()
    val carbon = EliteSurfaceColors.CARBON.toColor()
    val shape = RoundedCornerShape(EliteRadius.Full)
    Box(
        modifier = modifier
            .defaultMinSize(minHeight = Accessibility.MIN_TOUCH_TARGET_DP.dp)
            .clip(shape)
            .background(if (selected) volt else carbon)
            .border(
                EliteBorder.Hairline,
                if (selected) volt else volt.copy(alpha = EliteOpacity.Border),
                shape,
            )
            .clickable(onClick = onClick)
            .padding(horizontal = EliteSpace.Lg, vertical = EliteSpace.Sm)
            .semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelLarge,
            color = if (selected) floor else MaterialTheme.colorScheme.onSurface,
        )
    }
}

@Composable
fun EliteAvatar(
    initials: String,
    modifier: Modifier = Modifier,
    size: Int = Accessibility.PREFERRED_TOUCH_TARGET_DP,
    imageName: String? = null,
) {
    Box(
        modifier = modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.primary),
        contentAlignment = Alignment.Center,
    ) {
        if (!imageName.isNullOrBlank() && EliteLocalImageExists(imageName)) {
            EliteLocalImage(
                name = imageName,
                contentDescription = initials,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        } else {
            Text(
                text = initials.take(2).uppercase(),
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        }
    }
}

@Composable
fun EliteProgress(
    progress: Float?,
    modifier: Modifier = Modifier,
) {
    if (progress == null) {
        LinearProgressIndicator(modifier = modifier.fillMaxWidth())
    } else {
        LinearProgressIndicator(
            progress = { progress.coerceIn(0f, 1f) },
            modifier = modifier.fillMaxWidth(),
        )
    }
}

@Composable
fun EliteLoading(
    modifier: Modifier = Modifier,
    label: String = "SYS.SYNC",
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EosBoltMark(
            size = 72.dp,
            assemble = true,
            contentDescription = "FitConnect",
        )
        EosFitConnectWordmark(fontSize = 16.sp)
        EliteSysLabel(label)
    }
}

@Composable
fun EliteSkeleton(
    modifier: Modifier = Modifier,
    height: Int = EliteSurfaceSpacing.XXL,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height.dp)
            .clip(RoundedCornerShape(EliteRadius.Md))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = EliteOpacity.Muted)),
    )
}

@Composable
fun EliteTag(
    text: String,
    modifier: Modifier = Modifier,
) {
    EliteBadge(
        text = text,
        modifier = modifier,
        containerColor = MaterialTheme.colorScheme.surfaceVariant,
        contentColor = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}
