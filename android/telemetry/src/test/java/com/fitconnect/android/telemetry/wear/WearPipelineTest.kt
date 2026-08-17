package com.fitconnect.android.telemetry.wear

import com.fitconnect.android.telemetry.healthconnect.UnavailableHealthDataRepository
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.telemetry.TelemetryEnvelopeSample
import com.fitconnect.shared.wear.WearPaths
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class WearPipelineTest {
    @Test
    fun inboxAcceptsThenDedupes() {
        val inbox = WearTelemetryInbox()
        val envelope = TelemetryEnvelope(
            sessionId = "s1",
            deviceId = "w1",
            userId = "u1",
            timestampEpochMs = 10L,
            sequenceNumber = 4L,
            source = DataSourceKind.TEST_FIXTURE,
            samples = listOf(
                TelemetryEnvelopeSample(
                    "HEART_RATE",
                    null,
                    "bpm",
                    MetricAvailability.UNAVAILABLE,
                    10L,
                ),
            ),
        )
        assertEquals(WearIngestResult.ACCEPTED, inbox.ingest(envelope.toWire()))
        assertEquals(WearIngestResult.DUPLICATE, inbox.ingest(envelope.toWire()))
        assertEquals(1, inbox.acceptedCount)
        assertEquals(1, inbox.duplicateCount)
        assertEquals(4L, inbox.lastEnvelope.value?.sequenceNumber)
    }

    @Test
    fun inboxRejectsUnknownSchema() {
        val inbox = WearTelemetryInbox()
        val envelope = TelemetryEnvelope(
            schemaVersion = "telemetry.v0",
            sessionId = "s1",
            deviceId = "w1",
            userId = "u1",
            timestampEpochMs = 10L,
            sequenceNumber = 1L,
            source = DataSourceKind.TEST_FIXTURE,
            samples = emptyList(),
        )
        assertEquals(WearIngestResult.REJECTED, inbox.ingest(envelope.toWire()))
        assertEquals(WearPaths.SCHEMA, "telemetry.v1")
    }

    @Test
    fun healthDataRepositoryDoesNotFabricateBpm() = runBlocking {
        val repo = UnavailableHealthDataRepository()
        assertEquals(MetricAvailability.UNAVAILABLE, repo.sdkAvailability())
        val hr = repo.latestHeartRate(1L)
        assertNull(hr.bpm)
        assertEquals(DataSourceKind.HEALTH_CONNECT, hr.source)
    }

    @Test
    fun xiaomiAdapterIsBlocked() = runBlocking {
        val adapter = XiaomiPlatformAdapter()
        assertEquals("XIAOMI_HYPEROS", adapter.platformId)
        assertEquals(WearablePlatformStatus.BLOCKED_EXTERNAL_DEPENDENCY, adapter.status)
        assertEquals(WearCompanionState.NOT_PAIRED, adapter.companionState())
    }

    @Test
    fun wearOsAdapterDelegatesCompanion() = runBlocking {
        val adapter = WearOsPlatformAdapter(NoWearCompanion())
        assertEquals("WEAR_OS", adapter.platformId)
        assertEquals(WearablePlatformStatus.READY, adapter.status)
        assertEquals(WearCompanionState.NOT_PAIRED, adapter.companionState())
    }
}
