package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.security.AccountIsolationController
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import com.fitconnect.android.foundation.session.SessionStore
import java.util.UUID

enum class AuthProviderKind {
    EMAIL_PASSWORD,
    GOOGLE,
    APPLE,
    MAGIC_LINK,
    ANONYMOUS,
    GUEST,
    BIOMETRIC_UNLOCK,
}

data class AuthCredentials(
    val email: String? = null,
    val password: String? = null,
    val idToken: String? = null,
    val magicLinkToken: String? = null,
)

data class AuthUser(
    val id: String,
    val email: String?,
    val role: UserRole,
)

/**
 * Provider-agnostic auth port. Supabase (or any IdP) plugs in behind this
 * interface — UI and networking never import a vendor SDK directly.
 */
interface AuthRepository {
    suspend fun signIn(provider: AuthProviderKind, credentials: AuthCredentials = AuthCredentials()): AppResult<AuthUser>
    suspend fun signUp(email: String, password: String): AppResult<AuthUser>
    suspend fun sendMagicLink(email: String): AppResult<Unit>
    suspend fun signInAnonymously(): AppResult<AuthUser>
    suspend fun continueAsGuest(): AppResult<Unit>
    suspend fun restoreSession(): AppResult<SessionSnapshot>
    suspend fun refreshSession(): AppResult<AuthTokens>
    suspend fun logout(): AppResult<Unit>
    suspend fun deleteSession(): AppResult<Unit>
    suspend fun enableBiometricUnlock(enabled: Boolean): AppResult<Unit>
    suspend fun unlockWithBiometric(): AppResult<AuthUser>
}

fun interface TokenRefresher {
    suspend fun refresh(): AppResult<AuthTokens>
}

/**
 * Local/dev auth adapter. Roles are NEVER elevated to ADMIN from client input.
 * Coach elevation is debug-only. Production builds must replace this with a
 * server-backed IdP repository — local tokens are not production authority.
 *
 * @param allowLocalCoachElevation when false (release), coach emails cannot escalate.
 */
class LocalAuthRepository(
    private val sessionStore: SessionStore,
    private val logger: Logger,
    private val isolation: AccountIsolationController? = null,
    private val allowLocalCoachElevation: Boolean = false,
    /** Release builds without IdP must set false — prevents forgeable sessions. */
    private val allowLocalAuth: Boolean = true,
) : AuthRepository, TokenRefresher {

    override suspend fun signIn(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> {
        if (!allowLocalAuth && provider != AuthProviderKind.GUEST) {
            logger.w("AuthRepository", "local auth disabled in this build")
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        return when (provider) {
            AuthProviderKind.EMAIL_PASSWORD -> {
                val email = credentials.email?.trim().orEmpty()
                val password = credentials.password.orEmpty()
                if (email.isEmpty() || password.length < 8) {
                    return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
                }
                // Never grant ADMIN from client-controlled email. Coach only when explicitly allowed (debug).
                val role = DemoPersona.resolveRole(email, allowLocalCoachElevation)
                persistUser(email = email, role = role, anonymous = false)
            }
            AuthProviderKind.GOOGLE, AuthProviderKind.APPLE -> {
                val token = credentials.idToken
                if (token.isNullOrBlank()) {
                    return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
                }
                persistUser(email = "$provider@oauth.local", role = UserRole.ATHLETE, anonymous = false)
            }
            AuthProviderKind.MAGIC_LINK -> {
                val token = credentials.magicLinkToken
                if (token.isNullOrBlank()) {
                    return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
                }
                persistUser(email = credentials.email ?: "magic@local", role = UserRole.ATHLETE, anonymous = false)
            }
            AuthProviderKind.ANONYMOUS -> signInAnonymously()
            AuthProviderKind.GUEST -> {
                continueAsGuest()
                AppResult.Ok(AuthUser(id = "guest", email = null, role = UserRole.GUEST))
            }
            AuthProviderKind.BIOMETRIC_UNLOCK -> unlockWithBiometric()
        }
    }

    override suspend fun signUp(email: String, password: String): AppResult<AuthUser> {
        if (!allowLocalAuth) {
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        return signIn(AuthProviderKind.EMAIL_PASSWORD, AuthCredentials(email = email, password = password))
    }

    override suspend fun sendMagicLink(email: String): AppResult<Unit> {
        if (!allowLocalAuth) {
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        if (email.isBlank()) return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        logger.i("AuthRepository", "magic link queued for delivery (local adapter)")
        return AppResult.Ok(Unit)
    }

    override suspend fun signInAnonymously(): AppResult<AuthUser> {
        if (!allowLocalAuth) {
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        return persistUser(email = null, role = UserRole.ANONYMOUS, anonymous = true)
    }

    override suspend fun continueAsGuest(): AppResult<Unit> {
        isolation?.wipeForLogout()
        sessionStore.clear()
        return sessionStore.save(
            SessionSnapshot(
                userId = null,
                role = UserRole.GUEST,
                tokens = null,
                isAnonymous = false,
                biometricUnlockEnabled = false,
            ),
        )
    }

    override suspend fun restoreSession(): AppResult<SessionSnapshot> {
        val snap = sessionStore.snapshot()
        return if (snap.tokens != null || snap.isAnonymous) AppResult.Ok(snap)
        else AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
    }

    override suspend fun refreshSession(): AppResult<AuthTokens> = refresh()

    override suspend fun refresh(): AppResult<AuthTokens> {
        val current = sessionStore.refreshToken()
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.REFRESH_FAILED))
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
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        return AppResult.Ok(
            AuthUser(
                id = snap.userId ?: "unknown",
                email = null,
                role = snap.role,
            ),
        )
    }

    private suspend fun persistUser(
        email: String?,
        role: UserRole,
        anonymous: Boolean,
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
            ),
        )
        return when (result) {
            is AppResult.Ok -> AppResult.Ok(AuthUser(id = id, email = email, role = role))
            is AppResult.Err -> result
        }
    }
}
