package com.fitconnect.android.telemetry.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import com.fitconnect.shared.telemetry.MetricAvailability

/**
 * Probe only — does not invent samples. Missing APK/SDK → UNAVAILABLE.
 * SDK_AVAILABLE is not permission and is not a heart-rate reading.
 */
object HealthConnectAvailability {
    fun status(context: Context): MetricAvailability =
        try {
            when (HealthConnectClient.getSdkStatus(context)) {
                HealthConnectClient.SDK_AVAILABLE -> MetricAvailability.AVAILABLE
                else -> MetricAvailability.UNAVAILABLE
            }
        } catch (_: Throwable) {
            MetricAvailability.UNAVAILABLE
        }
}
