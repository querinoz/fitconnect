package com.fitconnect.android.fitness.healthconnect

import com.fitconnect.android.fitness.domain.Sport
import androidx.health.connect.client.records.ExerciseSessionRecord
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlinx.coroutines.runBlocking
import com.fitconnect.android.fitness.domain.WorkoutSession
import com.fitconnect.shared.fitness.ProviderId

class HealthConnectWriteMapperTest {
    @Test
    fun clientRecordIdIsNamespaced() {
        assertEquals("fitconnect:sess-1", HealthConnectWriteMapper.clientRecordId("sess-1"))
        assertTrue(HealthConnectWriteMapper.isFitConnectOrigin("fitconnect:sess-1"))
        assertFalse(HealthConnectWriteMapper.isFitConnectOrigin("other-id"))
        assertFalse(HealthConnectWriteMapper.isFitConnectOrigin(null))
    }

    @Test
    fun strengthMapsToHcStrengthTraining() {
        assertEquals(
            ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING,
            HealthConnectWriteMapper.exerciseTypeFor(Sport.STRENGTH),
        )
    }

    @Test
    fun writePermissionIsSeparateFromOnboardingReads() {
        val write = HealthConnectPermissionMapper.writePermissionsForExerciseSession()
        val onboarding = HealthConnectPermissionMapper.onboardingPermissions()
        assertEquals(1, write.size)
        assertTrue(write.none { it in onboarding })
        assertTrue(write.first().contains("WRITE", ignoreCase = true) || write.first().contains("write", ignoreCase = true))
    }

    @Test
    fun recordingWriterRespectsOptInGate() = runBlocking {
        val writer = RecordingExerciseSessionWriter()
        val session = WorkoutSession(
            id = "w1",
            userId = "u1",
            providerId = ProviderId.HEALTH_CONNECT,
            externalId = "ext",
            sport = Sport.STRENGTH,
            startedAtEpochMs = 1_000L,
            endedAtEpochMs = 2_000L,
        )
        val denied = writer.writeCompleted(session, userOptIn = false)
        assertEquals(HealthConnectWriteOutcome.NOT_OPTED_IN, denied.outcome)
        assertEquals(1, writer.attempts.size)
        assertFalse(writer.attempts.first().userOptIn)

        writer.nextResult = HealthConnectWriteResult(HealthConnectWriteOutcome.SUCCESS, "fitconnect:w1")
        val ok = writer.writeCompleted(session, userOptIn = true)
        assertEquals(HealthConnectWriteOutcome.SUCCESS, ok.outcome)
    }
}
