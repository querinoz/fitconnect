package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult

/**
 * Activity-backed federated identity host.
 * Implementations live in :app. Foundation never imports Firebase or Play types.
 */
interface FederatedAuthHost {
    suspend fun googleIdToken(): AppResult<String>
    suspend fun appleSignIn(): AppResult<IdentitySnapshot>
    suspend fun clearCredentialState(): AppResult<Unit> = AppResult.Ok(Unit)
}

object UnavailableFederatedAuthHost : FederatedAuthHost {
    override suspend fun googleIdToken(): AppResult<String> =
        AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)

    override suspend fun appleSignIn(): AppResult<IdentitySnapshot> =
        AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
}

/**
 * Canonical identity snapshot from the IdP adapter (Firebase UID, never email).
 */
data class IdentitySnapshot(
    val uid: String,
    val email: String?,
    val emailVerified: Boolean,
    val providers: Set<AuthProviderKind>,
    val idToken: String,
    val refreshToken: String? = null,
    val expiresAtEpochMs: Long? = null,
    val displayName: String? = null,
    val photoUrl: String? = null,
)

/**
 * Vendor-free gateway so [FirebaseAuthRepository] can live in foundation
 * and :app can bind the real SDK (or tests can bind a fake).
 */
interface FirebaseAuthGateway {
    val isAvailable: Boolean
    suspend fun signInEmail(email: String, password: String): AppResult<IdentitySnapshot>
    suspend fun signUpEmail(email: String, password: String): AppResult<IdentitySnapshot>
    suspend fun signInGoogle(idToken: String): AppResult<IdentitySnapshot>
    suspend fun sendPasswordReset(email: String): AppResult<Unit>
    suspend fun sendEmailVerification(): AppResult<Unit>
    suspend fun reload(): AppResult<IdentitySnapshot>
    suspend fun signOut(): AppResult<Unit>
    suspend fun current(): AppResult<IdentitySnapshot?>
    suspend fun getIdToken(forceRefresh: Boolean): AppResult<String>
    suspend fun linkEmail(email: String, password: String): AppResult<IdentitySnapshot>
    suspend fun linkGoogle(idToken: String): AppResult<IdentitySnapshot>
    suspend fun unlink(provider: AuthProviderKind): AppResult<IdentitySnapshot>
}
