package com.fitconnect.android.designui.components

import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.foundation.a11y.Accessibility
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun HoldToConfirmButton(
    label: String,
    onConfirmed: () -> Unit,
    modifier: Modifier = Modifier,
    holdMs: Long = 1_500L,
) {
    var progress by remember { mutableFloatStateOf(0f) }
    var holding by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    var job by remember { mutableStateOf<Job?>(null) }
    Box(
        modifier = modifier
            .defaultMinSize(
                minWidth = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp,
                minHeight = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp,
            )
            .semantics { contentDescription = "Hold to $label" }
            .testTag("hold_to_confirm")
            .pointerInput(holdMs) {
                detectTapGestures(
                    onPress = {
                        holding = true
                        job?.cancel()
                        job = scope.launch {
                            val start = System.nanoTime()
                            while (true) {
                                val elapsed = (System.nanoTime() - start) / 1_000_000L
                                progress = (elapsed / holdMs.toFloat()).coerceIn(0f, 1f)
                                if (elapsed >= holdMs) {
                                    onConfirmed()
                                    break
                                }
                                delay(16)
                            }
                        }
                        try {
                            tryAwaitRelease()
                        } finally {
                            job?.cancel()
                            holding = false
                            progress = 0f
                        }
                    },
                )
            },
        contentAlignment = Alignment.Center,
    ) {
        if (holding) {
            CircularProgressIndicator(
                progress = { progress },
                modifier = Modifier.size(48.dp),
                color = MaterialTheme.colorScheme.primary,
            )
        }
        Text(label, style = MaterialTheme.typography.labelLarge)
    }
}
