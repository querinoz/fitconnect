package com.fitconnect.android.telemetry.healthconnect

import android.content.Context
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.HeartRate
import com.fitconnect.shared.telemetry.MetricAvailability

/**
 * Typed Health Connect surface. Never duplicates Wear live HR.
 *
 * Precedence (documented, enforced by callers):
 * 1. Wear HR during an active exercise session
 * 2. Phone passive sensors (not implemented here)
 * 3. Health Connect historical records (read only when SDK + permission exist)
 */
interface HealthDataRepository {
    fun sdkAvailability(): MetricAvailability
    suspend fun latestHeartRate(nowEpochMs: Long): HeartRate
}

class UnavailableHealthDataRepository : HealthDataRepository {
    override fun sdkAvailability(): MetricAvailability = MetricAvailability.UNAVAILABLE
    override suspend fun latestHeartRate(nowEpochMs: Long): HeartRate =
        HeartRate.unavailable(
            timestampEpochMs = nowEpochMs,
            availability = MetricAvailability.UNAVAILABLE,
            source = DataSourceKind.HEALTH_CONNECT,
            deviceId = "health_connect",
        )
}

class AndroidHealthDataRepository(
    private val context: Context,
) : HealthDataRepository {
    override fun sdkAvailability(): MetricAvailability = HealthConnectAvailability.status(context)

    override suspend fun latestHeartRate(nowEpochMs: Long): HeartRate {
        val sdk = sdkAvailability()
        if (sdk != MetricAvailability.AVAILABLE) {
            return HeartRate.unavailable(
                timestampEpochMs = nowEpochMs,
                availability = sdk,
                source = DataSourceKind.HEALTH_CONNECT,
                deviceId = "health_connect",
            )
        }
        // SDK present is not the same as READ_HEART_RATE granted or records existing.
        return HeartRate.unavailable(
            timestampEpochMs = nowEpochMs,
            availability = MetricAvailability.PERMISSION_DENIED,
            source = DataSourceKind.HEALTH_CONNECT,
            deviceId = "health_connect",
        )
    }
}
