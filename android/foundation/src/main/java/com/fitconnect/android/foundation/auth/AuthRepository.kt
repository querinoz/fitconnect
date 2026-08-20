package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

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
    val confirmPassword: String? = null,
    val idToken: String? = null,
    val nonce: String? = null,
    val magicLinkToken: String? = null,
    /** UI host for Credential Manager / Apple activity. Never a Firebase type. */
    val federated: FederatedAuthHost? = null,
)

data class AuthUser(
    val id: String,
    val email: String?,
    val role: UserRole,
    val emailVerified: Boolean = false,
    val providers: Set<AuthProviderKind> = emptySet(),
    val isLocalDemo: Boolean = false,
    val needsRoleSelection: Boolean = false,
)

data class LinkedProviders(
    val email: Boolean = false,
    val google: Boolean = false,
    val apple: Boolean = false,
)

/**
 * Provider-agnostic identity port.
 * UI and ViewModels never import Firebase, OAuth tokens, or vendor SDKs.
 */
interface AuthRepository {
    suspend fun signIn(
        provider: AuthProviderKind,
        credentials: AuthCredentials = AuthCredentials(),
    ): AppResult<AuthUser>

    suspend fun signUp(email: String, password: String, confirmPassword: String? = null): AppResult<AuthUser>

    suspend fun sendMagicLink(email: String): AppResult<Unit>

    suspend fun sendPasswordReset(email: String): AppResult<Unit> = sendMagicLink(email)

    suspend fun sendEmailVerification(): AppResult<Unit> =
        AppResult.Err(AppError.Auth(AppError.AuthKind.PROVIDER_UNAVAILABLE))

    suspend fun signInAnonymously(): AppResult<AuthUser>

    suspend fun continueAsGuest(): AppResult<Unit>

    suspend fun restoreSession(): AppResult<SessionSnapshot>

    suspend fun refreshSession(): AppResult<AuthTokens>

    suspend fun logout(): AppResult<Unit>

    suspend fun deleteSession(): AppResult<Unit>

    suspend fun enableBiometricUnlock(enabled: Boolean): AppResult<Unit>

    suspend fun unlockWithBiometric(): AppResult<AuthUser>

    suspend fun currentUser(): AppResult<AuthUser> =
        AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))

    suspend fun reloadUser(): AppResult<AuthUser> = currentUser()

    fun observeAuthState(): Flow<AuthUser?> = flow {
        emit(currentUser().getOrNull())
    }

    suspend fun linkProvider(
        provider: AuthProviderKind,
        credentials: AuthCredentials = AuthCredentials(),
    ): AppResult<AuthUser> = AppResult.Err(AppError.Auth(AppError.AuthKind.PROVIDER_UNAVAILABLE))

    suspend fun unlinkProvider(provider: AuthProviderKind): AppResult<AuthUser> =
        AppResult.Err(AppError.Auth(AppError.AuthKind.PROVIDER_UNAVAILABLE))

    suspend fun linkedProviders(): AppResult<LinkedProviders> = AppResult.Ok(LinkedProviders())

    suspend fun assignRole(role: UserRole): AppResult<AuthUser> =
        AppResult.Err(AppError.Auth(AppError.AuthKind.FORBIDDEN))

    /** App-data deletion. LOCAL_DEMO adapters must refuse. Firebase Auth user delete is PENDING_HUMAN. */
    suspend fun deleteAccount(): AppResult<Unit> =
        AppResult.Err(AppError.Auth(AppError.AuthKind.FORBIDDEN))
}

fun interface TokenRefresher {
    suspend fun refresh(): AppResult<AuthTokens>
}
