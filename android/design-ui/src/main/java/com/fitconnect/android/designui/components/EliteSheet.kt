package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.fitconnect.android.designui.theme.EliteSpace

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
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(EliteSpace.Lg),
        ) {
            Text(title, style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
            content()
        }
    }
}
