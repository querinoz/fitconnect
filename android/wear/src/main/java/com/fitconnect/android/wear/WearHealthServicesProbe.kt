package com.fitconnect.android.wear

import android.content.Context
import androidx.health.services.client.HealthServices
import com.fitconnect.shared.telemetry.MetricAvailability

/**
 * Health Services capability probe. Client construction is not a sensor grant.
 * Full [androidx.health.services.client.capability.Capabilities] check ships with
 * Wear exercise integration (P7) — this probe only validates classpath + client.
 */
object WearHealthServicesProbe {
    fun heartRate(context: Context): MetricAvailability {
        return try {
            HealthServices.getClient(context)
            MetricAvailability.PERMISSION_REQUIRED
        } catch (_: Throwable) {
            MetricAvailability.UNAVAILABLE
        }
    }
}
