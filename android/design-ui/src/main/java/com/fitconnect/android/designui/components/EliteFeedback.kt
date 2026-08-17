package com.fitconnect.android.designui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Sensors
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Snackbar
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.atmosphere.HoneycombMesh
import com.fitconnect.android.designui.atmosphere.LocalHoneycombEmptyBoost
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

@Composable
fun EliteEmptyState(
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    val boost = LocalHoneycombEmptyBoost.current
    DisposableEffect(Unit) {
        if (boost != null) boost.value = true
        onDispose { if (boost != null) boost.value = false }
    }
    val volt = MaterialTheme.colorScheme.primary
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(EliteSpace.Xl)
            .semantics { contentDescription = "$title. $body" },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        Canvas(modifier = Modifier.size(EliteRingInline)) {
            val verts = HoneycombMesh.hexVertices(
                size.width / 2f,
                size.height / 2f,
                size.minDimension * 0.42f,
            )
            val path = Path().apply {
                moveTo(verts[0], verts[1])
                var i = 1
                while (i < 6) {
                    lineTo(verts[i * 2], verts[i * 2 + 1])
                    i++
                }
                close()
            }
            drawPath(
                path,
                color = volt.copy(alpha = 0.35f),
                style = Stroke(width = 2.dp.toPx()),
            )
        }
        EliteSysLabel("NO DATA YET")
        Text(title, style = MaterialTheme.typography.headlineMedium)
        Text(
            body,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (actionLabel != null && onAction != null) {
            EliteButton(
                label = actionLabel,
                onClick = onAction,
                variant = EliteButtonVariant.Secondary,
            )
        }
    }
}

@Composable
fun EliteErrorView(
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    retryLabel: String = "Try again",
    onRetry: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(EliteSpace.Xl)
            .semantics { contentDescription = "$title. $body" },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        Icon(
            imageVector = Icons.Outlined.Sensors,
            contentDescription = null,
            tint = EliteSurfaceColors.TELEMETRY.toColor(),
            modifier = Modifier.size(36.dp),
        )
        EliteSysLabel("STATE · ERROR")
        Text(title, style = MaterialTheme.typography.headlineMedium)
        Text(
            body,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (onRetry != null) {
            EliteButton(
                label = retryLabel,
                onClick = onRetry,
                variant = EliteButtonVariant.Secondary,
            )
        }
    }
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
        title = { Text(title, style = MaterialTheme.typography.headlineSmall) },
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
