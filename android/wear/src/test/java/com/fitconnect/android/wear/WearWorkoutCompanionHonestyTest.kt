package com.fitconnect.android.wear

import com.fitconnect.shared.telemetry.MetricAvailability
import org.junit.Assert.assertEquals
import org.junit.Test

class WearWorkoutCompanionHonestyTest {
    @Test
    fun metricDisplayIsDashUnlessAvailable() {
        assertEquals("—", WearCompanionHonesty.metricDisplay("142", MetricAvailability.UNAVAILABLE))
        assertEquals("—", WearCompanionHonesty.metricDisplay(null, MetricAvailability.AVAILABLE))
        assertEquals("142", WearCompanionHonesty.metricDisplay("142", MetricAvailability.AVAILABLE))
    }

    @Test
    fun deviceStatusLabelsAreHonest() {
        assertEquals("NOT CONNECTED", WearCompanionHonesty.deviceLabel(WearCompanionDeviceStatus.NOT_CONNECTED))
        assertEquals("PHONE LINKED", WearCompanionHonesty.deviceLabel(WearCompanionDeviceStatus.CONNECTED))
        assertEquals("SYNCING", WearCompanionHonesty.deviceLabel(WearCompanionDeviceStatus.SYNCING))
        assertEquals("UNAVAILABLE", WearCompanionHonesty.deviceLabel(WearCompanionDeviceStatus.UNAVAILABLE))
        assertEquals("LINK ERROR", WearCompanionHonesty.deviceLabel(WearCompanionDeviceStatus.ERROR))
    }
}
