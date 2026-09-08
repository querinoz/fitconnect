package com.fitconnect.android.athlete.ui.profile

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Bolt
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.MusicNote
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.Watch
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.connections.ConnectionCategory
import com.fitconnect.android.athlete.connections.ConnectionState
import com.fitconnect.android.athlete.connections.DefaultConnectionsCatalog
import com.fitconnect.android.athlete.connections.IntegrationConnection
import com.fitconnect.android.designui.components.EliteSettingsRow
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Profile → Connections hub: devices, fitness, music, social, automation.
 * Tokens never rendered — status only.
 */
@Composable
fun ConnectionCenterCard(
    onOpenSettings: () -> Unit,
    onOpenTelemetry: () -> Unit,
    catalog: DefaultConnectionsCatalog = DefaultConnectionsCatalog(),
) {
    EosPremiumCard(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("profile_connections"),
    ) {
        EliteStack(spacing = EliteSpace.Md) {
            Text("Connection Center", style = MaterialTheme.typography.titleSmall)
            Text(
                "Wear, Health Connect, Spotify (metadata), Strava (personal only), social distribution, Zapier automation.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Section(ConnectionCategory.DEVICES, catalog) { row ->
                when (row.id) {
                    "health_connect" -> onOpenTelemetry()
                    else -> onOpenSettings()
                }
            }
            Section(ConnectionCategory.FITNESS, catalog) { onOpenSettings() }
            Section(ConnectionCategory.MUSIC, catalog) { onOpenSettings() }
            Section(ConnectionCategory.SOCIAL, catalog) { onOpenSettings() }
            Section(ConnectionCategory.AUTOMATION, catalog) { onOpenSettings() }
            Section(ConnectionCategory.CALENDAR, catalog) { onOpenSettings() }
        }
    }
}

@Composable
private fun Section(
    category: ConnectionCategory,
    catalog: DefaultConnectionsCatalog,
    onClick: (IntegrationConnection) -> Unit,
) {
    EliteSysLabel(category.name.replace('_', ' '))
    catalog.byCategory(category).forEach { row ->
        EliteSettingsRow(
            title = row.displayName,
            icon = when (category) {
                ConnectionCategory.DEVICES -> Icons.Outlined.Watch
                ConnectionCategory.FITNESS -> Icons.Outlined.FitnessCenter
                ConnectionCategory.MUSIC -> Icons.Outlined.MusicNote
                ConnectionCategory.SOCIAL -> Icons.Outlined.Share
                ConnectionCategory.AUTOMATION -> Icons.Outlined.Bolt
                ConnectionCategory.CALENDAR -> Icons.Outlined.CalendarMonth
            },
            trailing = row.state.label(),
            onClick = { onClick(row) },
        )
        row.detail?.let {
            Text(it, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private fun ConnectionState.label(): String = when (this) {
    ConnectionState.DISCONNECTED -> "CONNECT"
    ConnectionState.CONNECTED -> "CONNECTED"
    ConnectionState.SYNCING -> "SYNCING"
    ConnectionState.EXPIRED -> "EXPIRED"
    ConnectionState.NEEDS_ATTENTION -> "ATTENTION"
    ConnectionState.PERMISSION_REQUIRED -> "PERMISSION"
}
