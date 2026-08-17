package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteGlass
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EliteBottomSheet(
    title: String,
    onDismiss: () -> Unit,
    content: @Composable ColumnScope.() -> Unit,
) {
    val state = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = state,
        containerColor = EliteSurfaceColors.CARBON.toColor().copy(alpha = EliteGlass.L4),
        tonalElevation = EliteSpace.None,
        scrimColor = MaterialTheme.colorScheme.background.copy(alpha = EliteGlass.L5),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(EliteSpace.Lg),
        ) {
            EliteSysLabel("SYS.SHEET")
            Text(title, style = MaterialTheme.typography.titleLarge)
            content()
        }
    }
}
