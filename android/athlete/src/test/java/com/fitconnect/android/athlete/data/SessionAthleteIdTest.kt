package com.fitconnect.android.athlete.data

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import com.fitconnect.android.foundation.session.SessionStore
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

/** Ensures Firebase session UID wins over LOCAL_DEMO athlete id constants. */
class SessionAthleteIdTest {
    private class FixedSessionStore(
        private val snap: SessionSnapshot,
    ) : SessionStore {
        override suspend fun snapshot(): SessionSnapshot = snap
        override suspend fun isLoggedIn(): Boolean = snap.userId != null
        override suspend fun role(): UserRole = snap.role
        override suspend fun accessToken(): String? = snap.tokens?.accessToken
        override suspend fun refreshToken(): String? = snap.tokens?.refreshToken
        override suspend fun save(snapshot: SessionSnapshot): AppResult<Unit> = AppResult.Ok(Unit)
        override suspend fun updateTokens(tokens: AuthTokens): AppResult<Unit> = AppResult.Ok(Unit)
        override suspend fun clear(): AppResult<Unit> = AppResult.Ok(Unit)
    }

    @Test
    fun firebaseUidPreferredOverDemoConstant() = runBlocking {
        val store = FixedSessionStore(
            SessionSnapshot(
                userId = "firebase-uid-abc",
                role = UserRole.ATHLETE,
                tokens = AuthTokens("access", null),
                isAnonymous = false,
                biometricUnlockEnabled = false,
                isLocalDemo = false,
            ),
        )
        assertEquals("firebase-uid-abc", store.canonicalAthleteId())
    }

    @Test
    fun localDemoFallsBackToDemoAthleteId() = runBlocking {
        val store = FixedSessionStore(
            SessionSnapshot(
                userId = null,
                role = UserRole.ATHLETE,
                tokens = null,
                isAnonymous = false,
                biometricUnlockEnabled = false,
                isLocalDemo = true,
            ),
        )
        assertEquals(LocalAthleteRepository.ATHLETE_ID, store.canonicalAthleteId())
    }
}
