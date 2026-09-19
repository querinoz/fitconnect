package com.fitconnect.android.sports.intelligence

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Reproduces V12 product gap: adaptation must be explainable + confirm-only.
 */
class AdaptiveTrainingTest {

    @Test
    fun spikeLoadRequiresConfirmReduceVolume() {
        val rec = AdaptiveTraining.recommendSessionAdaptation(
            trainingLoad = TrainingLoadView(TrainingLoadLabel.SPIKE, acwr = 1.6),
            readinessScore = 70,
            readinessState = AdaptationConfidence.HIGH,
            availableMin = null,
            plannedDurationMin = 60,
        )
        assertEquals(AdaptationAction.REDUCE_VOLUME, rec.action)
        assertTrue(rec.requiresConfirm)
        assertFalse(rec.autoApplied)
        assertTrue(rec.what.isNotBlank())
        assertTrue(rec.why.contains("SPIKE"))
        assertTrue(rec.data.any { it.startsWith("load=") })
    }

    @Test
    fun lowReadinessSwapsToRecoveryConfirmOnly() {
        val rec = AdaptiveTraining.recommendSessionAdaptation(
            trainingLoad = TrainingLoadView(TrainingLoadLabel.MODERATE),
            readinessScore = 30,
            readinessState = AdaptationConfidence.MEDIUM,
            availableMin = null,
            plannedDurationMin = 45,
        )
        assertEquals(AdaptationAction.SWAP_TO_RECOVERY, rec.action)
        assertTrue(rec.requiresConfirm)
        assertFalse(rec.autoApplied)
    }

    @Test
    fun shortAvailableTimeReducesVolume() {
        val rec = AdaptiveTraining.recommendSessionAdaptation(
            trainingLoad = TrainingLoadView(TrainingLoadLabel.MODERATE),
            readinessScore = 80,
            readinessState = AdaptationConfidence.HIGH,
            availableMin = 20,
            plannedDurationMin = 60,
        )
        assertEquals(AdaptationAction.REDUCE_VOLUME, rec.action)
        assertEquals(AdaptationConfidence.HIGH, rec.confidence)
        assertTrue(rec.data.any { it.startsWith("availableMin=") })
    }

    @Test
    fun keepWhenNoTriggers() {
        val rec = AdaptiveTraining.recommendSessionAdaptation(
            trainingLoad = TrainingLoadView(TrainingLoadLabel.MODERATE),
            readinessScore = 72,
            readinessState = AdaptationConfidence.HIGH,
            availableMin = 50,
            plannedDurationMin = 45,
        )
        assertEquals(AdaptationAction.KEEP, rec.action)
        assertTrue(rec.requiresConfirm)
        assertFalse(rec.autoApplied)
    }

    @Test
    fun sportWireIdsRoundTrip() {
        val local = SportWireIds.fromWire("STRENGTH")
        assertEquals("strength", local.value)
        assertEquals("STRENGTH", SportWireIds.toWire(local))
    }
}
