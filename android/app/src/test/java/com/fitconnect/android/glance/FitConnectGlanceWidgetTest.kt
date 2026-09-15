package com.fitconnect.android.glance

import com.fitconnect.shared.glance.GlanceSnapshot
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class FitConnectGlanceWidgetTest {
    @Test
    fun recoveryNeverInvented() {
        val copy = FitConnectGlanceWidget.copyFor(GlanceWidgetKind.RECOVERY, GlanceSnapshot.IDLE)
        assertEquals("RECOVERY", copy.kicker)
        assertEquals("DATA UNAVAILABLE", copy.title)
        assertEquals("fitconnect://app/recovery", copy.link)
    }

    @Test
    fun coachHasNoHealthFields() {
        val copy = FitConnectGlanceWidget.copyFor(GlanceWidgetKind.COACH, GlanceSnapshot.IDLE)
        assertFalse(copy.subtitle.contains("HR", ignoreCase = true))
        assertEquals("fitconnect://app/coach", copy.link)
    }

    @Test
    fun trainDeepLinksToTrain() {
        val copy = FitConnectGlanceWidget.copyFor(
            GlanceWidgetKind.TRAIN,
            GlanceSnapshot(title = "Upper push", sport = "strength", durationMin = 32),
        )
        assertEquals("Upper push", copy.title)
        assertEquals("fitconnect://app/train", copy.link)
    }
}
