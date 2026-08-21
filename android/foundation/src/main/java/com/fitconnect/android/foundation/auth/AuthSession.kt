package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole

enum class AuthSessionState {
    SIGNED_OUT,
    AUTHENTICATING,
    SIGNED_IN,
    REFRESHING,
    ERROR,
}

/**
 * Canonical identity session shared conceptually with web `AuthSession`.
 * Persistence remains [com.fitconnect.android.foundation.session.SessionSnapshot].
 */
data class AuthSession(
    val uid: String,
    val email: String?,
    val displayName: String?,
    val photoUrl: String?,
    val provider: AuthProviderKind?,
    val isEmailVerified: Boolean,
    val role: UserRole?,
    val state: AuthSessionState,
)

fun AuthUser.toAuthSession(
    displayName: String? = null,
    photoUrl: String? = null,
    state: AuthSessionState = AuthSessionState.SIGNED_IN,
): AuthSession = AuthSession(
    uid = id,
    email = email,
    displayName = displayName,
    photoUrl = photoUrl,
    provider = providers.firstOrNull(),
    isEmailVerified = emailVerified,
    role = role,
    state = state,
)
