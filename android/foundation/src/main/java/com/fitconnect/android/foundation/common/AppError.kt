package com.fitconnect.android.foundation.common

/**
 * Closed error taxonomy for the Android app. Feature code maps throwables
 * into these variants at the boundary — UI never branches on raw exceptions.
 */
sealed class AppError {
    data class Network(
        val kind: NetworkKind,
        val cause: Throwable? = null,
    ) : AppError()

    data class Api(
        val statusCode: Int,
        val code: String? = null,
        val message: String? = null,
    ) : AppError()

    data class Auth(
        val kind: AuthKind,
        val cause: Throwable? = null,
    ) : AppError()

    data class Storage(
        val message: String,
        val cause: Throwable? = null,
    ) : AppError()

    data class Unexpected(
        val message: String,
        val cause: Throwable? = null,
    ) : AppError()

    enum class NetworkKind {
        TIMEOUT,
        OFFLINE,
        DNS,
        TLS,
        UNKNOWN,
    }

    enum class AuthKind {
        UNAUTHENTICATED,
        FORBIDDEN,
        SESSION_EXPIRED,
        REFRESH_FAILED,
        INVALID_CREDENTIALS,
        INVALID_EMAIL,
        EMAIL_ALREADY_EXISTS,
        WEAK_PASSWORD,
        PASSWORD_MISMATCH,
        NETWORK_ERROR,
        CONNECTION_REQUIRED,
        ACCOUNT_DISABLED,
        TOO_MANY_REQUESTS,
        EMAIL_NOT_VERIFIED,
        CANCELLED,
        PROVIDER_UNAVAILABLE,
        ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL,
        UNKNOWN_AUTH_ERROR,
    }
}

/** Result type used across foundation and feature layers. */
sealed class AppResult<out T> {
    data class Ok<T>(val value: T) : AppResult<T>()
    data class Err(val error: AppError) : AppResult<Nothing>()

    inline fun <R> map(transform: (T) -> R): AppResult<R> = when (this) {
        is Ok -> Ok(transform(value))
        is Err -> this
    }

    inline fun getOrElse(default: (AppError) -> @UnsafeVariance T): T = when (this) {
        is Ok -> value
        is Err -> default(error)
    }

    fun getOrNull(): T? = when (this) {
        is Ok -> value
        is Err -> null
    }
}
