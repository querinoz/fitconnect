package com.fitconnect.android.sports.progression

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ProgressionEngineTest {

    private fun working(
        reps: Int,
        target: Int,
        weight: Double = 60.0,
        failed: Boolean = false,
    ) = PreviousSetPerformance(
        setType = SetType.WORKING,
        actualReps = reps,
        actualWeightKg = weight,
        actualTimeSec = null,
        targetReps = target,
        targetWeightKg = weight,
        isFailed = failed,
    )

    @Test
    fun failedRepsDoNotAdvanceLinearLoad() {
        val input = ProgressionInput(
            rule = ProgressionRule.LINEAR,
            exerciseMode = ExerciseMode.REPS,
            sideMode = SideMode.NONE,
            previousSets = listOf(working(6, 8, failed = true)),
        )
        val target = ProgressionEngine.compute(input)
        assertEquals(60.0, target.targetWeightKg!!, 0.01)
        assertEquals(ProgressionState.HOLD, target.progressionState)
    }

    @Test
    fun stallTriggersDeload() {
        val input = ProgressionInput(
            rule = ProgressionRule.LINEAR,
            exerciseMode = ExerciseMode.REPS,
            sideMode = SideMode.NONE,
            previousSets = listOf(working(8, 8)),
            stallCount = 3,
        )
        val target = ProgressionEngine.compute(input)
        assertEquals(ProgressionState.DELOAD, target.progressionState)
        assertEquals(54.0, target.targetWeightKg!!, 0.01)
    }

    @Test
    fun bodyweightUsesRepProgression() {
        val input = ProgressionInput(
            rule = ProgressionRule.DOUBLE_PROGRESSION,
            exerciseMode = ExerciseMode.BODYWEIGHT,
            sideMode = SideMode.NONE,
            previousSets = listOf(working(10, 10, weight = 0.0)),
            repMin = 8,
            repMax = 12,
        )
        val target = ProgressionEngine.compute(input)
        assertNull(target.targetWeightKg)
        assertEquals(11, target.targetRepsMin)
    }

    @Test
    fun perSideRepsStayEven() {
        val input = ProgressionInput(
            rule = ProgressionRule.DOUBLE_PROGRESSION,
            exerciseMode = ExerciseMode.BODYWEIGHT,
            sideMode = SideMode.PER_SIDE,
            previousSets = listOf(working(8, 8, weight = 0.0)),
        )
        val target = ProgressionEngine.compute(input)
        assertEquals(0, target.targetRepsMin % 2)
    }
}

class OneRepMaxEstimatorTest {
    @Test
    fun estimateIncludesDisclaimer() {
        val est = OneRepMaxEstimator.estimate(100.0, 5)
        assertEquals(100.0, est.sourceWeightKg, 0.01)
        assertEquals(5, est.sourceReps)
        assert(est.disclaimer.contains("Estimated"))
        assert(est.estimatedKg > 100.0)
    }
}
