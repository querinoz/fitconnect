package com.fitconnect.android.athlete.ui.map

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.geo.spots.Spot
import com.fitconnect.android.geo.spots.SpotAccess

/**
 * Map selection sheet for Spots / Secret Spots.
 * Never shows exact coordinates unless Spot.exact is non-null (authorized).
 */
@Composable
fun SpotBottomSheet(
    spot: Spot,
    onView: () -> Unit,
    onSave: () -> Unit,
    onTrainHere: () -> Unit,
    modifier: Modifier = Modifier,
) {
    EosPremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("spot_bottom_sheet"),
    ) {
        Column(
            modifier = Modifier.padding(EliteSpace.Lg),
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            Text(spot.name, style = MaterialTheme.typography.titleLarge)
            if (spot.secret) {
                Text("SECRET SPOT · approximate location", style = MaterialTheme.typography.labelMedium)
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
            )
            TextButton(onClick = onView, modifier = Modifier.testTag("spot_view")) { Text("View") }
            TextButton(onClick = onSave, modifier = Modifier.testTag("spot_save")) { Text("Save") }
            TextButton(onClick = onTrainHere, modifier = Modifier.testTag("spot_train_here")) { Text("Train Here") }
        }
    }
}
