package com.fitconnect.android.designui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

enum class EosStoryState {
    Unseen,
    Seen,
    Active,
    Live,
    Locked,
}

/**
 * Canonical story ring — Voltline / Iris / muted by [EosStoryState].
 */
@Composable
fun EosStoryRing(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    imageName: String? = null,
    state: EosStoryState = EosStoryState.Unseen,
    isAdd: Boolean = false,
    size: Dp = 72.dp,
    userIdForHexatar: String? = null,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val iris = EliteSurfaceColors.IRIS.toColor()
    val telemetry = EliteSurfaceColors.TELEMETRY.toColor()
    val ring = when (state) {
        EosStoryState.Unseen -> volt
        EosStoryState.Seen -> MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.55f)
        EosStoryState.Active -> iris
        EosStoryState.Live -> telemetry
        EosStoryState.Locked -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.25f)
    }
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .clickable(enabled = state != EosStoryState.Locked, onClick = onClick)
            .semantics { contentDescription = "Story $label" },
    ) {
        Box(
            modifier = Modifier
                .size(size)
                .border(2.dp, ring, CircleShape)
                .padding(3.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center,
        ) {
            when {
                isAdd -> Icon(
                    imageVector = Icons.Outlined.Add,
                    contentDescription = null,
                    tint = volt,
                    modifier = Modifier.size(28.dp),
                )
                imageName != null && EliteLocalImageExists(imageName) ->
                    EliteLocalImage(
                        name = imageName,
                        contentDescription = label,
                        modifier = Modifier.fillMaxSize(),
                    )
                else -> EliteHexatar(
                    userId = userIdForHexatar ?: label,
                    contentDescription = label,
                    diameter = size - 12.dp,
                )
            }
        }
        Spacer(modifier = Modifier.height(EliteSpace.Xxs))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
        )
    }
}
