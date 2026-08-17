package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.session.SecureSessionStore
import com.fitconnect.android.foundation.support.InMemorySecureStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CompositeAuthRepositoryTest {
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    @Test
    fun demoPersonaNeverHitsLiveAdapter() = runBlocking {
        val localSession = SecureSessionStore(InMemorySecureStore())
        val liveSession = SecureSessionStore(InMemorySecureStore())
        val local = LocalAuthRepository(localSession, logger, allowLocalAuth = true)
        val live = LocalAuthRepository(liveSession, logger, allowLocalAuth = true)
        val composite = CompositeAuthRepository(local, live, allowLocalAuth = true, logger = logger)

        val result = composite.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = DemoPersona.INES.email, password = DemoPersona.DEMO_PASSWORD),
        ) as AppResult.Ok
        assertTrue(result.value.isLocalDemo)
        assertTrue(localSession.isLoggedIn())
        assertTrue(!liveSession.isLoggedIn())
    }

    @Test
    fun googleNeverUsesLocalFakeOauth() = runBlocking {
        val local = LocalAuthRepository(SecureSessionStore(InMemorySecureStore()), logger)
        val composite = CompositeAuthRepository(local, live = null, allowLocalAuth = true)
        val result = composite.signIn(AuthProviderKind.GOOGLE, AuthCredentials(idToken = "anything"))
        assertTrue(result is AppResult.Err)
        assertEquals(
            AppError.AuthKind.PROVIDER_UNAVAILABLE,
            (result as AppResult.Err).error.let { (it as AppError.Auth).kind },
        )
        assertTrue(!local.restoreSession().let { it is AppResult.Ok })
    }

    @Test
    fun appleCancellationDoesNotCreateSession() = runBlocking {
        val live = object : AuthRepository by LocalAuthRepository(SecureSessionStore(InMemorySecureStore()), logger) {
            override suspend fun signIn(
                provider: AuthProviderKind,
                credentials: AuthCredentials,
            ): AppResult<AuthUser> = AuthErrorMapper.err(AppError.AuthKind.CANCELLED)
        }
        val local = LocalAuthRepository(SecureSessionStore(InMemorySecureStore()), logger)
        val composite = CompositeAuthRepository(local, live, allowLocalAuth = true)
        val result = composite.signIn(AuthProviderKind.APPLE, AuthCredentials())
        assertEquals(
            AppError.AuthKind.CANCELLED,
            ((result as AppResult.Err).error as AppError.Auth).kind,
        )
    }

    @Test
    fun offlineLiveSignInRequiresConnection() = runBlocking {
        val live = LocalAuthRepository(SecureSessionStore(InMemorySecureStore()), logger)
        val local = LocalAuthRepository(SecureSessionStore(InMemorySecureStore()), logger)
        val composite = CompositeAuthRepository(
            local,
            live,
            allowLocalAuth = false,
            connectivity = object : ConnectivityMonitor {
                override val online: StateFlow<Boolean> = MutableStateFlow(false)
                override fun start() = Unit
            },
        )
        val result = composite.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "user@example.com", password = "password1"),
        )
        assertEquals(
            AppError.AuthKind.CONNECTION_REQUIRED,
            ((result as AppResult.Err).error as AppError.Auth).kind,
        )
    }

    @Test
    fun releaseWithoutLiveRefusesCredentials() = runBlocking {
        val local = LocalAuthRepository(
            SecureSessionStore(InMemorySecureStore()),
            logger,
            allowLocalAuth = false,
        )
        val composite = CompositeAuthRepository(local, live = null, allowLocalAuth = false)
        val result = composite.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "user@example.com", password = "password1"),
        )
        assertTrue(result is AppResult.Err)
    }

    @Test
    fun assignRoleAthleteAndCoach() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val local = LocalAuthRepository(session, logger)
        local.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        val composite = CompositeAuthRepository(local, null, allowLocalAuth = true)
        val coach = composite.assignRole(UserRole.COACH) as AppResult.Ok
        assertEquals(UserRole.COACH, coach.value.role)
    }
}
