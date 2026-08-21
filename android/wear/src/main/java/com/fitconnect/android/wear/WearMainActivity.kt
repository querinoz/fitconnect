package com.fitconnect.android.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.wear.ambient.AmbientLifecycleObserver
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.MaterialTheme
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.shared.wear.WearPaths
import com.google.android.gms.wearable.Wearable

class WearMainActivity : ComponentActivity() {
    private val engine = LiveActivityEngine()
    private lateinit var sender: WearTelemetrySender
    private var ambient by mutableStateOf(false)
    private val ambientObserver by lazy {
        AmbientLifecycleObserver(
            this,
            object : AmbientLifecycleObserver.AmbientLifecycleCallback {
                override fun onEnterAmbient(ambientDetails: AmbientLifecycleObserver.AmbientDetails) {
                    ambient = true
                }

                override fun onExitAmbient() {
                    ambient = false
                }

                override fun onUpdateAmbient() = Unit
            },
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        sender = WearTelemetrySender(this)
        WearRuntime.engine = engine
        WearRuntime.deviceId = android.os.Build.MODEL
        WearRuntime.sessionId = "wear-${System.currentTimeMillis()}"
        lifecycle.addObserver(ambientObserver)
        runCatching {
            Wearable.getCapabilityClient(this).addLocalCapability(WearPaths.CAPABILITY)
        }
        val hrCapability = WearHealthServicesProbe.heartRate(this)
        setContent {
            val scheme = rememberEliteWearColorScheme(ambient = ambient)
            MaterialTheme(colorScheme = scheme) {
                CompositionLocalProvider(LocalWearAmbient provides ambient) {
                    AppScaffold {
                        WearInstrument(
                            engine = engine,
                            sender = sender,
                            hrCapability = hrCapability,
                            deviceId = WearRuntime.deviceId,
                            companionLabel = "LINK UNVERIFIED",
                        )
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        WearOngoingController.stop(this)
        WearRuntime.engine = null
        lifecycle.removeObserver(ambientObserver)
        runCatching {
            Wearable.getCapabilityClient(this).removeLocalCapability(WearPaths.CAPABILITY)
        }
        super.onDestroy()
    }
}
