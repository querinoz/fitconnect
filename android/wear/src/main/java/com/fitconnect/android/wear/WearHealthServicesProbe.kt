package com.fitconnect.android.wear

import android.content.Context
import androidx.health.services.client.HealthServices
import androidx.health.services.client.data.DataType
import androidx.health.services.client.data.ExerciseType
import com.fitconnect.shared.telemetry.MetricAvailability
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

/**
 * Health Services capability probe — not a sensor grant and never a fabricated PASS.
 *
 * Where the SDK allows, queries passive monitoring / [ExerciseClient] capabilities for
 * HEART_RATE_BPM support without requiring live hardware samples:
 * - capability present → [MetricAvailability.PERMISSION_REQUIRED] (never AVAILABLE here)
 * - capability absent → [MetricAvailability.UNSUPPORTED]
 * - service missing → [MetricAvailability.UNAVAILABLE]
 * - timeout/interrupt → [MetricAvailability.FAILED]
 *
 * [MetricAvailability.AVAILABLE] requires a live sample path (Wear exercise integration).
 */
object WearHealthServicesProbe {
    private const val CAPABILITY_TIMEOUT_MS = 1_500L

    fun heartRate(context: Context): MetricAvailability {
        return try {
            val client = HealthServices.getClient(context)
            val hrSupported = resolveHeartRateSupported(client)
            when {
                hrSupported == null -> MetricAvailability.UNAVAILABLE
                !hrSupported -> MetricAvailability.UNSUPPORTED
                // Capability ≠ live sample. Never claim AVAILABLE without a sensor path.
                else -> MetricAvailability.PERMISSION_REQUIRED
            }
        } catch (_: TimeoutException) {
            MetricAvailability.FAILED
        } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
            MetricAvailability.FAILED
        } catch (_: Throwable) {
            MetricAvailability.UNAVAILABLE
        }
    }

    /**
     * Returns true/false when capability query succeeds; null when the service cannot
     * answer (treat as unavailable — do not invent support).
     */
    internal fun resolveHeartRateSupported(
        client: androidx.health.services.client.HealthServicesClient,
    ): Boolean? {
        val passive = runCatching {
            client.passiveMonitoringClient
                .getCapabilitiesAsync()
                .get(CAPABILITY_TIMEOUT_MS, TimeUnit.MILLISECONDS)
        }.getOrNull()
        if (passive != null) {
            val supported = DataType.HEART_RATE_BPM in passive.supportedDataTypesPassiveMonitoring
            if (supported) return true
        }

        val exercise = runCatching {
            client.exerciseClient
                .getCapabilitiesAsync()
                .get(CAPABILITY_TIMEOUT_MS, TimeUnit.MILLISECONDS)
        }.getOrNull() ?: return if (passive != null) false else null

        val types = exercise.supportedExerciseTypes
        if (types.isEmpty()) return false
        return types.any { type ->
            heartRateInExerciseType(exercise, type)
        }
    }

    private fun heartRateInExerciseType(
        capabilities: androidx.health.services.client.data.ExerciseCapabilities,
        type: ExerciseType,
    ): Boolean = runCatching {
        DataType.HEART_RATE_BPM in capabilities.getExerciseTypeCapabilities(type).supportedDataTypes
    }.getOrDefault(false)
}
