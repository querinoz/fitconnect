package com.fitconnect.android.foundation.session

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.support.InMemorySecureStore
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SecureSessionStoreActiveModeTest {
    @Test
    fun dualCapabilitiesSwitchWithoutClearingSession() = runBlocking {
        val store = SecureSessionStore(InMemorySecureStore())
        store.save(
            SessionSnapshot(
                userId = "u1",
                role = UserRole.ATHLETE,
                tokens = AuthTokens("a", "r"),
                isAnonymous = false,
                biometricUnlockEnabled = false,
                isLocalDemo = true,
                capabilities = setOf(UserRole.ATHLETE, UserRole.COACH),
                activeMode = UserRole.ATHLETE,
            ),
        )
        val switched = store.setActiveMode(UserRole.COACH) as AppResult.Ok
        assertEquals(UserRole.COACH, switched.value.activeMode)
        assertEquals(UserRole.COACH, switched.value.role)
        assertTrue(switched.value.capabilities.contains(UserRole.ATHLETE))
        assertTrue(store.isLoggedIn())
    }

    @Test
    fun deniesModeWithoutCapability() = runBlocking {
        val store = SecureSessionStore(InMemorySecureStore())
        store.save(
            SessionSnapshot(
                userId = "u1",
                role = UserRole.ATHLETE,
                tokens = AuthTokens("a", "r"),
                isAnonymous = false,
                biometricUnlockEnabled = false,
                capabilities = setOf(UserRole.ATHLETE),
                activeMode = UserRole.ATHLETE,
            ),
        )
        assertTrue(store.setActiveMode(UserRole.COACH) is AppResult.Err)
    }
}
