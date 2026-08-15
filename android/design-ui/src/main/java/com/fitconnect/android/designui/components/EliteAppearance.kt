package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.theme.ThemeMode

@Composable
fun EliteAppearancePicker(
    mode: ThemeMode,
    onModeChange: (ThemeMode) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("appearance_picker"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        EliteSysLabel("APPEARANCE")
        Text(
            "Dark / Light",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
        )
        Text(
            "Dark keeps Elite OS telemetry. Light lifts contrast for daylight.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        EliteFlowRow(
            modifier = Modifier.selectableGroup(),
            spacing = EliteSpace.Xs,
        ) {
            listOf(
                ThemeMode.DARK to "Dark",
                ThemeMode.LIGHT to "Light",
                ThemeMode.SYSTEM to "System",
            ).forEach { (value, label) ->
                EliteChip(
                    label = label,
                    selected = mode == value,
                    onClick = { onModeChange(value) },
                    modifier = Modifier.testTag("appearance_${value.name.lowercase()}"),
                )
            }
        }
    }
}
