package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.offline.InMemorySyncQueue
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.foundation.security.AccountIsolationController
import com.fitconnect.android.foundation.session.SecureSessionStore
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.support.InMemorySecureStore
import androidx.datastore.preferences.core.Preferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LocalAuthRepositoryTest {
    private val logger: Logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    private class MemKv : KeyValueStore {
        private val map = mutableMapOf<Preferences.Key<String>, String>()
        override fun observe(key: Preferences.Key<String>): Flow<String?> =
            MutableStateFlow(map[key])
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
    fun emailSignInPersistsSessionAndRefreshRotates() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)

        val user = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        assertTrue(user is AppResult.Ok)
        assertEquals(UserRole.ATHLETE, (user as AppResult.Ok).value.role)
        assertTrue(session.isLoggedIn())

        val before = session.accessToken()
        val refreshed = auth.refresh()
        assertTrue(refreshed is AppResult.Ok)
        assertTrue(session.accessToken() != before)
    }

    @Test
    fun guestAndAnonymousModes() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)

        auth.continueAsGuest()
        assertEquals(UserRole.GUEST, session.role())

        val anon = auth.signInAnonymously()
        assertTrue(anon is AppResult.Ok)
        assertEquals(UserRole.ANONYMOUS, session.role())
        assertTrue(session.isLoggedIn())
    }

    @Test
    fun adminCannotBeGrantedFromEmail() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger, allowLocalCoachElevation = true)
        val user = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "admin@fitconnect.app", password = "password1"),
        ) as AppResult.Ok
        assertEquals(UserRole.ATHLETE, user.value.role)
    }

    @Test
    fun coachElevationDisabledInReleaseMode() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger, allowLocalCoachElevation = false)
        val user = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "coach@fitconnect.app", password = "password1"),
        ) as AppResult.Ok
        assertEquals(UserRole.ATHLETE, user.value.role)
    }

    @Test
    fun coachElevationAllowedOnlyWhenDebugFlagSet() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger, allowLocalCoachElevation = true)
        val user = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "coach@fitconnect.app", password = "password1"),
        ) as AppResult.Ok
        assertEquals(UserRole.COACH, user.value.role)
    }

    @Test
    fun logoutClearsSession() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)
        auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        assertTrue(session.isLoggedIn())
        auth.logout()
        assertFalse(session.isLoggedIn())
    }

    @Test
    fun restoreSessionAfterSignIn() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)
        val signedIn = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        ) as AppResult.Ok
        val restored = auth.restoreSession()
        assertTrue(restored is AppResult.Ok)
        assertEquals(signedIn.value.id, (restored as AppResult.Ok).value.userId)
        assertEquals(signedIn.value.role, restored.value.role)
    }

    @Test
    fun allowLocalAuthFalseRejectsEmailPassword() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger, allowLocalAuth = false)
        val user = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        assertTrue(user is AppResult.Err)
        assertFalse(session.isLoggedIn())
    }

    @Test
    fun coachElevationEmailWorksWhenAllowLocalCoachElevation() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger, allowLocalCoachElevation = true)
        val user = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "coach@fitconnect.app", password = "password1"),
        ) as AppResult.Ok
        assertEquals(UserRole.COACH, user.value.role)
    }

    @Test
    fun logoutClearsOfflineQueue() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val queue = InMemorySyncQueue()
        queue.enqueue(
            SyncWork(
                id = "m1",
                type = "athlete.task.toggle",
                payloadJson = "{}",
                createdAtEpochMs = 1L,
            ),
        )
        assertEquals(1, queue.size())
        val isolation = AccountIsolationController(session, queue, MemKv(), logger)
        val auth = LocalAuthRepository(session, logger, isolation = isolation)
        auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        auth.logout()
        assertEquals(0, queue.size())
        assertFalse(session.isLoggedIn())
    }

    @Test
    fun releaseBuildRefusesLocalCredentialAuth() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger, allowLocalAuth = false)
        val user = auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        assertTrue(user is AppResult.Err)
        assertFalse(session.isLoggedIn())
    }

    @Test
    fun googleAndAppleAreNotFakedLocally() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)
        val google = auth.signIn(AuthProviderKind.GOOGLE, AuthCredentials(idToken = "token"))
        assertTrue(google is AppResult.Err)
        assertEquals(
            com.fitconnect.android.foundation.common.AppError.AuthKind.PROVIDER_UNAVAILABLE,
            ((google as AppResult.Err).error as com.fitconnect.android.foundation.common.AppError.Auth).kind,
        )
        assertFalse(session.isLoggedIn())
    }

    @Test
    fun localDemoRefusesAccountDeletion() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)
        auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        val deleted = auth.deleteAccount()
        assertEquals(
            com.fitconnect.android.foundation.common.AppError.AuthKind.FORBIDDEN,
            ((deleted as AppResult.Err).error as com.fitconnect.android.foundation.common.AppError.Auth).kind,
        )
        assertTrue(session.isLoggedIn())
    }
}
