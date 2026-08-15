package com.fitconnect.android.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase
import kotlinx.coroutines.delay

/**
 * Operational Wear shell — LOCAL_DEMO activity controls.
 * Phone ↔ watch DataLayer sync is not executed here (PENDING_HUMAN device).
 */
class WearMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                WearHome()
            }
        }
    }
}

@Composable
private fun WearHome() {
    val engine = remember { LiveActivityEngine() }
    val snap by engine.state.collectAsState()
    LaunchedEffect(snap.phase) {
        if (snap.phase != LiveActivityPhase.RUNNING) return@LaunchedEffect
        while (true) {
            delay(1_000)
            if (engine.state.value.phase != LiveActivityPhase.RUNNING) break
            engine.tick()
        }
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("FitConnect")
        Text("Readiness 78 · ${snap.sourceLabel}")
        Text(LiveActivityEngine.formatElapsed(snap.elapsedMs))
        Text(snap.hrBpm?.let { "HR $it · Z${snap.zone}" } ?: "HR —")
        when (snap.phase) {
            LiveActivityPhase.IDLE, LiveActivityPhase.ENDED -> {
                Button(onClick = { engine.start("Run") }, modifier = Modifier.fillMaxWidth()) {
                    Text("START")
                }
            }
            LiveActivityPhase.RUNNING -> {
                Button(onClick = engine::pause, modifier = Modifier.fillMaxWidth()) {
                    Text("PAUSE")
                }
                Button(onClick = engine::end, modifier = Modifier.fillMaxWidth()) {
                    Text("END")
                }
            }
            LiveActivityPhase.PAUSED -> {
                Button(onClick = engine::resume, modifier = Modifier.fillMaxWidth()) {
                    Text("RESUME")
                }
                Button(onClick = engine::end, modifier = Modifier.fillMaxWidth()) {
                    Text("END")
                }
            }
        }
    }
}
