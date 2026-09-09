package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosGlassBadge
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

/**
 * Dashboard masthead — greeting first, then context. Brand chrome lives in shell header.
 */
@Composable
fun TodayEditorialHeader(
    greeting: String,
    modifier: Modifier = Modifier,
    identityBadge: String? = null,
    onNotifications: (() -> Unit)? = null,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_editorial_header"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            EliteSysLabel("TODAY")
            Row(
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                identityBadge?.let { label ->
                    EosGlassBadge(
                        text = label,
                        modifier = Modifier.testTag(
                            if (label == "LOCAL_DEMO") "athlete_local_demo_badge"
                            else "athlete_identity_badge",
                        ),
                    )
                }
                if (onNotifications != null) {
                    IconButton(
                        onClick = onNotifications,
                        modifier = Modifier.size(Accessibility.MIN_TOUCH_TARGET_DP.dp),
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Notifications,
                            contentDescription = "Notifications",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
        Text(
            text = greeting,
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = "How you are · what to do · what changed",
            style = MaterialTheme.typography.bodyMedium,
            color = volt,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
