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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.designui.components.EliteErrorView
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.delay

@Composable
fun CoachScreenScaffold(
    title: String,
    testTag: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    overline: String? = "COACH OS",
    showTitle: Boolean = true,
    content: LazyListScope.() -> Unit,
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag(testTag),
        contentPadding = PaddingValues(EliteSpace.Lg),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        content = {
            if (showTitle) {
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
    // Parity with AthleteLoad — timeout + retry generation (impeccable harden / mobile-design).
    var generation by remember { mutableIntStateOf(0) }
    var timedOut by remember { mutableStateOf(false) }
    LaunchedEffect(result, generation) {
        timedOut = false
        if (result != null) return@LaunchedEffect
        delay(EliteSurfaceInstrument.LOAD_TIMEOUT_MS.toLong())
        timedOut = true
    }
    val retry = {
        generation += 1
        onRetry()
    }
    when {
        result is AppResult.Ok -> content(result.value)
        result is AppResult.Err -> EliteErrorView(
            title = "Couldn't load",
            body = "Check your connection or retry. Offline cache may be incomplete.",
            onRetry = retry,
        )
        timedOut -> EliteErrorView(
            title = "Taking too long",
            body = "The request did not finish. Try again when the network is ready.",
            onRetry = retry,
        )
        else -> EliteLoading(modifier = Modifier.padding(EliteSpace.Xl))
    }
}
