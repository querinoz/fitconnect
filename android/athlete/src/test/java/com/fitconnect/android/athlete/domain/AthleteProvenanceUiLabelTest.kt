package com.fitconnect.android.athlete.domain

import com.fitconnect.android.telemetry.domain.TelemetryUiLabel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class AthleteProvenanceUiLabelTest {

    @Test
    fun localDemoMapsToTestNeverLive() {
        assertEquals(TelemetryUiLabel.TEST, AthleteDataProvenance.LOCAL_DEMO.toTelemetryUiLabel())
        assertNotEquals(TelemetryUiLabel.LIVE, AthleteDataProvenance.LOCAL_DEMO.toTelemetryUiLabel())
        val field = Provenanced(42, AthleteDataProvenance.LOCAL_DEMO)
        assertEquals(TelemetryUiLabel.TEST, field.uiLabel)
        assertEquals(true, field.isDemo)
    }

    @Test
    fun measuredCalculatedInsufficientMapHonestly() {
        assertEquals(TelemetryUiLabel.SYNCED, AthleteDataProvenance.MEASURED.toTelemetryUiLabel())
        assertEquals(TelemetryUiLabel.DERIVED, AthleteDataProvenance.CALCULATED.toTelemetryUiLabel())
        assertEquals(
            TelemetryUiLabel.UNAVAILABLE,
            AthleteDataProvenance.INSUFFICIENT_DATA.toTelemetryUiLabel(),
        )
    }
}
