package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.identity.IdentityRemote
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.security.AccountIsolationController
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import com.fitconnect.android.foundation.session.SessionStore
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Identity adapter: Firebase UID is canonical. No Firebase types leak from this class.
 */
class FirebaseAuthRepository(
    private val gateway: FirebaseAuthGateway,
    private val sessionStore: SessionStore,
    private val logger: Logger,
    private val isolation: AccountIsolationController? = null,
    private val keyValueStore: KeyValueStore? = null,
    private val connectivity: ConnectivityMonitor? = null,
    private val identityRemote: IdentityRemote? = null,
    private val credentialClearer: (suspend () -> Unit)? = null,
) : AuthRepository, TokenRefresher {

    private val authState = MutableStateFlow<AuthUser?>(null)

    override suspend fun signIn(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> {
        if (!gateway.isAvailable) {
            return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        }
        return when (provider) {
            AuthProviderKind.EMAIL_PASSWORD -> {
                AuthValidators.email(credentials.email)?.let { return AuthErrorMapper.err(it) }
                AuthValidators.password(credentials.password)?.let { return AuthErrorMapper.err(it) }
                networkGate()?.let { return it }
                persistIdentity(gateway.signInEmail(credentials.email!!.trim(), credentials.password!!))
            }
            AuthProviderKind.GOOGLE -> {
                networkGate()?.let { return it }
                val host = credentials.federated
                    ?: return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
                when (val token = host.googleIdToken()) {
                    is AppResult.Ok -> persistIdentity(gateway.signInGoogle(token.value))
                    is AppResult.Err -> token
                }
            }
            AuthProviderKind.APPLE -> {
                networkGate()?.let { return it }
                val host = credentials.federated
                    ?: return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
                persistIdentity(host.appleSignIn())
            }
            AuthProviderKind.GUEST -> {
                isolation?.wipeForLogout()
                gateway.signOut()
                sessionStore.clear()
                authState.value = null
                AppResult.Ok(AuthUser(id = "guest", email = null, role = UserRole.GUEST))
            }
            AuthProviderKind.MAGIC_LINK ->
                AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
            AuthProviderKind.ANONYMOUS, AuthProviderKind.BIOMETRIC_UNLOCK ->
                AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        }
    }

    override suspend fun signUp(
        email: String,
        password: String,
        confirmPassword: String?,
    ): AppResult<AuthUser> {
        AuthValidators.email(email)?.let { return AuthErrorMapper.err(it) }
        AuthValidators.password(password)?.let { return AuthErrorMapper.err(it) }
        AuthValidators.passwordsMatch(password, confirmPassword)?.let { return AuthErrorMapper.err(it) }
        if (!gateway.isAvailable) return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        networkGate()?.let { return it }
        return persistIdentity(gateway.signUpEmail(email.trim(), password), fromSignUp = true)
    }

    override suspend fun sendMagicLink(email: String): AppResult<Unit> = sendPasswordReset(email)

    override suspend fun sendPasswordReset(email: String): AppResult<Unit> {
        AuthValidators.email(email)?.let { return AuthErrorMapper.err(it) }
        if (!gateway.isAvailable) return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        networkGate()?.let { return it }
        return gateway.sendPasswordReset(email.trim())
    }

    override suspend fun sendEmailVerification(): AppResult<Unit> {
        if (!gateway.isAvailable) return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        networkGate()?.let { return it }
        return gateway.sendEmailVerification()
    }

    override suspend fun signInAnonymously(): AppResult<AuthUser> =
        AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)

    override suspend fun continueAsGuest(): AppResult<Unit> {
        isolation?.wipeForLogout()
        gateway.signOut()
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
        if (gateway.isAvailable) {
            when (val current = gateway.current()) {
                is AppResult.Ok -> {
                    val identity = current.value
                    if (identity != null) {
                        persistIdentity(AppResult.Ok(identity))
                        return AppResult.Ok(sessionStore.snapshot())
                    }
                }
                is AppResult.Err -> logger.w("FirebaseAuth", "restore current failed")
            }
        }
        val snap = sessionStore.snapshot()
        return if (snap.tokens != null && !snap.isLocalDemo) AppResult.Ok(snap)
        else AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
    }

    override suspend fun refreshSession(): AppResult<AuthTokens> = refresh()

    override suspend fun refresh(): AppResult<AuthTokens> {
        if (!gateway.isAvailable) return AuthErrorMapper.err(AppError.AuthKind.REFRESH_FAILED)
        return when (val token = gateway.getIdToken(forceRefresh = true)) {
            is AppResult.Ok -> {
                val tokens = AuthTokens(
                    accessToken = token.value,
                    refreshToken = sessionStore.refreshToken(),
                    expiresAtEpochMs = System.currentTimeMillis() + 3_500_000,
                )
                sessionStore.updateTokens(tokens)
                AppResult.Ok(tokens)
            }
            is AppResult.Err -> AuthErrorMapper.err(AppError.AuthKind.REFRESH_FAILED)
        }
    }

    override suspend fun logout(): AppResult<Unit> {
        isolation?.wipeForLogout()?.let { if (it is AppResult.Err) return it }
        gateway.signOut()
        runCatching { credentialClearer?.invoke() }
        authState.value = null
        return sessionStore.clear()
    }

    override suspend fun deleteSession(): AppResult<Unit> = logout()

    override suspend fun deleteAccount(): AppResult<Unit> {
        val remote = identityRemote
            ?: return AuthErrorMapper.err(AppError.AuthKind.FORBIDDEN)
        return when (val result = remote.deleteAccount()) {
            is AppResult.Err -> result
            is AppResult.Ok -> logout()
        }
    }

    override suspend fun enableBiometricUnlock(enabled: Boolean): AppResult<Unit> {
        val snap = sessionStore.snapshot()
        return sessionStore.save(snap.copy(biometricUnlockEnabled = enabled))
    }

    override suspend fun unlockWithBiometric(): AppResult<AuthUser> {
        val snap = sessionStore.snapshot()
        if (!snap.biometricUnlockEnabled || snap.tokens == null) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return currentUser()
    }

    override suspend fun currentUser(): AppResult<AuthUser> {
        val snap = sessionStore.snapshot()
        if (snap.userId == null || snap.tokens == null) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return AppResult.Ok(snap.toAuthUser())
    }

    override suspend fun reloadUser(): AppResult<AuthUser> {
        if (!gateway.isAvailable) return currentUser()
        return persistIdentity(gateway.reload())
    }

    override fun observeAuthState(): Flow<AuthUser?> = authState.asStateFlow()

    override suspend fun linkProvider(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> {
        if (!gateway.isAvailable) return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        networkGate()?.let { return it }
        val result = when (provider) {
            AuthProviderKind.EMAIL_PASSWORD -> {
                AuthValidators.email(credentials.email)?.let { return AuthErrorMapper.err(it) }
                AuthValidators.password(credentials.password)?.let { return AuthErrorMapper.err(it) }
                gateway.linkEmail(credentials.email!!.trim(), credentials.password!!)
            }
            AuthProviderKind.GOOGLE -> {
                val host = credentials.federated
                    ?: return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
                when (val token = host.googleIdToken()) {
                    is AppResult.Ok -> gateway.linkGoogle(token.value)
                    is AppResult.Err -> return token
                }
            }
            AuthProviderKind.APPLE -> {
                val host = credentials.federated
                    ?: return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
                host.appleSignIn()
            }
            else -> return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        }
        return persistIdentity(result)
    }

    override suspend fun unlinkProvider(provider: AuthProviderKind): AppResult<AuthUser> {
        if (!gateway.isAvailable) return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        return persistIdentity(gateway.unlink(provider))
    }

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
        val uid = snap.userId ?: return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        when (val remote = identityRemote?.setRole(role)) {
            is AppResult.Err -> logger.w("FirebaseAuth", "role persist failed")
            is AppResult.Ok -> Unit
            null -> Unit
        }
        sessionStore.save(snap.copy(role = role))
        keyValueStore?.set(PreferenceKeys.identityRoleSelected(uid), "1")
        return currentUser()
    }

    private suspend fun persistIdentity(
        result: AppResult<IdentitySnapshot>,
        fromSignUp: Boolean = false,
    ): AppResult<AuthUser> = when (result) {
        is AppResult.Err -> result
        is AppResult.Ok -> {
            val identity = result.value
            isolation?.wipeForAccountSwitch(identity.uid)
            val existingRole = sessionStore.snapshot().takeIf { it.userId == identity.uid }?.role
            val selected = keyValueStore?.get(PreferenceKeys.identityRoleSelected(identity.uid))
            var needsRole = selected != "1"
            if (needsRole && selected == null) {
                keyValueStore?.set(PreferenceKeys.identityRoleSelected(identity.uid), "0")
            }
            var role = existingRole?.takeIf { it == UserRole.ATHLETE || it == UserRole.COACH }
                ?: UserRole.ATHLETE
            val tokens = AuthTokens(
                accessToken = identity.idToken,
                refreshToken = identity.refreshToken,
                expiresAtEpochMs = identity.expiresAtEpochMs
                    ?: System.currentTimeMillis() + 3_500_000,
            )
            sessionStore.save(
                SessionSnapshot(
                    userId = identity.uid,
                    role = role,
                    tokens = tokens,
                    isAnonymous = false,
                    biometricUnlockEnabled = false,
                    isLocalDemo = false,
                ),
            )
            keyValueStore?.set(
                PreferenceKeys.identityProviders(identity.uid),
                identity.providers.joinToString(",") { it.name },
            )
            when (val remote = identityRemote?.bootstrap(identity.displayName, identity.email, identity.photoUrl)) {
                is AppResult.Ok -> {
                    remote.value.role?.takeIf { it == UserRole.ATHLETE || it == UserRole.COACH }?.let {
                        role = it
                        needsRole = false
                        keyValueStore?.set(PreferenceKeys.identityRoleSelected(identity.uid), "1")
                    }
                    sessionStore.save(
                        sessionStore.snapshot().copy(role = role),
                    )
                }
                is AppResult.Err -> logger.w("FirebaseAuth", "profile bootstrap failed")
                null -> Unit
            }
            val user = AuthUser(
                id = identity.uid,
                email = identity.email,
                role = role,
                emailVerified = identity.emailVerified,
                providers = identity.providers,
                isLocalDemo = false,
                needsRoleSelection = needsRole,
            )
            authState.value = user
            if (fromSignUp) logger.i("FirebaseAuth", "account created uid_len=${identity.uid.length}")
            AppResult.Ok(user)
        }
    }

    private suspend fun SessionSnapshot.toAuthUser(): AuthUser {
        val selected = userId?.let { keyValueStore?.get(PreferenceKeys.identityRoleSelected(it)) }
        val stored = userId?.let { keyValueStore?.get(PreferenceKeys.identityProviders(it)) }.orEmpty()
        return AuthUser(
            id = userId ?: "unknown",
            email = null,
            role = role,
            providers = parseProviders(stored),
            isLocalDemo = false,
            needsRoleSelection = selected == "0",
        )
    }

    private fun networkGate(): AppResult.Err? {
        if (connectivity != null && !connectivity.online.value) {
            return AuthErrorMapper.err(AppError.AuthKind.CONNECTION_REQUIRED)
        }
        return null
    }
}
