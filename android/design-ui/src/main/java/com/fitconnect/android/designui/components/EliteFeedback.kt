package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Snackbar
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun EliteEmptyState(
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(EliteSpace.Xl)
            .semantics { contentDescription = "$title. $body" },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EliteSysLabel("STATE · EMPTY")
        Text(title, style = MaterialTheme.typography.headlineMedium)
        Text(
            body,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (actionLabel != null && onAction != null) {
            EliteButton(label = actionLabel, onClick = onAction, variant = EliteButtonVariant.Secondary)
        }
    }
}

@Composable
fun EliteErrorView(
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    retryLabel: String = "Retry",
    onRetry: (() -> Unit)? = null,
) {
    EliteEmptyState(
        title = title,
        body = body,
        modifier = modifier,
        actionLabel = if (onRetry != null) retryLabel else null,
        onAction = onRetry,
    )
}

@Composable
fun EliteDialog(
    title: String,
    body: String,
    confirmLabel: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    dismissLabel: String = "Cancel",
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title, style = MaterialTheme.typography.titleLarge) },
        text = { Text(body, style = MaterialTheme.typography.bodyMedium) },
        confirmButton = {
            EliteButton(label = confirmLabel, onClick = onConfirm, variant = EliteButtonVariant.Primary)
        },
        dismissButton = {
            EliteButton(label = dismissLabel, onClick = onDismiss, variant = EliteButtonVariant.Ghost)
        },
    )
}

@Composable
fun EliteSnackbarHostContent(
    message: String,
    modifier: Modifier = Modifier,
) {
    Snackbar(modifier = modifier) {
        Text(message)
    }
}
