package com.fitconnect.android.designui.components

import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.toColor

@Composable
fun EliteTrainFab(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    expanded: Boolean = false,
) {
    FloatingActionButton(
        onClick = onClick,
        modifier = modifier
            .testTag("athlete_train_fab")
            .semantics { contentDescription = "Train" },
        containerColor = EliteSurfaceColors.VOLTLINE.toColor(),
        contentColor = MaterialTheme.colorScheme.onPrimary,
    ) {
        if (expanded) {
            Text("Train")
        } else {
            Icon(
                imageVector = Icons.Filled.PlayArrow,
                contentDescription = "Train",
            )
        }
    }
}
