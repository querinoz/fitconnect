package com.fitconnect.android.telemetry.healthconnect

import com.fitconnect.android.telemetry.domain.DataQuality
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.Provenance
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.SleepSession
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.store.InMemoryTelemetryStore
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange
import com.fitconnect.android.telemetry.units.TelemetryUnit
import com.fitconnect.shared.telemetry.MetricAvailability
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** P2CORE-005…008 — sleep/steps durable sync + dedupe. */
class HealthConnectDurableSyncTest {

    private val now = 1_700_000_000_000L

    @Test
    fun p2core005_stepsWrittenOnceOnRepeatSync() = runTest {
        val store = InMemoryTelemetryStore()
        val reader = FakeSleepStepsReader(
            steps = listOf(stepSummary("u1", 10_000)),
        )
        val sync = HealthConnectDurableSync(reader, store)

        val first = sync.sync("u1", now)
        val second = sync.sync("u1", now)

        assertEquals(MetricAvailability.AVAILABLE, first.stepsAvailability)
        assertEquals(1, first.stepsWritten)
        assertEquals(0, second.stepsWritten)
        assertEquals(1, second.stepsDuplicatesReplaced)
        val page = store.samples(
            "u1",
            MetricType.STEPS,
            TimeRange(TelemetryInstant.utc(0), TelemetryInstant.utc(now + 1)),
        )
        assertEquals(1, page.items.size)
        assertEquals(10_000.0, page.items.single().value, 0.01)
    }

    @Test
    fun p2core006_sleepSessionsDedupeBySourceRecordId() = runTest {
        val store = InMemoryTelemetryStore()
        val session = sleepSession("u1", "sleep-1")
        val reader = FakeSleepStepsReader(sleep = listOf(session))
        val sync = HealthConnectDurableSync(reader, store)

        val first = sync.sync("u1", now)
        val second = sync.sync("u1", now)

        assertEquals(1, first.sleepWritten)
        assertEquals(0, second.sleepWritten)
        assertEquals(1, second.sleepDuplicatesSkipped)
        assertTrue(store.sourceRecordExists(ProviderId.HEALTH_CONNECT, "sleep-1"))
    }

    @Test
    fun p2core007_permissionDeniedDoesNotFabricateData() = runTest {
        val store = InMemoryTelemetryStore()
        val reader = FakeSleepStepsReader(
            sleepAvailability = MetricAvailability.PERMISSION_DENIED,
            stepsAvailability = MetricAvailability.PERMISSION_DENIED,
        )
        val report = HealthConnectDurableSync(reader, store).sync("u1", now)
        assertEquals(MetricAvailability.PERMISSION_DENIED, report.sleepAvailability)
        assertEquals(MetricAvailability.PERMISSION_DENIED, report.stepsAvailability)
        assertEquals(0, report.sleepWritten)
        assertEquals(0, report.stepsWritten)
        assertEquals(0, store.countSamples("u1"))
    }

    @Test
    fun p2core008_sleepMinutesSampleUsesCanonicalMinutesUnit() = runTest {
        val store = InMemoryTelemetryStore()
        val session = sleepSession("u1", "sleep-2", durationMs = 7 * 60 * 60 * 1000L)
        val sync = HealthConnectDurableSync(FakeSleepStepsReader(sleep = listOf(session)), store)
        sync.sync("u1", now)
        val sleep = store.latestSample("u1", MetricType.SLEEP)!!
        assertEquals(TelemetryUnit.MINUTES, sleep.unit)
        assertEquals(420.0, sleep.value, 0.01)
    }

    private fun stepSummary(athleteId: String, steps: Long): StepDaySummary {
        val day = Math.floorDiv(now, 86_400_000L)
        val dayStart = day * 86_400_000L
        val sourceId = "steps:$athleteId:$day"
        val sample = TelemetrySample(
            id = "hc:$sourceId",
            athleteId = athleteId,
            metric = MetricType.STEPS,
            value = steps.toDouble(),
            unit = TelemetryUnit.STEPS,
            at = TelemetryInstant.utc(dayStart),
            endAt = TelemetryInstant.utc(dayStart + 86_400_000L - 1),
            provenance = Provenance(
                provider = ProviderId.HEALTH_CONNECT,
                device = null,
                deviceId = "test",
                sourceRecordId = sourceId,
                originalUnit = TelemetryUnit.STEPS,
                syncedAt = TelemetryInstant.utc(now),
                createdAt = TelemetryInstant.utc(now),
                updatedAt = TelemetryInstant.utc(now),
                quality = DataQuality.VALID,
            ),
        )
        return StepDaySummary(athleteId, dayStart, dayStart + 86_400_000L - 1, steps, sample)
    }

    private fun sleepSession(athleteId: String, sourceId: String, durationMs: Long = 8 * 3_600_000L) =
        SleepSession(
            id = "hc:$sourceId",
            athleteId = athleteId,
            start = TelemetryInstant.utc(now - durationMs),
            end = TelemetryInstant.utc(now),
            stages = emptyList(),
            efficiencyPct = null,
            provenance = Provenance(
                provider = ProviderId.HEALTH_CONNECT,
                device = null,
                deviceId = "test",
                sourceRecordId = sourceId,
                originalUnit = TelemetryUnit.MILLISECONDS,
                syncedAt = TelemetryInstant.utc(now),
                createdAt = TelemetryInstant.utc(now),
                updatedAt = TelemetryInstant.utc(now),
                quality = DataQuality.VALID,
            ),
        )
}

private class FakeSleepStepsReader(
    private val sleep: List<SleepSession> = emptyList(),
    private val steps: List<StepDaySummary> = emptyList(),
    private val sleepAvailability: MetricAvailability = MetricAvailability.AVAILABLE,
    private val stepsAvailability: MetricAvailability = MetricAvailability.AVAILABLE,
) : SleepStepsReader {
    override suspend fun readSleep(
        athleteId: String,
        nowEpochMs: Long,
        lookbackDays: Long,
    ) = HealthConnectReadResult(sleepAvailability, sleep)

    override suspend fun readSteps(
        athleteId: String,
        nowEpochMs: Long,
        lookbackDays: Long,
    ) = HealthConnectReadResult(stepsAvailability, steps)
}
