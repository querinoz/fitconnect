package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

/**
 * Routes LOCAL_DEMO personas to [local] and live credentials to [live].
 * Google/Apple never use the local adapter (no fake OAuth).
 */
class CompositeAuthRepository(
    private val local: AuthRepository,
    private val live: AuthRepository?,
    private val allowLocalAuth: Boolean,
    private val connectivity: ConnectivityMonitor? = null,
    private val logger: Logger? = null,
) : AuthRepository, TokenRefresher {

    override suspend fun signIn(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> {
        if (provider == AuthProviderKind.GOOGLE || provider == AuthProviderKind.APPLE) {
            networkGate()?.let { return it }
            return liveOrUnavailable().signIn(provider, credentials)
        }
        val adapter = adapterFor(provider, credentials.email)
            ?: return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        if (adapter === live) networkGate()?.let { return it }
        return adapter.signIn(provider, credentials)
    }

    override suspend fun signUp(
        email: String,
        password: String,
        confirmPassword: String?,
    ): AppResult<AuthUser> {
        AuthValidators.email(email)?.let { return AuthErrorMapper.err(it) }
        AuthValidators.password(password)?.let { return AuthErrorMapper.err(it) }
        AuthValidators.passwordsMatch(password, confirmPassword)?.let { return AuthErrorMapper.err(it) }
        val adapter = adapterFor(AuthProviderKind.EMAIL_PASSWORD, email)
            ?: return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        if (adapter === live) networkGate()?.let { return it }
        return adapter.signUp(email, password, confirmPassword)
    }

    override suspend fun sendMagicLink(email: String): AppResult<Unit> =
        sendPasswordReset(email)

    override suspend fun sendPasswordReset(email: String): AppResult<Unit> {
        AuthValidators.email(email)?.let { return AuthErrorMapper.err(it) }
        val adapter = adapterFor(AuthProviderKind.EMAIL_PASSWORD, email)
            ?: return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        if (adapter === live) networkGate()?.let { return it }
        return adapter.sendPasswordReset(email)
    }

    override suspend fun sendEmailVerification(): AppResult<Unit> {
        networkGate()?.let { return it }
        return (live ?: local.takeIf { allowLocalAuth })
            ?.sendEmailVerification()
            ?: AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
    }

    override suspend fun signInAnonymously(): AppResult<AuthUser> {
        if (!allowLocalAuth) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        return local.signInAnonymously()
    }

    override suspend fun continueAsGuest(): AppResult<Unit> = local.continueAsGuest()

    override suspend fun restoreSession(): AppResult<SessionSnapshot> {
        val liveSnap = live?.restoreSession()
        if (liveSnap is AppResult.Ok) return liveSnap
        if (allowLocalAuth) {
            val localSnap = local.restoreSession()
            if (localSnap is AppResult.Ok) return localSnap
        }
        return liveSnap ?: AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
    }

    override suspend fun refreshSession(): AppResult<AuthTokens> = refresh()

    override suspend fun refresh(): AppResult<AuthTokens> {
        val liveRefresh = (live as? TokenRefresher)?.refresh()
        if (liveRefresh is AppResult.Ok) return liveRefresh
        if (allowLocalAuth) {
            val localRefresh = (local as? TokenRefresher)?.refresh()
            if (localRefresh is AppResult.Ok) return localRefresh
        }
        return liveRefresh ?: AuthErrorMapper.err(AppError.AuthKind.REFRESH_FAILED)
    }

    override suspend fun logout(): AppResult<Unit> {
        live?.logout()
        return local.logout()
    }

    override suspend fun deleteSession(): AppResult<Unit> = logout()

    override suspend fun deleteAccount(): AppResult<Unit> {
        val liveRepo = live ?: return AuthErrorMapper.err(AppError.AuthKind.FORBIDDEN)
        return liveRepo.deleteAccount()
    }

    override suspend fun enableBiometricUnlock(enabled: Boolean): AppResult<Unit> =
        active().enableBiometricUnlock(enabled)

    override suspend fun unlockWithBiometric(): AppResult<AuthUser> =
        active().unlockWithBiometric()

    override suspend fun currentUser(): AppResult<AuthUser> {
        val liveUser = live?.currentUser()
        if (liveUser is AppResult.Ok) return liveUser
        if (allowLocalAuth) return local.currentUser()
        return liveUser ?: AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
    }

    override suspend fun reloadUser(): AppResult<AuthUser> {
        live?.reloadUser()?.let { if (it is AppResult.Ok) return it }
        return currentUser()
    }

    override fun observeAuthState(): Flow<AuthUser?> = flow {
        emit(currentUser().getOrNull())
        live?.observeAuthState()?.collect { emit(it) }
    }

    override suspend fun linkProvider(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> {
        networkGate()?.let { return it }
        return liveOrUnavailable().linkProvider(provider, credentials)
    }

    override suspend fun unlinkProvider(provider: AuthProviderKind): AppResult<AuthUser> {
        networkGate()?.let { return it }
        return liveOrUnavailable().unlinkProvider(provider)
    }

    override suspend fun linkedProviders(): AppResult<LinkedProviders> {
        val liveLinked = live?.linkedProviders()
        if (liveLinked is AppResult.Ok && (liveLinked.value.email || liveLinked.value.google || liveLinked.value.apple)) {
            return liveLinked
        }
        return local.linkedProviders()
    }

    override suspend fun assignRole(role: UserRole): AppResult<AuthUser> {
        val liveAssigned = live?.assignRole(role)
        if (liveAssigned is AppResult.Ok) return liveAssigned
        if (allowLocalAuth) return local.assignRole(role)
        return liveAssigned ?: AuthErrorMapper.err(AppError.AuthKind.FORBIDDEN)
    }

    private fun adapterFor(provider: AuthProviderKind, email: String?): AuthRepository? {
        if (provider == AuthProviderKind.GUEST ||
            provider == AuthProviderKind.ANONYMOUS ||
            provider == AuthProviderKind.BIOMETRIC_UNLOCK
        ) {
            return if (allowLocalAuth) local else live
        }
        if (allowLocalAuth && DemoPersona.fromEmail(email.orEmpty()) != null) {
            logger?.i("CompositeAuth", "routing LOCAL_DEMO persona")
            return local
        }
        return live ?: local.takeIf { allowLocalAuth }
    }

    private fun liveOrUnavailable(): AuthRepository =
        live ?: object : AuthRepository by local {
            override suspend fun signIn(
                provider: AuthProviderKind,
                credentials: AuthCredentials,
            ): AppResult<AuthUser> = AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        }

    private fun active(): AuthRepository = live ?: local

    private fun networkGate(): AppResult.Err? {
        if (connectivity != null && !connectivity.online.value) {
            return AuthErrorMapper.err(AppError.AuthKind.CONNECTION_REQUIRED)
        }
        return null
    }
}
