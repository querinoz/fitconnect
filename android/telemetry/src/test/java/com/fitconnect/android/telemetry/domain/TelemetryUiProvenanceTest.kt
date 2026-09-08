package com.fitconnect.android.telemetry.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class TelemetryUiProvenanceTest {

    @Test
    fun localDemoNeverResolvesToLive() {
        val label = TelemetryUiProvenance.resolve(
            isLocalDemo = true,
            hasSamples = true,
            liveStreamConnected = true,
            sampleAgeMs = 1_000L,
        )
        assertEquals(TelemetryUiLabel.TEST, label)
        assertNotEquals(TelemetryUiLabel.LIVE, label)
    }

    @Test
    fun liveStreamWithinWindowIsLive() {
        val label = TelemetryUiProvenance.resolve(
            hasSamples = true,
            liveStreamConnected = true,
            sampleAgeMs = TelemetryUiProvenance.LIVE_WINDOW_MS / 2,
        )
        assertEquals(TelemetryUiLabel.LIVE, label)
    }

    @Test
    fun recentSamplesWithoutStreamAreSynced() {
        val label = TelemetryUiProvenance.resolve(
            hasSamples = true,
            liveStreamConnected = false,
            sampleAgeMs = TelemetryUiProvenance.LIVE_WINDOW_MS + 1,
        )
        assertEquals(TelemetryUiLabel.SYNCED, label)
    }

    @Test
    fun oldSamplesAreStale() {
        val label = TelemetryUiProvenance.resolve(
            hasSamples = true,
            sampleAgeMs = TelemetryUiProvenance.STALE_AFTER_MS + 1,
        )
        assertEquals(TelemetryUiLabel.STALE, label)
    }

    @Test
    fun offlineWithoutSamplesIsOffline() {
        assertEquals(
            TelemetryUiLabel.OFFLINE,
            TelemetryUiProvenance.resolve(isOffline = true, hasSamples = false),
        )
    }

    @Test
    fun missingSamplesAreUnavailable() {
        assertEquals(
            TelemetryUiLabel.UNAVAILABLE,
            TelemetryUiProvenance.resolve(hasSamples = false),
        )
    }

    @Test
    fun derivedOverridesFreshness() {
        assertEquals(
            TelemetryUiLabel.DERIVED,
            TelemetryUiProvenance.resolve(
                hasSamples = true,
                sampleAgeMs = 1_000L,
                isDerived = true,
            ),
        )
    }

    @Test
    fun enumCoversRequiredUiLabels() {
        val required = setOf("LIVE", "SYNCED", "DERIVED", "STALE", "OFFLINE", "UNAVAILABLE", "TEST")
        assertEquals(required, TelemetryUiLabel.entries.map { it.name }.toSet())
    }
}
