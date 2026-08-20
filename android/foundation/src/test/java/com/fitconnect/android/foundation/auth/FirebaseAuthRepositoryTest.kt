package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.session.SecureSessionStore
import com.fitconnect.android.foundation.support.InMemorySecureStore
import kotlinx.coroutines.runBlocking
import com.fitconnect.android.foundation.identity.IdentityOnboarding
import com.fitconnect.android.foundation.identity.IdentityProfile
import com.fitconnect.android.foundation.identity.IdentityRemote
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FirebaseAuthRepositoryTest {
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    @Test
    fun emailRegisterAndLogin() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        val created = repo.signUp("new@fitconnect.app", "password1", "password1") as AppResult.Ok
        assertEquals("new@fitconnect.app", created.value.email)
        assertEquals(created.value.id, gateway.lastUid)
        val login = repo.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "new@fitconnect.app", password = "password1"),
        ) as AppResult.Ok
        assertEquals(created.value.id, login.value.id)
    }

    @Test
    fun wrongPassword() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        gateway.signUpEmail("a@b.com", "password1")
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        val result = repo.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "wrongpass"),
        )
        assertEquals(
            AppError.AuthKind.INVALID_CREDENTIALS,
            ((result as AppResult.Err).error as AppError.Auth).kind,
        )
    }

    @Test
    fun passwordResetAndVerification() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        repo.signUp("a@b.com", "password1", "password1")
        assertTrue(repo.sendPasswordReset("a@b.com") is AppResult.Ok)
        assertTrue(repo.sendEmailVerification() is AppResult.Ok)
        gateway.verified = true
        val reloaded = repo.reloadUser() as AppResult.Ok
        assertTrue(reloaded.value.emailVerified)
    }

    @Test
    fun googleSuccessCancelFailure() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        val ok = repo.signIn(
            AuthProviderKind.GOOGLE,
            AuthCredentials(federated = FakeFederatedHost(google = AppResult.Ok("google-id-token"))),
        ) as AppResult.Ok
        assertTrue(ok.value.providers.contains(AuthProviderKind.GOOGLE))

        val cancelled = repo.signIn(
            AuthProviderKind.GOOGLE,
            AuthCredentials(federated = FakeFederatedHost(google = AuthErrorMapper.err(AppError.AuthKind.CANCELLED))),
        )
        assertEquals(AppError.AuthKind.CANCELLED, ((cancelled as AppResult.Err).error as AppError.Auth).kind)

        val failed = repo.signIn(
            AuthProviderKind.GOOGLE,
            AuthCredentials(federated = FakeFederatedHost(google = AuthErrorMapper.err(AppError.AuthKind.NETWORK_ERROR))),
        )
        assertEquals(AppError.AuthKind.NETWORK_ERROR, ((failed as AppResult.Err).error as AppError.Auth).kind)
    }

    @Test
    fun appleSuccessCancelFailure() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        val identity = IdentitySnapshot(
            uid = "apple-uid",
            email = "relay@privaterelay.appleid.com",
            emailVerified = true,
            providers = setOf(AuthProviderKind.APPLE),
            idToken = "firebase-id-token",
        )
        val ok = repo.signIn(
            AuthProviderKind.APPLE,
            AuthCredentials(federated = FakeFederatedHost(apple = AppResult.Ok(identity))),
        ) as AppResult.Ok
        assertEquals("apple-uid", ok.value.id)
        assertEquals("relay@privaterelay.appleid.com", ok.value.email)

        val cancelled = repo.signIn(
            AuthProviderKind.APPLE,
            AuthCredentials(federated = FakeFederatedHost(apple = AuthErrorMapper.err(AppError.AuthKind.CANCELLED))),
        )
        assertEquals(AppError.AuthKind.CANCELLED, ((cancelled as AppResult.Err).error as AppError.Auth).kind)
    }

    @Test
    fun logoutClearsSession() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        val session = SecureSessionStore(InMemorySecureStore())
        val repo = FirebaseAuthRepository(gateway, session, logger)
        repo.signUp("a@b.com", "password1", "password1")
        assertTrue(session.isLoggedIn())
        repo.logout()
        assertTrue(!session.isLoggedIn())
        assertTrue(gateway.signedOut)
    }

    @Test
    fun sessionRestoreUsesFirebaseUid() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        val session = SecureSessionStore(InMemorySecureStore())
        val repo = FirebaseAuthRepository(gateway, session, logger)
        val user = repo.signUp("a@b.com", "password1", "password1") as AppResult.Ok
        val restored = repo.restoreSession() as AppResult.Ok
        assertEquals(user.value.id, restored.value.userId)
        assertEquals(UserRole.ATHLETE, restored.value.role)
    }

    @Test
    fun accountLinkingGoogle() = runBlocking {
        val gateway = FakeFirebaseAuthGateway()
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        repo.signUp("a@b.com", "password1", "password1")
        val linked = repo.linkProvider(
            AuthProviderKind.GOOGLE,
            AuthCredentials(federated = FakeFederatedHost(google = AppResult.Ok("google-id-token"))),
        ) as AppResult.Ok
        assertTrue(linked.value.providers.contains(AuthProviderKind.GOOGLE))
        assertTrue(linked.value.providers.contains(AuthProviderKind.EMAIL_PASSWORD))
    }

    @Test
    fun duplicateAccountNotSilentlyMerged() = runBlocking {
        val gateway = FakeFirebaseAuthGateway(rejectLink = true)
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        repo.signUp("a@b.com", "password1", "password1")
        val linked = repo.linkProvider(
            AuthProviderKind.GOOGLE,
            AuthCredentials(federated = FakeFederatedHost(google = AppResult.Ok("other-account"))),
        )
        assertEquals(
            AppError.AuthKind.ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL,
            ((linked as AppResult.Err).error as AppError.Auth).kind,
        )
    }

    @Test
    fun unavailableGatewayDoesNotFakeSuccess() = runBlocking {
        val gateway = FakeFirebaseAuthGateway(isAvailable = false)
        val repo = FirebaseAuthRepository(gateway, SecureSessionStore(InMemorySecureStore()), logger)
        val result = repo.signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = "a@b.com", password = "password1"),
        )
        assertEquals(
            AppError.AuthKind.PROVIDER_UNAVAILABLE,
            ((result as AppResult.Err).error as AppError.Auth).kind,
        )
    }

    @Test
    fun bootstrapAppliesServerRoleAndLogoutClearsCredentials() = runBlocking {
        var cleared = false
        val remote = FakeIdentityRemote(role = UserRole.COACH)
        val repo = FirebaseAuthRepository(
            FakeFirebaseAuthGateway(),
            SecureSessionStore(InMemorySecureStore()),
            logger,
            identityRemote = remote,
            credentialClearer = { cleared = true },
        )
        val created = repo.signUp("a@b.com", "password1", "password1") as AppResult.Ok
        assertTrue(remote.bootstrapped)
        assertEquals(UserRole.COACH, created.value.role)
        assertTrue(!created.value.needsRoleSelection)
        repo.logout()
        assertTrue(cleared)
    }

    @Test
    fun deleteAccountCallsRemoteThenClearsSession() = runBlocking {
        val remote = FakeIdentityRemote(role = UserRole.ATHLETE)
        val session = SecureSessionStore(InMemorySecureStore())
        val repo = FirebaseAuthRepository(
            FakeFirebaseAuthGateway(),
            session,
            logger,
            identityRemote = remote,
        )
        repo.signUp("a@b.com", "password1", "password1")
        val deleted = repo.deleteAccount()
        assertTrue(deleted is AppResult.Ok)
        assertTrue(remote.deleted)
        assertTrue(!session.isLoggedIn())
    }

    @Test
    fun deleteAccountWithoutRemoteIsDenied() = runBlocking {
        val session = SecureSessionStore(InMemorySecureStore())
        val repo = FirebaseAuthRepository(FakeFirebaseAuthGateway(), session, logger)
        repo.signUp("a@b.com", "password1", "password1")
        val deleted = repo.deleteAccount()
        assertEquals(
            AppError.AuthKind.FORBIDDEN,
            ((deleted as AppResult.Err).error as AppError.Auth).kind,
        )
        assertTrue(session.isLoggedIn())
    }
}

