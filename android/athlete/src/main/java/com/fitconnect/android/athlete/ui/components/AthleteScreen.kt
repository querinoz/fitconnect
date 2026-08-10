package com.fitconnect.android.athlete.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.components.EliteErrorView
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.motion.EliteEnter
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult

@Composable
fun AthleteScreenScaffold(
    title: String,
    testTag: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    overline: String? = "ATHLETE OS",
    content: LazyListScope.() -> Unit,
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag(testTag),
        contentPadding = PaddingValues(EliteSpace.Lg),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        item {
            EliteEnter {
                Column {
                    overline?.let { EliteSysLabel(it) }
                    Text(title, style = MaterialTheme.typography.headlineMedium)
                    if (subtitle != null) {
                        Text(
                            subtitle,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = EliteSpace.Xs),
                        )
                    }
                }
            }
        }
        content()
    }
}

@Composable
fun <T> AthleteLoad(
    result: AppResult<T>?,
    onRetry: () -> Unit,
    content: @Composable (T) -> Unit,
) {
    when (result) {
        null -> EliteLoading(modifier = Modifier.padding(EliteSpace.Xl))
        is AppResult.Err -> EliteErrorView(
            title = "Couldn't load",
            body = "Check your connection or retry. Offline cache may be incomplete.",
            onRetry = onRetry,
        )
        is AppResult.Ok -> content(result.value)
    }
}

@Composable
fun ScoreBlock(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        Text(
            label.uppercase(),
            style = EliteMonoTextStyle,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            value,
            style = EliteMetricTextStyle,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}
