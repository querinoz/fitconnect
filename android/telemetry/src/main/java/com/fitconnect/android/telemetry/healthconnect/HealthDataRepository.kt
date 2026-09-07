package com.fitconnect.android.telemetry.healthconnect

import android.content.Context
import com.fitconnect.android.telemetry.domain.SleepSession
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.store.TelemetryStore
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
 *
 * Sleep/steps are durable via [TelemetryStore] — never invent demo values.
 */
interface HealthDataRepository {
    fun sdkAvailability(): MetricAvailability
    suspend fun latestHeartRate(nowEpochMs: Long): HeartRate
    suspend fun syncSleepAndSteps(athleteId: String, nowEpochMs: Long): HealthConnectSyncReport
    suspend fun latestSteps(athleteId: String): TelemetrySample?
    suspend fun latestSleepMinutes(athleteId: String): TelemetrySample?
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

    override suspend fun syncSleepAndSteps(athleteId: String, nowEpochMs: Long): HealthConnectSyncReport =
        HealthConnectSyncReport(
            sleepAvailability = MetricAvailability.UNAVAILABLE,
            stepsAvailability = MetricAvailability.UNAVAILABLE,
            sleepWritten = 0,
            stepsWritten = 0,
            sleepDuplicatesSkipped = 0,
            stepsDuplicatesReplaced = 0,
        )

    override suspend fun latestSteps(athleteId: String): TelemetrySample? = null
    override suspend fun latestSleepMinutes(athleteId: String): TelemetrySample? = null
}

class AndroidHealthDataRepository(
    private val context: Context,
    private val store: TelemetryStore,
    private val heartRateReader: HealthConnectHeartRateReader = HealthConnectHeartRateReader(context),
    private val durableSync: HealthConnectDurableSync = HealthConnectDurableSync(
        reader = HealthConnectSleepStepsReader(context),
        store = store,
    ),
) : HealthDataRepository {
    override fun sdkAvailability(): MetricAvailability = HealthConnectAvailability.status(context)

    override suspend fun latestHeartRate(nowEpochMs: Long): HeartRate = heartRateReader.latest(nowEpochMs)

    override suspend fun syncSleepAndSteps(athleteId: String, nowEpochMs: Long): HealthConnectSyncReport =
        durableSync.sync(athleteId, nowEpochMs)

    override suspend fun latestSteps(athleteId: String): TelemetrySample? =
        store.latestSample(athleteId, com.fitconnect.android.telemetry.domain.MetricType.STEPS)

    override suspend fun latestSleepMinutes(athleteId: String): TelemetrySample? =
        store.latestSample(athleteId, com.fitconnect.android.telemetry.domain.MetricType.SLEEP)
}
