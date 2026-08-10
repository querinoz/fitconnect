package com.fitconnect.android.foundation.session

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.SecureStore

data class AuthTokens(
    val accessToken: String,
    val refreshToken: String?,
    val expiresAtEpochMs: Long? = null,
)

data class SessionSnapshot(
    val userId: String?,
    val role: UserRole,
    val tokens: AuthTokens?,
    val isAnonymous: Boolean,
    val biometricUnlockEnabled: Boolean,
)

/**
 * Durable session material. Access/refresh tokens never leave SecureStore
 * except through this port.
 */
interface SessionStore {
    suspend fun snapshot(): SessionSnapshot
    suspend fun isLoggedIn(): Boolean
    suspend fun role(): UserRole
    suspend fun accessToken(): String?
    suspend fun refreshToken(): String?
    suspend fun save(snapshot: SessionSnapshot): AppResult<Unit>
    suspend fun updateTokens(tokens: AuthTokens): AppResult<Unit>
    suspend fun clear(): AppResult<Unit>
}

class SecureSessionStore(
    private val secureStore: SecureStore,
) : SessionStore {
    override suspend fun snapshot(): SessionSnapshot {
        val access = read(ACCESS_KEY)
        val refresh = read(REFRESH_KEY)
        val userId = read(USER_KEY)
        val role = read(ROLE_KEY)?.let { runCatching { UserRole.valueOf(it) }.getOrNull() }
            ?: if (access == null) UserRole.GUEST else UserRole.ATHLETE
        val anonymous = read(ANON_KEY) == "1"
        val biometric = read(BIOMETRIC_KEY) == "1"
        val expires = read(EXPIRES_KEY)?.toLongOrNull()
        val tokens = access?.let {
            AuthTokens(accessToken = it, refreshToken = refresh, expiresAtEpochMs = expires)
        }
        return SessionSnapshot(
            userId = userId,
            role = if (access == null && !anonymous) UserRole.GUEST else role,
            tokens = tokens,
            isAnonymous = anonymous,
            biometricUnlockEnabled = biometric,
        )
    }

    override suspend fun isLoggedIn(): Boolean {
        val snap = snapshot()
        return snap.tokens?.accessToken != null || snap.isAnonymous
    }

    override suspend fun role(): UserRole = snapshot().role

    override suspend fun accessToken(): String? = read(ACCESS_KEY)

    override suspend fun refreshToken(): String? = read(REFRESH_KEY)

    override suspend fun save(snapshot: SessionSnapshot): AppResult<Unit> {
        val tokens = snapshot.tokens
        if (tokens != null) {
            write(ACCESS_KEY, tokens.accessToken)?.let { return it }
            if (tokens.refreshToken != null) {
                write(REFRESH_KEY, tokens.refreshToken)?.let { return it }
            } else {
                secureStore.remove(REFRESH_KEY)
            }
            if (tokens.expiresAtEpochMs != null) {
                write(EXPIRES_KEY, tokens.expiresAtEpochMs.toString())?.let { return it }
            }
        }
        if (snapshot.userId != null) {
            write(USER_KEY, snapshot.userId)?.let { return it }
        } else {
            secureStore.remove(USER_KEY)
        }
        write(ROLE_KEY, snapshot.role.name)?.let { return it }
        write(ANON_KEY, if (snapshot.isAnonymous) "1" else "0")?.let { return it }
        write(BIOMETRIC_KEY, if (snapshot.biometricUnlockEnabled) "1" else "0")?.let { return it }
        return AppResult.Ok(Unit)
    }

    override suspend fun updateTokens(tokens: AuthTokens): AppResult<Unit> {
        write(ACCESS_KEY, tokens.accessToken)?.let { return it }
        if (tokens.refreshToken != null) {
            write(REFRESH_KEY, tokens.refreshToken)?.let { return it }
        }
        if (tokens.expiresAtEpochMs != null) {
            write(EXPIRES_KEY, tokens.expiresAtEpochMs.toString())?.let { return it }
        }
        return AppResult.Ok(Unit)
    }

    override suspend fun clear(): AppResult<Unit> {
        listOf(ACCESS_KEY, REFRESH_KEY, USER_KEY, ROLE_KEY, ANON_KEY, BIOMETRIC_KEY, EXPIRES_KEY)
            .forEach { secureStore.remove(it) }
        return AppResult.Ok(Unit)
    }

    private suspend fun read(key: String): String? =
        when (val result = secureStore.get(key)) {
            is AppResult.Ok -> result.value
            is AppResult.Err -> null
        }

    /** Returns Err to propagate, or null when write succeeded. */
    private suspend fun write(key: String, value: String): AppResult.Err? =
        when (val result = secureStore.set(key, value)) {
            is AppResult.Ok -> null
            is AppResult.Err -> result
        }

    companion object {
        const val ACCESS_KEY = "session.access"
        const val REFRESH_KEY = "session.refresh"
        const val USER_KEY = "session.user"
        const val ROLE_KEY = "session.role"
        const val ANON_KEY = "session.anonymous"
        const val BIOMETRIC_KEY = "session.biometric"
        const val EXPIRES_KEY = "session.expires"
    }
}
