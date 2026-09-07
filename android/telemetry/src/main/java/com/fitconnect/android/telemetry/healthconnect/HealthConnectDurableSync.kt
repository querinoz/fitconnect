package com.fitconnect.android.telemetry.healthconnect

import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.SleepSession
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.store.TelemetryStore
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.units.TelemetryUnit
import com.fitconnect.shared.telemetry.MetricAvailability

data class HealthConnectSyncReport(
    val sleepAvailability: MetricAvailability,
    val stepsAvailability: MetricAvailability,
    val sleepWritten: Int,
    val stepsWritten: Int,
    val sleepDuplicatesSkipped: Int,
    val stepsDuplicatesReplaced: Int,
)

/**
 * Pulls Health Connect sleep + steps into durable [TelemetryStore].
 * Re-sync is idempotent via (provider, sourceRecordId) upserts.
 */
class HealthConnectDurableSync(
    private val reader: SleepStepsReader,
    private val store: TelemetryStore,
) {
    suspend fun sync(athleteId: String, nowEpochMs: Long): HealthConnectSyncReport {
        val sleep = reader.readSleep(athleteId, nowEpochMs)
        var sleepDup = 0
        val sleepToWrite = mutableListOf<SleepSession>()
        val sleepSamples = mutableListOf<TelemetrySample>()
        if (sleep.availability == MetricAvailability.AVAILABLE) {
            for (session in sleep.items) {
                if (store.sourceRecordExists(session.provenance.provider, session.provenance.sourceRecordId)) {
                    sleepDup++
                }
                sleepToWrite += session
                val minutes = session.durationMs / 60_000.0
                sleepSamples += TelemetrySample(
                    id = "${session.id}:minutes",
                    athleteId = athleteId,
                    metric = MetricType.SLEEP,
                    value = minutes,
                    unit = TelemetryUnit.MINUTES,
                    at = session.start,
                    endAt = session.end,
                    provenance = session.provenance.copy(
                        sourceRecordId = "${session.provenance.sourceRecordId}:minutes",
                        originalUnit = TelemetryUnit.MINUTES,
                        syncedAt = TelemetryInstant.utc(nowEpochMs),
                        updatedAt = TelemetryInstant.utc(nowEpochMs),
                    ),
                )
            }
        }
        val sleepWritten = if (sleepToWrite.isNotEmpty()) store.upsertSleep(sleepToWrite) else 0
        if (sleepSamples.isNotEmpty()) store.upsertSamples(sleepSamples)

        val steps = reader.readSteps(athleteId, nowEpochMs)
        var stepsReplaced = 0
        val stepSamples = mutableListOf<TelemetrySample>()
        if (steps.availability == MetricAvailability.AVAILABLE) {
            for (day in steps.items) {
                if (store.sourceRecordExists(day.sample.provenance.provider, day.sample.provenance.sourceRecordId)) {
                    stepsReplaced++
                }
                stepSamples += day.sample
            }
        }
        val stepsWritten = if (stepSamples.isNotEmpty()) store.upsertSamples(stepSamples) else 0

        return HealthConnectSyncReport(
            sleepAvailability = sleep.availability,
            stepsAvailability = steps.availability,
            sleepWritten = sleepWritten,
            stepsWritten = stepsWritten,
            sleepDuplicatesSkipped = sleepDup,
            stepsDuplicatesReplaced = stepsReplaced,
        )
    }
}
