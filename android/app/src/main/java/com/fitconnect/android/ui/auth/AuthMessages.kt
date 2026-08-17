package com.fitconnect.android.ui.auth

import com.fitconnect.android.R
import com.fitconnect.android.foundation.common.AppError

object AuthMessages {
    fun title(kind: AppError.AuthKind): Int = when (kind) {
        AppError.AuthKind.INVALID_CREDENTIALS -> R.string.auth_err_invalid_credentials
        AppError.AuthKind.INVALID_EMAIL -> R.string.auth_err_invalid_email
        AppError.AuthKind.EMAIL_ALREADY_EXISTS -> R.string.auth_err_email_exists
        AppError.AuthKind.WEAK_PASSWORD -> R.string.auth_err_weak_password
        AppError.AuthKind.PASSWORD_MISMATCH -> R.string.auth_err_password_mismatch
        AppError.AuthKind.NETWORK_ERROR -> R.string.auth_err_network
        AppError.AuthKind.CONNECTION_REQUIRED -> R.string.auth_err_connection
        AppError.AuthKind.ACCOUNT_DISABLED -> R.string.auth_err_disabled
        AppError.AuthKind.TOO_MANY_REQUESTS -> R.string.auth_err_too_many
        AppError.AuthKind.EMAIL_NOT_VERIFIED -> R.string.auth_err_not_verified
        AppError.AuthKind.CANCELLED -> R.string.auth_err_cancelled
        AppError.AuthKind.PROVIDER_UNAVAILABLE -> R.string.auth_err_provider
        AppError.AuthKind.ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL -> R.string.auth_err_exists_other
        AppError.AuthKind.SESSION_EXPIRED, AppError.AuthKind.REFRESH_FAILED,
        AppError.AuthKind.UNAUTHENTICATED,
        -> R.string.auth_err_identity
        else -> R.string.auth_err_unknown
    }

    fun phaseLabel(phase: AuthPhase): Int = when (phase) {
        AuthPhase.AUTHENTICATING -> R.string.auth_phase_authenticating
        AuthPhase.VERIFYING -> R.string.auth_phase_verifying
        AuthPhase.SYNCHRONIZING -> R.string.auth_phase_syncing
        AuthPhase.INITIALIZING -> R.string.auth_phase_initializing
        else -> R.string.auth_phase_idle
    }
}
