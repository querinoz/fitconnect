package com.fitconnect.android.designui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AssistChip
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceSpacing
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
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
) {
    AssistChip(
        onClick = onClick,
        label = { Text(label) },
        modifier = modifier.defaultMinSize(minHeight = Accessibility.MIN_TOUCH_TARGET_DP.dp),
        shape = RoundedCornerShape(EliteRadius.Full),
        colors = androidx.compose.material3.AssistChipDefaults.assistChipColors(
            containerColor = if (selected) {
                MaterialTheme.colorScheme.primary.copy(alpha = 0.18f)
            } else {
                MaterialTheme.colorScheme.surfaceVariant
            },
            labelColor = if (selected) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
        ),
        border = androidx.compose.material3.AssistChipDefaults.assistChipBorder(
            enabled = true,
            borderColor = if (selected) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.outline.copy(alpha = EliteOpacity.Border)
            },
        ),
    )
}

@Composable
fun EliteAvatar(
    initials: String,
    modifier: Modifier = Modifier,
    size: Int = Accessibility.PREFERRED_TOUCH_TARGET_DP,
) {
    Box(
        modifier = modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.secondary),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = initials.take(2).uppercase(),
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSecondary,
        )
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
fun EliteLoading(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
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
