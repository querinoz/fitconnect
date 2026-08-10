package com.fitconnect.android.foundation.storage

import androidx.datastore.preferences.core.Preferences
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class OnboardingPrefsTest {
    private val store = object : KeyValueStore {
        private val map = mutableMapOf<Preferences.Key<String>, String>()
        override fun observe(key: Preferences.Key<String>): Flow<String?> = flowOf(map[key])
        override suspend fun get(key: Preferences.Key<String>): String? = map[key]
        override suspend fun set(key: Preferences.Key<String>, value: String): AppResult<Unit> {
            map[key] = value
            return AppResult.Ok(Unit)
        }
        override suspend fun remove(key: Preferences.Key<String>): AppResult<Unit> {
            map.remove(key)
            return AppResult.Ok(Unit)
        }
    }

    @Test
    fun athleteStepClampAndDone() = runBlocking {
        assertFalse(store.isOnboardingDone())
        assertEquals(0, store.athleteOnboardingStep())
        store.setAthleteOnboardingStep(9)
        assertEquals(5, store.athleteOnboardingStep())
        store.setAthleteOnboardingSport("Cycling")
        store.setAthleteOnboardingGoal("Race prep")
        assertEquals("Cycling", store.athleteOnboardingSport())
        assertEquals("Race prep", store.athleteOnboardingGoal())
        store.markOnboardingDone()
        assertTrue(store.isOnboardingDone())
    }

    @Test
    fun coachOnboardingDone() = runBlocking {
        assertFalse(store.isCoachOnboardingDone())
        store.setCoachOnboardingStep(-1)
        assertEquals(0, store.coachOnboardingStep())
        store.markCoachOnboardingDone()
        assertTrue(store.isCoachOnboardingDone())
    }
}
