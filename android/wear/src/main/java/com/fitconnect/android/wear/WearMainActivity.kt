package com.fitconnect.android.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text

/**
 * F0 skeleton — proves the empty wear/ module (D5) actually compiles and
 * links against Compose for Wear OS. No map (ADR-008: no map in v1 on
 * Wear), no recording UI — this is scaffolding, not a build commitment.
 */
class WearMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("FitConnect Wear (F0 skeleton)")
                }
            }
        }
    }
}
