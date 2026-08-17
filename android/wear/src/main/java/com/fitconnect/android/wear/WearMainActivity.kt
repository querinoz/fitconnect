package com.fitconnect.android.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.shared.wear.WearPaths
import com.google.android.gms.wearable.Wearable

class WearMainActivity : ComponentActivity() {
    private val engine = LiveActivityEngine()
    private lateinit var sender: WearTelemetrySender

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sender = WearTelemetrySender(this)
        WearRuntime.engine = engine
        WearRuntime.sessionId = "wear-${System.currentTimeMillis()}"
        runCatching {
            Wearable.getCapabilityClient(this).addLocalCapability(WearPaths.CAPABILITY)
        }
        val hrCapability = WearHealthServicesProbe.heartRate(this)
        setContent {
            MaterialTheme(colors = eliteWearColors()) {
                WearInstrument(
                    engine = engine,
                    sender = sender,
                    hrCapability = hrCapability,
                    deviceId = android.os.Build.MODEL,
                    companionLabel = "LINK UNVERIFIED",
                )
            }
        }
    }

    override fun onDestroy() {
        WearRuntime.engine = null
        runCatching {
            Wearable.getCapabilityClient(this).removeLocalCapability(WearPaths.CAPABILITY)
        }
        super.onDestroy()
    }
}

private fun eliteWearColors() = Colors(
    primary = Color(EliteSurfaceColors.VOLTLINE),
    primaryVariant = Color(EliteSurfaceColors.VOLT_600),
    secondary = Color(EliteSurfaceColors.TELEMETRY),
    background = Color(EliteSurfaceColors.FLOOR),
    surface = Color(EliteSurfaceColors.CARBON),
    error = Color(EliteSurfaceColors.ALERT),
    onPrimary = Color(EliteSurfaceColors.FLOOR),
    onSecondary = Color(EliteSurfaceColors.FLOOR),
    onBackground = Color(EliteSurfaceColors.ON_SURFACE),
    onSurface = Color(EliteSurfaceColors.ON_SURFACE),
    onError = Color(EliteSurfaceColors.ON_SURFACE),
)
