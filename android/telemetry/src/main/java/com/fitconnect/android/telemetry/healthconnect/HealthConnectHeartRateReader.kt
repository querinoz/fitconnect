package com.fitconnect.android.telemetry.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.HeartRate
import com.fitconnect.shared.telemetry.MetricAvailability
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * Reads the latest [HeartRateRecord] sample when SDK + permission are present.
 * Does not compete with Wear live HR during an active session (callers enforce precedence).
 */
class HealthConnectHeartRateReader(
    private val context: Context,
) {
    suspend fun latest(nowEpochMs: Long): HeartRate {
        val sdk = HealthConnectAvailability.status(context)
        if (sdk != MetricAvailability.AVAILABLE) {
            return HeartRate.unavailable(
                timestampEpochMs = nowEpochMs,
                availability = sdk,
                source = DataSourceKind.HEALTH_CONNECT,
                deviceId = "health_connect",
            )
        }
        val client = runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()
            ?: return HeartRate.unavailable(
                timestampEpochMs = nowEpochMs,
                availability = MetricAvailability.UNAVAILABLE,
                source = DataSourceKind.HEALTH_CONNECT,
                deviceId = "health_connect",
            )
        val readPerm = HealthPermission.getReadPermission(HeartRateRecord::class)
        val granted = runCatching { client.permissionController.getGrantedPermissions() }.getOrElse { emptySet() }
        if (!granted.contains(readPerm)) {
            return HeartRate.unavailable(
                timestampEpochMs = nowEpochMs,
                availability = MetricAvailability.PERMISSION_DENIED,
                source = DataSourceKind.HEALTH_CONNECT,
                deviceId = "health_connect",
            )
        }
        val end = Instant.ofEpochMilli(nowEpochMs)
        val start = end.minus(7, ChronoUnit.DAYS)
        val page = runCatching {
            client.readRecords(
                ReadRecordsRequest(
                    recordType = HeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(start, end),
                    pageSize = 1,
                    ascendingOrder = false,
                ),
            )
        }.getOrNull() ?: return HeartRate.unavailable(
            timestampEpochMs = nowEpochMs,
            availability = MetricAvailability.UNAVAILABLE,
            source = DataSourceKind.HEALTH_CONNECT,
            deviceId = "health_connect",
        )
        val sample = page.records.firstOrNull()
            ?.samples
            ?.maxByOrNull { it.time.toEpochMilli() }
        if (sample == null) {
            return HeartRate.unavailable(
                timestampEpochMs = nowEpochMs,
                availability = MetricAvailability.UNAVAILABLE,
                source = DataSourceKind.HEALTH_CONNECT,
                deviceId = "health_connect",
            )
        }
        return HeartRate(
            bpm = sample.beatsPerMinute.toInt(),
            timestampEpochMs = sample.time.toEpochMilli(),
            availability = MetricAvailability.AVAILABLE,
            source = DataSourceKind.HEALTH_CONNECT,
            deviceId = "health_connect",
        )
    }
}
