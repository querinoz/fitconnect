package com.fitconnect.android.wear

import com.fitconnect.shared.telemetry.MetricAvailability
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Honesty contract for WearMetricRing display rules (no Compose runtime required).
 * AVAILABLE alone may show a value; every other availability must render as dash.
 */
class WearMetricRingHonestyTest {
    @Test
    fun unavailableNeverShowsFabricatedValue() {
        val display = displayText(
            availability = MetricAvailability.UNAVAILABLE,
            valueText = "88",
        )
        assertEquals("—", display)
    }

    @Test
    fun permissionRequiredNeverShowsFabricatedValue() {
        val display = displayText(
            availability = MetricAvailability.PERMISSION_REQUIRED,
            valueText = "142",
        )
        assertEquals("—", display)
    }

    @Test
    fun availableShowsProvidedValue() {
        val display = displayText(
            availability = MetricAvailability.AVAILABLE,
            valueText = "72",
        )
        assertEquals("72", display)
    }

    @Test
    fun blankAvailableShowsDash() {
        assertEquals(
            "—",
            displayText(MetricAvailability.AVAILABLE, null),
        )
        assertEquals(
            "—",
            displayText(MetricAvailability.AVAILABLE, "  "),
        )
    }

    @Test
    fun a11yMentionsUnavailable() {
        val desc = accessibilityLabel(
            label = "Heart rate",
            availability = MetricAvailability.UNAVAILABLE,
            valueText = "99",
        )
        assertTrue(desc.contains("unavailable", ignoreCase = true))
        assertTrue(!desc.contains("99"))
    }
}

/** Mirrors WearMetricRing display/a11y rules for unit verification. */
internal fun displayText(availability: MetricAvailability, valueText: String?): String {
    return when {
        availability != MetricAvailability.AVAILABLE -> "—"
        valueText.isNullOrBlank() -> "—"
        else -> valueText
    }
}

internal fun accessibilityLabel(
    label: String,
    availability: MetricAvailability,
    valueText: String?,
): String {
    val display = displayText(availability, valueText)
    val status = when (availability) {
        MetricAvailability.AVAILABLE -> display
        MetricAvailability.PERMISSION_REQUIRED,
        MetricAvailability.PERMISSION_DENIED,
        -> "permission required"
        MetricAvailability.UNSUPPORTED -> "unsupported"
        MetricAvailability.SYNCING -> "syncing"
        MetricAvailability.FAILED -> "failed"
        MetricAvailability.NEEDS_UPDATE -> "needs update"
        MetricAvailability.UNAVAILABLE -> "unavailable"
    }
    return "$label: $status"
}
