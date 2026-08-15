package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Vertical stack for LazyColumn items. Multiple children in a single `item {}`
 * otherwise paint at the same origin and overlap.
 */
@Composable
fun EliteStack(
    modifier: Modifier = Modifier,
    spacing: Dp = EliteSpace.Md,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(spacing),
        content = content,
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun EliteFlowRow(
    modifier: Modifier = Modifier,
    spacing: Dp = EliteSpace.Sm,
    content: @Composable () -> Unit,
) {
    FlowRow(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(spacing),
        verticalArrangement = Arrangement.spacedBy(spacing),
        content = { content() },
    )
}
