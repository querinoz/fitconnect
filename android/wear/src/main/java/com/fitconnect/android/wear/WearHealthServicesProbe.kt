package com.fitconnect.android.wear

import android.content.Context
import androidx.health.services.client.HealthServices
import com.fitconnect.shared.telemetry.MetricAvailability

/**
 * Health Services capability probe. Client construction is not a sensor.
 * Missing client, missing capability, or probe failure → UNAVAILABLE.
 * Never returns a fabricated bpm.
 */
object WearHealthServicesProbe {
    fun heartRate(context: Context): MetricAvailability {
        return try {
            HealthServices.getClient(context)
            MetricAvailability.UNAVAILABLE
        } catch (_: Throwable) {
            MetricAvailability.UNAVAILABLE
        }
    }
}
