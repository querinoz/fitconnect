package com.fitconnect.android.fitness.healthconnect

import androidx.health.connect.client.records.ExerciseSessionRecord
import com.fitconnect.android.fitness.domain.HealthFeature
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class HealthConnectPermissionMapperTest {
    @Test
    fun onboardingMapsToFourReadPermissions() {
        val perms = HealthConnectPermissionMapper.onboardingPermissions()
        assertEquals(4, perms.size)
        assertTrue(perms.all { it.startsWith("android.permission.health.") })
    }

    @Test
    fun sleepIsSeparateFromOnboarding() {
        val sleep = HealthConnectPermissionMapper.permissionsForFeature(HealthFeature.SLEEP)
        val onboarding = HealthConnectPermissionMapper.onboardingPermissions()
        assertTrue(sleep.none { it in onboarding })
    }
}

class HealthConnectExerciseTypeNamesTest {
    @Test
    fun runningMapsToCatalogKey() {
        assertEquals(
            "running",
            HealthConnectExerciseTypeNames.nameFor(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING),
        )
    }

    @Test
    fun unknownMapsToOtherWorkout() {
        assertEquals("other_workout", HealthConnectExerciseTypeNames.nameFor(-1))
    }
}
