package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun EliteConnectedAccounts(
    emailConnected: Boolean,
    googleConnected: Boolean,
    appleConnected: Boolean,
    onLinkGoogle: () -> Unit,
    onLinkApple: () -> Unit,
    onLinkEmail: () -> Unit,
    onUnlinkGoogle: () -> Unit,
    onUnlinkApple: () -> Unit,
    modifier: Modifier = Modifier,
    busy: Boolean = false,
) {
    EliteCard(modifier = modifier.testTag("connected_accounts")) {
        EliteStack(spacing = EliteSpace.Md) {
            EliteSysLabel("CONNECTED ACCOUNTS")
            Text(
                "Identity providers linked to this session. Accounts are never merged silently.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            ProviderRow("Email", emailConnected, busy, onConnect = onLinkEmail, onDisconnect = null)
            ProviderRow("Google", googleConnected, busy, onConnect = onLinkGoogle, onDisconnect = onUnlinkGoogle)
            ProviderRow("Apple", appleConnected, busy, onConnect = onLinkApple, onDisconnect = onUnlinkApple)
        }
    }
}

@Composable
private fun ProviderRow(
    name: String,
    connected: Boolean,
    busy: Boolean,
    onConnect: () -> Unit,
    onDisconnect: (() -> Unit)?,
) {
    EliteStack(spacing = EliteSpace.Xxs) {
        Text(name, style = MaterialTheme.typography.titleMedium)
        Text(
            if (connected) "CONNECTED" else "NOT CONNECTED",
            style = MaterialTheme.typography.labelLarge,
            color = if (connected) MaterialTheme.colorScheme.primary
            else MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (connected && onDisconnect != null) {
            EliteButton(
                label = "Disconnect $name",
                variant = EliteButtonVariant.Ghost,
                enabled = !busy,
                onClick = onDisconnect,
                modifier = Modifier.fillMaxWidth(),
            )
        } else if (!connected) {
            EliteButton(
                label = "Connect $name",
                variant = EliteButtonVariant.Secondary,
                enabled = !busy,
                onClick = onConnect,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
