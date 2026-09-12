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
    /**
     * Legacy mirror of [activeMode] for older call sites.
     * Prefer [activeMode] + [capabilities] for new code.
     */
    val role: UserRole,
    val tokens: AuthTokens?,
    val isAnonymous: Boolean,
    val biometricUnlockEnabled: Boolean,
    /** True only for debug LOCAL_DEMO sessions — never a production identity. */
    val isLocalDemo: Boolean = false,
    /** Server-owned capabilities cached for UX (not an authorization source of truth). */
    val capabilities: Set<UserRole> = emptySet(),
    /** Which OS shell is active. Must be subset of [capabilities] (or ADMIN). */
    val activeMode: UserRole = UserRole.ATHLETE,
)

/**
 * Durable session material. Access/refresh tokens never leave SecureStore
 * except through this port.
 */
interface SessionStore {
    suspend fun snapshot(): SessionSnapshot
    suspend fun isLoggedIn(): Boolean
    suspend fun role(): UserRole
    suspend fun activeMode(): UserRole
    suspend fun capabilities(): Set<UserRole>
    suspend fun accessToken(): String?
    suspend fun refreshToken(): String?
    suspend fun save(snapshot: SessionSnapshot): AppResult<Unit>
    suspend fun updateTokens(tokens: AuthTokens): AppResult<Unit>
    suspend fun setActiveMode(mode: UserRole): AppResult<SessionSnapshot>
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
        val caps = parseCapabilities(read(CAPABILITIES_KEY), role)
        val active = read(ACTIVE_MODE_KEY)?.let { runCatching { UserRole.valueOf(it) }.getOrNull() }
            ?: role
        val anonymous = read(ANON_KEY) == "1"
        val biometric = read(BIOMETRIC_KEY) == "1"
        val localDemo = read(LOCAL_DEMO_KEY) == "1"
        val expires = read(EXPIRES_KEY)?.toLongOrNull()
        val tokens = access?.let {
            AuthTokens(accessToken = it, refreshToken = refresh, expiresAtEpochMs = expires)
        }
        val effectiveRole = if (access == null && !anonymous) UserRole.GUEST else role
        return SessionSnapshot(
            userId = userId,
            role = effectiveRole,
            tokens = tokens,
            isAnonymous = anonymous,
            biometricUnlockEnabled = biometric,
            isLocalDemo = localDemo,
            capabilities = if (effectiveRole == UserRole.GUEST) emptySet() else caps,
            activeMode = when {
                effectiveRole == UserRole.GUEST -> UserRole.GUEST
                anonymous || effectiveRole == UserRole.ANONYMOUS -> UserRole.ANONYMOUS
                active == UserRole.COACH && caps.contains(UserRole.COACH) -> UserRole.COACH
                active == UserRole.ATHLETE && caps.contains(UserRole.ATHLETE) -> UserRole.ATHLETE
                caps.contains(UserRole.COACH) && !caps.contains(UserRole.ATHLETE) -> UserRole.COACH
                caps.contains(UserRole.ATHLETE) -> UserRole.ATHLETE
                else -> effectiveRole
            },
        )
    }

    override suspend fun isLoggedIn(): Boolean {
        val snap = snapshot()
        return snap.tokens?.accessToken != null || snap.isAnonymous
    }

    override suspend fun role(): UserRole = snapshot().role

    override suspend fun activeMode(): UserRole = snapshot().activeMode

    override suspend fun capabilities(): Set<UserRole> = snapshot().capabilities

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
        val caps = if (snapshot.capabilities.isEmpty()) {
            setOf(snapshot.activeMode).filter { it == UserRole.ATHLETE || it == UserRole.COACH }.toSet()
                .ifEmpty { setOf(snapshot.role).filter { it == UserRole.ATHLETE || it == UserRole.COACH }.toSet() }
        } else {
            snapshot.capabilities.filter { it == UserRole.ATHLETE || it == UserRole.COACH }.toSet()
        }
        val mode = when {
            caps.contains(snapshot.activeMode) -> snapshot.activeMode
            caps.contains(UserRole.ATHLETE) -> UserRole.ATHLETE
            caps.contains(UserRole.COACH) -> UserRole.COACH
            else -> snapshot.role
        }
        write(ROLE_KEY, mode.name)?.let { return it }
        write(ACTIVE_MODE_KEY, mode.name)?.let { return it }
        write(CAPABILITIES_KEY, caps.joinToString(",") { it.name })?.let { return it }
        write(ANON_KEY, if (snapshot.isAnonymous) "1" else "0")?.let { return it }
        write(BIOMETRIC_KEY, if (snapshot.biometricUnlockEnabled) "1" else "0")?.let { return it }
        write(LOCAL_DEMO_KEY, if (snapshot.isLocalDemo) "1" else "0")?.let { return it }
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

    override suspend fun setActiveMode(mode: UserRole): AppResult<SessionSnapshot> {
        if (mode != UserRole.ATHLETE && mode != UserRole.COACH) {
            return AppResult.Err(
                com.fitconnect.android.foundation.common.AppError.Auth(
                    com.fitconnect.android.foundation.common.AppError.AuthKind.FORBIDDEN,
                ),
            )
        }
        val snap = snapshot()
        if (!snap.capabilities.contains(mode) && snap.role != UserRole.ADMIN) {
            return AppResult.Err(
                com.fitconnect.android.foundation.common.AppError.Auth(
                    com.fitconnect.android.foundation.common.AppError.AuthKind.FORBIDDEN,
                ),
            )
        }
        val next = snap.copy(activeMode = mode, role = mode)
        return when (val saved = save(next)) {
            is AppResult.Err -> saved
            is AppResult.Ok -> AppResult.Ok(next)
        }
    }

    override suspend fun clear(): AppResult<Unit> {
        listOf(
            ACCESS_KEY, REFRESH_KEY, USER_KEY, ROLE_KEY, ANON_KEY, BIOMETRIC_KEY, EXPIRES_KEY,
            LOCAL_DEMO_KEY, CAPABILITIES_KEY, ACTIVE_MODE_KEY,
        ).forEach { secureStore.remove(it) }
        return AppResult.Ok(Unit)
    }

    private fun parseCapabilities(raw: String?, fallbackRole: UserRole): Set<UserRole> {
        if (raw.isNullOrBlank()) {
            return when (fallbackRole) {
                UserRole.ATHLETE, UserRole.COACH -> setOf(fallbackRole)
                UserRole.ADMIN -> setOf(UserRole.ATHLETE, UserRole.COACH)
                else -> emptySet()
            }
        }
        return raw.split(",")
            .mapNotNull { runCatching { UserRole.valueOf(it.trim()) }.getOrNull() }
            .filter { it == UserRole.ATHLETE || it == UserRole.COACH }
            .toSet()
            .ifEmpty {
                when (fallbackRole) {
                    UserRole.ATHLETE, UserRole.COACH -> setOf(fallbackRole)
                    else -> emptySet()
                }
            }
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
        const val LOCAL_DEMO_KEY = "session.local_demo"
        const val CAPABILITIES_KEY = "session.capabilities"
        const val ACTIVE_MODE_KEY = "session.active_mode"
    }
}
