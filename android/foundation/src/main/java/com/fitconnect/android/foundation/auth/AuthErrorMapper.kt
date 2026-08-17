package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult

object AuthErrorMapper {
    fun err(kind: AppError.AuthKind): AppResult.Err =
        AppResult.Err(AppError.Auth(kind))

    /**
     * Maps vendor error codes without retaining the original throwable
     * (tokens / stack traces must not reach logs or UI).
     */
    fun fromCode(code: String?): AppError.AuthKind {
        val normalized = code?.lowercase()?.replace("-", "_").orEmpty()
        return when {
            normalized.contains("invalid_email") -> AppError.AuthKind.INVALID_EMAIL
            normalized.contains("wrong_password") ||
                normalized.contains("invalid_credential") ||
                normalized.contains("user_not_found") ||
                normalized.contains("invalid_login") -> AppError.AuthKind.INVALID_CREDENTIALS
            normalized.contains("email_already") ||
                normalized.contains("email_exists") -> AppError.AuthKind.EMAIL_ALREADY_EXISTS
            normalized.contains("weak_password") -> AppError.AuthKind.WEAK_PASSWORD
            normalized.contains("user_disabled") ||
                normalized.contains("account_disabled") -> AppError.AuthKind.ACCOUNT_DISABLED
            normalized.contains("too_many_requests") -> AppError.AuthKind.TOO_MANY_REQUESTS
            normalized.contains("network") -> AppError.AuthKind.NETWORK_ERROR
            normalized.contains("account_exists_with_different") ||
                normalized.contains("credential_already_in_use") ->
                AppError.AuthKind.ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL
            normalized.contains("operation_not_allowed") -> AppError.AuthKind.PROVIDER_UNAVAILABLE
            normalized.contains("user_token_expired") ||
                normalized.contains("invalid_user_token") -> AppError.AuthKind.SESSION_EXPIRED
            normalized.contains("cancelled") || normalized.contains("canceled") ->
                AppError.AuthKind.CANCELLED
            normalized.contains("offline") || normalized.contains("connection") ->
                AppError.AuthKind.CONNECTION_REQUIRED
            else -> AppError.AuthKind.UNKNOWN_AUTH_ERROR
        }
    }
}
