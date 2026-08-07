package com.fitconnect.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview

/**
 * F0 skeleton entry point. Proves the app module compiles and launches a
 * Compose screen — no Elite Surface tokens yet (the Kotlin/Compose token
 * generation pipeline is an F0/F3 follow-up per the `elite-surface` skill;
 * this screen is intentionally plain Material3 until that lands, rather
 * than hand-copying hex values that would immediately violate the
 * "zero hardcoded hex" rule the skill exists to enforce).
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FitConnectSkeletonApp()
        }
    }
}

@Composable
fun FitConnectSkeletonApp() {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("FitConnect — Elite OS (F0 skeleton)")
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun FitConnectSkeletonAppPreview() {
    FitConnectSkeletonApp()
}
