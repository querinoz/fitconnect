package com.fitconnect.android.athlete.ui.home

import com.fitconnect.android.telemetry.domain.TelemetryUiLabel
import org.junit.Assert.assertEquals
import org.junit.Test

class TodayMetricStripProvenanceTest {

    @Test
    fun dominantLabelNeverPromotesDemoToLive() {
        assertEquals(
            TelemetryUiLabel.TEST.name,
            dominantTelemetryLabel(TelemetryUiLabel.LIVE, TelemetryUiLabel.TEST),
        )
    }

    @Test
    fun dominantLabelPrefersUnavailableOverSynced() {
        assertEquals(
            TelemetryUiLabel.UNAVAILABLE.name,
            dominantTelemetryLabel(TelemetryUiLabel.SYNCED, TelemetryUiLabel.UNAVAILABLE),
        )
    }

    @Test
    fun dominantLabelFallsBackToSynced() {
        assertEquals(
            TelemetryUiLabel.SYNCED.name,
            dominantTelemetryLabel(TelemetryUiLabel.SYNCED, TelemetryUiLabel.SYNCED),
        )
    }
}
