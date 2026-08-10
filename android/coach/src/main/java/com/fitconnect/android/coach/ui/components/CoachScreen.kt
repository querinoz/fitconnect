package com.fitconnect.android.coach.ui.components

import androidx.compose.foundation.layout.Arrangement
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
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult

@Composable
fun CoachScreenScaffold(
    title: String,
    testTag: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    overline: String? = "COACH OS",
    content: LazyListScope.() -> Unit,
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag(testTag),
        contentPadding = PaddingValues(EliteSpace.Lg),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        content = {
            item {
                com.fitconnect.android.designui.motion.EliteEnter {
                    androidx.compose.foundation.layout.Column {
                        overline?.let {
                            com.fitconnect.android.designui.components.EliteSysLabel(it)
                        }
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
        },
    )
}

@Composable
fun <T> CoachLoad(
    result: AppResult<T>?,
    onRetry: () -> Unit,
    content: @Composable (T) -> Unit,
) {
    when (result) {
        null -> EliteLoading(modifier = Modifier.padding(EliteSpace.Xl))
        is AppResult.Err -> EliteErrorView(
            title = "Couldn't load",
            body = "Offline cache may be incomplete. Retry when ready.",
            onRetry = onRetry,
        )
        is AppResult.Ok -> content(result.value)
    }
}