private class FakeIdentityRemote(
    private val role: UserRole? = UserRole.ATHLETE,
) : IdentityRemote {
    var bootstrapped = false
    var deleted = false

    override suspend fun bootstrap(
        displayName: String?,
        email: String?,
        photoUrl: String?,
    ): AppResult<IdentityProfile> {
        bootstrapped = true
        return AppResult.Ok(
            IdentityProfile(
                uid = "uid-1",
                email = email,
                displayName = displayName,
                avatarUrl = photoUrl,
                locale = null,
                timezone = null,
                accent = null,
                role = role,
                onboardingCompleted = false,
                onboardingStep = 0,
            ),
        )
    }

    override suspend fun getProfile(): AppResult<IdentityProfile> =
        bootstrap(null, null, null)

    override suspend fun setRole(role: UserRole): AppResult<IdentityProfile> =
        bootstrap(null, null, null)

    override suspend fun getOnboarding(): AppResult<IdentityOnboarding> =
        AppResult.Ok(IdentityOnboarding("uid-1", role, 0, false, "{}"))

    override suspend fun putOnboarding(state: IdentityOnboarding): AppResult<IdentityOnboarding> =
        AppResult.Ok(state)

    override suspend fun deleteAccount(): AppResult<Unit> {
        deleted = true
        return AppResult.Ok(Unit)
    }
}

