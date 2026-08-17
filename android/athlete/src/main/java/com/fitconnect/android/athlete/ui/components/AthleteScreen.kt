package com.fitconnect.android.athlete.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.ui.LocalAthleteHeaderController
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteErrorView
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.motion.EliteEnter
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun AthleteScreenScaffold(
    title: String,
    testTag: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    overline: String? = "ATHLETE OS",
    showTitle: Boolean = true,
    floating: (@Composable BoxScope.() -> Unit)? = null,
    content: LazyListScope.() -> Unit,
) {
    val listState = rememberLazyListState()
    val header = LocalAthleteHeaderController.current
    val scope = rememberCoroutineScope()
    DisposableEffect(listState, header) {
        header.onScrollToTop = { scope.launch { listState.animateScrollToItem(0) } }
        onDispose { header.onScrollToTop = {} }
    }
    Box(modifier = modifier.fillMaxSize()) {
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .testTag(testTag),
            contentPadding = PaddingValues(
                start = EliteSpace.Lg,
                end = EliteSpace.Lg,
                top = EliteSpace.Lg,
                bottom = if (floating != null) EliteSpace.Huge + EliteSpace.Section else EliteSpace.Xl,
            ),
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        ) {
            if (showTitle) {
                item {
                    EliteEnter {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                overline?.let { EliteSysLabel(it) }
                                EliteBadge(
                                    text = DemoPersona.MODE_LABEL,
                                    modifier = Modifier.testTag("athlete_local_demo_badge"),
                                )
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
        }
        if (floating != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(EliteSpace.Lg),
                contentAlignment = Alignment.BottomEnd,
                content = { floating() },
            )
        }
    }
}

@Composable
fun <T> AthleteLoad(
    result: AppResult<T>?,
    onRetry: () -> Unit,
    content: @Composable (T) -> Unit,
) {
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
            body = "The request did not finish. Try again — this is not live telemetry.",
            onRetry = retry,
        )
        else -> EliteLoading(modifier = Modifier.padding(EliteSpace.Xl))
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
