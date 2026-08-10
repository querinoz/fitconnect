package com.fitconnect.android.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.fitconnect.android.foundation.common.Logger

/**
 * Recovery shell for foundation navigation. Compose lacks a true React-style
 * error boundary; feature screens should set [error] from effects when they
 * catch failures so users always get a retry path.
 */
@Composable
fun ErrorBoundary(
    logger: Logger,
    content: @Composable () -> Unit,
) {
    var error by remember { mutableStateOf<Throwable?>(null) }
    val current = error
    if (current != null) {
        LaunchedEffect(current) {
            logger.e("ErrorBoundary", "Recoverable UI failure", current)
        }
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = "Something went wrong",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.error,
            )
            Button(onClick = { error = null }, modifier = Modifier.padding(top = 16.dp)) {
                Text("Retry")
            }
        }
    } else {
        content()
    }
}
