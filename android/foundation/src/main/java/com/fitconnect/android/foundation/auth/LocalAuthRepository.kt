package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.security.AccountIsolationController
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import com.fitconnect.android.foundation.session.SessionStore
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

/**
 * Local/dev auth adapter. Roles are NEVER elevated to ADMIN from client input.
 * Coach elevation is debug-only. Production builds must set [allowLocalAuth] false.
 *
 * Google/Apple are **not** simulated here — those providers must go through the live IdP.
 */
class LocalAuthRepository(
    private val sessionStore: SessionStore,
    private val logger: Logger,
    private val isolation: AccountIsolationController? = null,
    private val allowLocalCoachElevation: Boolean = false,
    /** Release builds without IdP must set false — prevents forgeable sessions. */
    private val allowLocalAuth: Boolean = true,
    private val keyValueStore: KeyValueStore? = null,
) : AuthRepository, TokenRefresher {

    private val authState = MutableStateFlow<AuthUser?>(null)

    override suspend fun signIn(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> {
        if (!allowLocalAuth && provider != AuthProviderKind.GUEST) {
            logger.w("AuthRepository", "local auth disabled in this build")
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return when (provider) {
            AuthProviderKind.EMAIL_PASSWORD -> {
                AuthValidators.email(credentials.email)?.let { return AuthErrorMapper.err(it) }
                AuthValidators.password(credentials.password)?.let { return AuthErrorMapper.err(it) }
                val email = credentials.email!!.trim()
                val role = DemoPersona.resolveRole(email, allowLocalCoachElevation)
                persistUser(
                    email = email,
                    role = role,
                    anonymous = false,
                    providers = setOf(AuthProviderKind.EMAIL_PASSWORD),
                )
            }
            AuthProviderKind.GOOGLE, AuthProviderKind.APPLE ->
                AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
            AuthProviderKind.MAGIC_LINK -> {
                val token = credentials.magicLinkToken
                if (token.isNullOrBlank()) {
                    return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
                }
                persistUser(
                    email = credentials.email ?: "magic@local",
                    role = UserRole.ATHLETE,
                    anonymous = false,
                    providers = setOf(AuthProviderKind.MAGIC_LINK),
                )
            }
            AuthProviderKind.ANONYMOUS -> signInAnonymously()
            AuthProviderKind.GUEST -> {
                continueAsGuest()
                AppResult.Ok(AuthUser(id = "guest", email = null, role = UserRole.GUEST, isLocalDemo = true))
            }
            AuthProviderKind.BIOMETRIC_UNLOCK -> unlockWithBiometric()
        }
    }

    override suspend fun signUp(
        email: String,
        password: String,
        confirmPassword: String?,
    ): AppResult<AuthUser> {
        if (!allowLocalAuth) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        AuthValidators.passwordsMatch(password, confirmPassword)?.let { return AuthErrorMapper.err(it) }
        return signIn(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = email, password = password, confirmPassword = confirmPassword),
        )
    }

    override suspend fun sendMagicLink(email: String): AppResult<Unit> {
        if (!allowLocalAuth) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        AuthValidators.email(email)?.let { return AuthErrorMapper.err(it) }
        logger.i("AuthRepository", "magic link queued for delivery (local adapter)")
        return AppResult.Ok(Unit)
    }

    override suspend fun sendEmailVerification(): AppResult<Unit> {
        if (!allowLocalAuth) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return AppResult.Ok(Unit)
    }

    override suspend fun signInAnonymously(): AppResult<AuthUser> {
        if (!allowLocalAuth) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return persistUser(
            email = null,
            role = UserRole.ANONYMOUS,
            anonymous = true,
            providers = setOf(AuthProviderKind.ANONYMOUS),
        )
    }

    override suspend fun continueAsGuest(): AppResult<Unit> {
        isolation?.wipeForLogout()
        sessionStore.clear()
        authState.value = null
        return sessionStore.save(
            SessionSnapshot(
                userId = null,
                role = UserRole.GUEST,
                tokens = null,
                isAnonymous = false,
                biometricUnlockEnabled = false,
                isLocalDemo = false,
            ),
        )
    }

    override suspend fun restoreSession(): AppResult<SessionSnapshot> {
        val snap = sessionStore.snapshot()
        return if (snap.tokens != null || snap.isAnonymous) {
            authState.value = snap.toAuthUser()
            AppResult.Ok(snap)
        } else {
            AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
    }

    override suspend fun refreshSession(): AppResult<AuthTokens> = refresh()

    override suspend fun refresh(): AppResult<AuthTokens> {
        val current = sessionStore.refreshToken()
            ?: return AuthErrorMapper.err(AppError.AuthKind.REFRESH_FAILED)
        val rotated = AuthTokens(
            accessToken = "access-${UUID.randomUUID()}",
            refreshToken = "refresh-${UUID.randomUUID()}",
            expiresAtEpochMs = System.currentTimeMillis() + 3_600_000,
        )
        logger.d("AuthRepository", "token rotated (local adapter); prior refresh len=${current.length}")
        sessionStore.updateTokens(rotated)
        return AppResult.Ok(rotated)
    }

    override suspend fun logout(): AppResult<Unit> {
        isolation?.wipeForLogout()?.let { if (it is AppResult.Err) return it }
        authState.value = null
        return sessionStore.clear()
    }

    override suspend fun deleteSession(): AppResult<Unit> = logout()

    override suspend fun enableBiometricUnlock(enabled: Boolean): AppResult<Unit> {
        val snap = sessionStore.snapshot()
        return sessionStore.save(snap.copy(biometricUnlockEnabled = enabled))
    }

    override suspend fun unlockWithBiometric(): AppResult<AuthUser> {
        val snap = sessionStore.snapshot()
        if (!snap.biometricUnlockEnabled || snap.tokens == null) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return AppResult.Ok(snap.toAuthUser())
    }

    override suspend fun currentUser(): AppResult<AuthUser> {
        val snap = sessionStore.snapshot()
        if (snap.tokens == null && !snap.isAnonymous) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return AppResult.Ok(snap.toAuthUser())
    }

    override fun observeAuthState(): Flow<AuthUser?> = authState.asStateFlow()

    override suspend fun linkedProviders(): AppResult<LinkedProviders> {
        val snap = sessionStore.snapshot()
        val uid = snap.userId ?: return AppResult.Ok(LinkedProviders())
        val stored = keyValueStore?.get(PreferenceKeys.identityProviders(uid)).orEmpty()
        return AppResult.Ok(parseProviders(stored).toLinked())
    }

    override suspend fun assignRole(role: UserRole): AppResult<AuthUser> {
        if (role != UserRole.ATHLETE && role != UserRole.COACH) {
            return AuthErrorMapper.err(AppError.AuthKind.FORBIDDEN)
        }
        val snap = sessionStore.snapshot()
        if (snap.tokens == null) return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        val uid = snap.userId ?: return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        sessionStore.save(snap.copy(role = role))
        keyValueStore?.set(PreferenceKeys.identityRoleSelected(uid), "1")
        return currentUser()
    }

    override suspend fun linkProvider(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> = AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)

    override suspend fun unlinkProvider(provider: AuthProviderKind): AppResult<AuthUser> =
        AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)

    private suspend fun persistUser(
        email: String?,
        role: UserRole,
        anonymous: Boolean,
        providers: Set<AuthProviderKind>,
    ): AppResult<AuthUser> {
        require(role != UserRole.ADMIN) { "ADMIN cannot be assigned by local auth" }
        val id = UUID.randomUUID().toString()
        isolation?.wipeForAccountSwitch(id)
        val tokens = AuthTokens(
            accessToken = "access-${UUID.randomUUID()}",
            refreshToken = "refresh-${UUID.randomUUID()}",
            expiresAtEpochMs = System.currentTimeMillis() + 3_600_000,
        )
        val result = sessionStore.save(
            SessionSnapshot(
                userId = id,
                role = role,
                tokens = tokens,
                isAnonymous = anonymous,
                biometricUnlockEnabled = false,
                isLocalDemo = true,
            ),
        )
        keyValueStore?.set(PreferenceKeys.identityRoleSelected(id), "1")
        keyValueStore?.set(PreferenceKeys.identityProviders(id), providers.joinToString(",") { it.name })
        val user = AuthUser(
            id = id,
            email = email,
            role = role,
            emailVerified = true,
            providers = providers,
            isLocalDemo = true,
            needsRoleSelection = false,
        )
        return when (result) {
            is AppResult.Ok -> {
                authState.value = user
                AppResult.Ok(user)
            }
            is AppResult.Err -> result
        }
    }

    private suspend fun SessionSnapshot.toAuthUser(): AuthUser {
        val stored = userId?.let { keyValueStore?.get(PreferenceKeys.identityProviders(it)) }.orEmpty()
        return AuthUser(
            id = userId ?: "unknown",
            email = null,
            role = role,
            emailVerified = true,
            providers = parseProviders(stored),
            isLocalDemo = isLocalDemo,
            needsRoleSelection = false,
        )
    }
}

internal fun parseProviders(raw: String): Set<AuthProviderKind> =
    raw.split(',')
        .mapNotNull { runCatching { AuthProviderKind.valueOf(it.trim()) }.getOrNull() }
        .toSet()

internal fun Set<AuthProviderKind>.toLinked(): LinkedProviders = LinkedProviders(
    email = contains(AuthProviderKind.EMAIL_PASSWORD),
    google = contains(AuthProviderKind.GOOGLE),
    apple = contains(AuthProviderKind.APPLE),
)