private class FakeFederatedHost(
    private val google: AppResult<String> = AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE),
    private val apple: AppResult<IdentitySnapshot> = AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE),
) : FederatedAuthHost {
    override suspend fun googleIdToken(): AppResult<String> = google
    override suspend fun appleSignIn(): AppResult<IdentitySnapshot> = apple
}

private class FakeFirebaseAuthGateway(
    override val isAvailable: Boolean = true,
    private val rejectLink: Boolean = false,
) : FirebaseAuthGateway {
    var lastUid: String = "uid-1"
    var verified: Boolean = false
    var signedOut: Boolean = false
    private val passwords = mutableMapOf<String, String>()
    private var providers = mutableSetOf<AuthProviderKind>()
    private var currentEmail: String? = null

    override suspend fun signInEmail(email: String, password: String): AppResult<IdentitySnapshot> {
        val stored = passwords[email] ?: return AuthErrorMapper.err(AppError.AuthKind.INVALID_CREDENTIALS)
        if (stored != password) return AuthErrorMapper.err(AppError.AuthKind.INVALID_CREDENTIALS)
        currentEmail = email
        providers.add(AuthProviderKind.EMAIL_PASSWORD)
        return snapshot()
    }

    override suspend fun signUpEmail(email: String, password: String): AppResult<IdentitySnapshot> {
        if (passwords.containsKey(email)) return AuthErrorMapper.err(AppError.AuthKind.EMAIL_ALREADY_EXISTS)
        passwords[email] = password
        currentEmail = email
        providers.add(AuthProviderKind.EMAIL_PASSWORD)
        return snapshot()
    }

    override suspend fun signInGoogle(idToken: String): AppResult<IdentitySnapshot> {
        providers.add(AuthProviderKind.GOOGLE)
        return snapshot()
    }

    override suspend fun sendPasswordReset(email: String): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun sendEmailVerification(): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun reload(): AppResult<IdentitySnapshot> = snapshot()
    override suspend fun signOut(): AppResult<Unit> {
        signedOut = true
        currentEmail = null
        return AppResult.Ok(Unit)
    }

    override suspend fun current(): AppResult<IdentitySnapshot?> =
        if (currentEmail == null && providers.isEmpty()) AppResult.Ok(null) else snapshot()

    override suspend fun getIdToken(forceRefresh: Boolean): AppResult<String> = AppResult.Ok("id-token")

    override suspend fun linkEmail(email: String, password: String): AppResult<IdentitySnapshot> {
        providers.add(AuthProviderKind.EMAIL_PASSWORD)
        return snapshot()
    }

    override suspend fun linkGoogle(idToken: String): AppResult<IdentitySnapshot> {
        if (rejectLink) return AuthErrorMapper.err(AppError.AuthKind.ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL)
        providers.add(AuthProviderKind.GOOGLE)
        return snapshot()
    }

    override suspend fun unlink(provider: AuthProviderKind): AppResult<IdentitySnapshot> {
        providers.remove(provider)
        return snapshot()
    }

    private fun snapshot(): AppResult<IdentitySnapshot> = AppResult.Ok(
        IdentitySnapshot(
            uid = lastUid,
            email = currentEmail,
            emailVerified = verified,
            providers = providers.toSet(),
            idToken = "id-token",
            refreshToken = "refresh-token",
        ),
    )
}
