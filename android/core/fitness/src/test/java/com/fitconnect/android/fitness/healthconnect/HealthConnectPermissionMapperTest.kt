package com.fitconnect.android.fitness.healthconnect

import androidx.health.connect.client.records.ExerciseSessionRecord
import com.fitconnect.android.fitness.domain.HealthFeature
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class HealthConnectPermissionMapperTest {
    @Test
    fun onboardingMapsToRecordReadsPlusHistoryAndBackground() {
        val records = HealthConnectPermissionMapper.recordPermissionsForFeature(HealthFeature.ONBOARDING)
        val perms = HealthConnectPermissionMapper.onboardingPermissions()
        assertEquals(4, records.size)
        assertTrue(records.all { it.startsWith("android.permission.health.") })
        assertTrue(perms.containsAll(records))
        assertTrue(perms.any { it.endsWith("READ_HEALTH_DATA_HISTORY") })
        assertTrue(perms.any { it.endsWith("READ_HEALTH_DATA_IN_BACKGROUND") })
    }

    @Test
    fun sleepIsSeparateFromOnboardingRecords() {
        val sleep = HealthConnectPermissionMapper.permissionsForFeature(HealthFeature.SLEEP)
        val onboarding = HealthConnectPermissionMapper.recordPermissionsForFeature(HealthFeature.ONBOARDING)
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
