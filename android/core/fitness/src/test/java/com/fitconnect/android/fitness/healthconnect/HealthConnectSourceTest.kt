package com.fitconnect.android.fitness.healthconnect

import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.domain.HealthFeature
import com.fitconnect.android.fitness.domain.HealthConnectPermissionPolicy
import com.fitconnect.android.fitness.mapping.ExerciseSessionDto
import com.fitconnect.android.fitness.store.InMemoryWorkoutSessionStore
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HealthConnectSdkMapperTest {
    @Test
    fun threeAvailabilityStates() {
        assertEquals(
            HealthConnectSdkState.AVAILABLE,
            HealthConnectSdkMapper.fromSdkStatus(HealthConnectSdkMapper.SDK_AVAILABLE),
        )
        assertEquals(
            HealthConnectSdkState.NEEDS_UPDATE,
            HealthConnectSdkMapper.fromSdkStatus(
                HealthConnectSdkMapper.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED,
            ),
        )
        assertEquals(
            HealthConnectSdkState.UNAVAILABLE,
            HealthConnectSdkMapper.fromSdkStatus(HealthConnectSdkMapper.SDK_UNAVAILABLE),
        )
        assertEquals(
            HealthConnectSdkState.UNAVAILABLE,
            HealthConnectSdkMapper.fromSdkStatus(0),
        )
    }
}

class HealthConnectPermissionPolicyTest {
    @Test
    fun onboardingIsIncrementalNotElevenPermissions() {
        val onboarding = HealthConnectPermissionPolicy.forFeature(HealthFeature.ONBOARDING)
        assertEquals(
            setOf("ExerciseSession", "Steps", "HeartRate", "Distance"),
            onboarding,
        )
        assertTrue(HealthConnectPermissionPolicy.forFeature(HealthFeature.SLEEP).contains("SleepSession"))
        assertFalse(onboarding.contains("SleepSession"))
    }
}

class HealthConnectChangeSyncTest {
    @Test
    fun persistedTokenAvoidsFullReread() = runBlocking {
        val tokens = InMemoryChangeTokenStore()
        val store = InMemoryWorkoutSessionStore()
        var seen: String? = "unset"
        val source = HealthConnectSource(
            store = store,
            tokens = tokens,
            reader = { cursor ->
                seen = cursor
                emptyList<ExerciseSessionDto>() to "token-2"
            },
            sdkState = { HealthConnectSdkState.AVAILABLE },
        )
        tokens.set("token-1")
        val page = source.syncSince(null)
        assertEquals("token-1", seen)
        assertFalse(page.fullReread)
        assertEquals("token-2", tokens.get())
    }

    @Test
    fun firstSyncWithoutTokenIsInitialRead() = runBlocking {
        var seen: String? = "unset"
        val source = HealthConnectSource(
            store = InMemoryWorkoutSessionStore(),
            tokens = InMemoryChangeTokenStore(),
            reader = { cursor ->
                seen = cursor
                emptyList<ExerciseSessionDto>() to "token-1"
            },
            sdkState = { HealthConnectSdkState.AVAILABLE },
        )
        val page = source.syncSince(null)
        assertEquals(null, seen)
        assertTrue(page.fullReread)
    }
}
