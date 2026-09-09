package com.fitconnect.android.athlete.ui.map

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.components.EliteBottomSheet
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.geo.spots.Spot
import com.fitconnect.android.geo.spots.SpotAccess

/**
 * Map selection sheet for Spots / Secret Spots.
 * Uses EliteBottomSheet tokens. Never shows exact coordinates unless Spot.exact is authorized.
 */
@Composable
fun SpotBottomSheet(
    spot: Spot,
    onDismiss: () -> Unit,
    onView: () -> Unit,
    onSave: () -> Unit,
    onTrainHere: () -> Unit,
) {
    EliteBottomSheet(
        title = spot.name,
        onDismiss = onDismiss,
    ) {
        EliteStack(
            spacing = EliteSpace.Sm,
            modifier = Modifier.testTag("spot_bottom_sheet"),
        ) {
            if (spot.secret) {
                EliteSysLabel("SECRET SPOT")
                Text(
                    "Approximate location only",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text("Sport · ${spot.sportKey}", style = MaterialTheme.typography.bodyMedium)
            Text("Difficulty · ${spot.difficulty.name}", style = MaterialTheme.typography.bodyMedium)
            Text(
                "Risk · ${spot.risk.name} · confidence ${(spot.riskConfidence * 100).toInt()}%",
                style = MaterialTheme.typography.bodyMedium,
            )
            Text(
                "Access · ${
                    when (spot.access) {
                        SpotAccess.UNKNOWN -> "ACCESS STATUS UNKNOWN"
                        else -> spot.access.name
                    }
                }",
                style = MaterialTheme.typography.bodyMedium,
            )
            spot.exact?.let {
                Text("Exact: ${it.lat}, ${it.lng}", style = MaterialTheme.typography.labelSmall)
            } ?: Text(
                "Map shows privacy radius ~${spot.blurRadiusMeters.toInt()} m",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                EliteButton(
                    label = "VIEW",
                    onClick = onView,
                    variant = EliteButtonVariant.Secondary,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("spot_view"),
                )
                EliteButton(
                    label = "SAVE",
                    onClick = onSave,
                    variant = EliteButtonVariant.Secondary,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("spot_save"),
                )
            }
            EliteButton(
                label = "TRAIN HERE",
                onClick = onTrainHere,
                variant = EliteButtonVariant.Primary,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("spot_train_here"),
            )
        }
    }
}
