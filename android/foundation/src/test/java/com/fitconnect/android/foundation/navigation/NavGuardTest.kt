package com.fitconnect.android.foundation.navigation

import com.fitconnect.android.foundation.analytics.NoOpAnalytics
import com.fitconnect.android.foundation.auth.AuthCredentials
import com.fitconnect.android.foundation.auth.AuthProviderKind
import com.fitconnect.android.foundation.auth.LocalAuthRepository
import com.fitconnect.android.foundation.authz.SessionAuthorizer
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.session.SecureSessionStore
import com.fitconnect.android.foundation.support.InMemorySecureStore
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NavGuardTest {
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    @Test
    fun homeRedirectsWhenLoggedOut() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val guard = NavGuard(session, SessionAuthorizer(session), NoOpAnalytics())
        val decision = guard.authorize(CoreRoute.HOME)
        assertFalse(decision.allowed)
        assertEquals(CoreRoute.GUEST, decision.redirectTo)
    }

    @Test
    fun homeAllowedAfterSignIn() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)
        auth.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        val guard = NavGuard(session, SessionAuthorizer(session), NoOpAnalytics())
        val decision = guard.authorize(CoreRoute.HOME)
        assertTrue(decision.allowed)
    }

    @Test
    fun deepLinkMapsPath() {
        val session = SecureSessionStore(InMemorySecureStore())
        val guard = NavGuard(session, SessionAuthorizer(session), NoOpAnalytics())
        assertEquals(CoreRoute.AUTH, guard.deepLinkToRoute("fitconnect://app/auth"))
    }

    @Test
    fun nestedAthleteDeepLinkForcesHomeGuard() {
        val session = SecureSessionStore(InMemorySecureStore())
        val guard = NavGuard(session, SessionAuthorizer(session), NoOpAnalytics())
        assertEquals(CoreRoute.HOME, guard.deepLinkToRoute("fitconnect://app/athlete/home"))
    }

    @Test
    fun anonymousDeniedFromAppShell() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val auth = LocalAuthRepository(session, logger)
        auth.signInAnonymously()
        val guard = NavGuard(session, SessionAuthorizer(session), NoOpAnalytics())
        val decision = guard.authorize(CoreRoute.HOME)
        assertFalse(decision.allowed)
        assertEquals(CoreRoute.GUEST, decision.redirectTo)
    }
}
