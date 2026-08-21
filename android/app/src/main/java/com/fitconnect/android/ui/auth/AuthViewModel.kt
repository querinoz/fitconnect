package com.fitconnect.android.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.fitconnect.android.foundation.analytics.Analytics
import com.fitconnect.android.foundation.auth.AuthCredentials
import com.fitconnect.android.foundation.auth.AuthProviderKind
import com.fitconnect.android.foundation.auth.AuthRepository
import com.fitconnect.android.foundation.auth.AuthUser
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.auth.FederatedAuthHost
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.di.AppContainer
import com.fitconnect.android.foundation.error.ErrorDomain
import com.fitconnect.android.foundation.error.ErrorPipeline
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AuthPhase {
    IDLE,
    AUTHENTICATING,
    VERIFYING,
    SYNCHRONIZING,
    INITIALIZING,
    SUCCESS,
    ERROR,
    CANCELLED,
}

enum class AuthFormMode {
    PROVIDERS,
    EMAIL_SIGN_IN,
    EMAIL_REGISTER,
    FORGOT,
    VERIFY_EMAIL,
}

data class AuthUiState(
    val phase: AuthPhase = AuthPhase.IDLE,
    val mode: AuthFormMode = AuthFormMode.PROVIDERS,
    val errorKind: AppError.AuthKind? = null,
    val status: String? = null,
    val pendingEmail: String? = null,
    val signedInUser: AuthUser? = null,
)

class AuthViewModel(
    private val auth: AuthRepository,
    private val analytics: Analytics,
    private val errorPipeline: ErrorPipeline,
    private val notifications: com.fitconnect.android.foundation.notifications.NotificationGateway? = null,
) : ViewModel() {

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    fun setMode(mode: AuthFormMode) {
        _state.value = _state.value.copy(mode = mode, errorKind = null, status = null)
    }

    fun clearError() {
        _state.value = _state.value.copy(errorKind = null, phase = AuthPhase.IDLE)
    }

    fun continueWithGoogle(host: FederatedAuthHost) {
        launchProvider(AuthProviderKind.GOOGLE, AuthCredentials(federated = host))
    }

    fun continueWithApple(host: FederatedAuthHost) {
        launchProvider(AuthProviderKind.APPLE, AuthCredentials(federated = host))
    }

    fun signInEmail(email: String, password: String) {
        launchProvider(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = email, password = password),
        )
    }

    fun register(email: String, password: String, confirm: String) {
        viewModelScope.launch {
            begin(AuthPhase.AUTHENTICATING)
            when (val result = auth.signUp(email, password, confirm)) {
                is AppResult.Ok -> complete(result.value, fromEmail = true)
                is AppResult.Err -> fail(result.error)
            }
        }
    }

    fun sendPasswordReset(email: String) {
        viewModelScope.launch {
            begin(AuthPhase.AUTHENTICATING)
            when (val result = auth.sendPasswordReset(email)) {
                is AppResult.Ok -> _state.value = _state.value.copy(
                    phase = AuthPhase.IDLE,
                    status = "RESET_QUEUED",
                    errorKind = null,
                )
                is AppResult.Err -> fail(result.error)
            }
        }
    }

    fun resendVerification() {
        viewModelScope.launch {
            begin(AuthPhase.VERIFYING)
            when (val result = auth.sendEmailVerification()) {
                is AppResult.Ok -> _state.value = _state.value.copy(
                    phase = AuthPhase.IDLE,
                    status = "VERIFY_SENT",
                )
                is AppResult.Err -> fail(result.error)
            }
        }
    }

    fun refreshVerification() {
        viewModelScope.launch {
            begin(AuthPhase.VERIFYING)
            when (val result = auth.reloadUser()) {
                is AppResult.Ok -> complete(result.value, fromEmail = true)
                is AppResult.Err -> fail(result.error)
            }
        }
    }

    fun demoPersona(persona: DemoPersona) {
        launchProvider(
            AuthProviderKind.EMAIL_PASSWORD,
            AuthCredentials(email = persona.email, password = DemoPersona.DEMO_PASSWORD),
        )
    }

    private fun launchProvider(provider: AuthProviderKind, credentials: AuthCredentials) {
        viewModelScope.launch {
            begin(AuthPhase.AUTHENTICATING)
            when (val result = auth.signIn(provider, credentials)) {
                is AppResult.Ok -> complete(result.value, fromEmail = provider == AuthProviderKind.EMAIL_PASSWORD)
                is AppResult.Err -> fail(result.error)
            }
        }
    }

    private fun begin(phase: AuthPhase) {
        _state.value = _state.value.copy(phase = phase, errorKind = null, status = null)
    }

    private fun complete(user: AuthUser, fromEmail: Boolean) {
        analytics.identify(user.id)
        if (!user.isLocalDemo) {
            viewModelScope.launch { notifications?.registerForPush() }
        }
        if (fromEmail && !user.isLocalDemo && !user.emailVerified) {
            _state.value = _state.value.copy(
                phase = AuthPhase.IDLE,
                mode = AuthFormMode.VERIFY_EMAIL,
                pendingEmail = user.email,
                signedInUser = user,
                errorKind = AppError.AuthKind.EMAIL_NOT_VERIFIED,
            )
            return
        }
        _state.value = _state.value.copy(
            phase = AuthPhase.SUCCESS,
            signedInUser = user,
            errorKind = null,
        )
    }

    private fun fail(error: com.fitconnect.android.foundation.common.AppError) {
        errorPipeline.report(ErrorDomain.AUTH, error)
        val kind = (error as? AppError.Auth)?.kind ?: AppError.AuthKind.UNKNOWN_AUTH_ERROR
        val phase = if (kind == AppError.AuthKind.CANCELLED) AuthPhase.CANCELLED else AuthPhase.ERROR
        _state.value = _state.value.copy(phase = phase, errorKind = kind)
    }

    companion object {
        fun factory(container: AppContainer): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return AuthViewModel(
                        auth = container.authRepository,
                        analytics = container.analytics,
                        errorPipeline = container.errorPipeline,
                        notifications = container.notifications,
                    ) as T
                }
            }
    }
}
