package com.fitconnect.android.foundation.error

import com.fitconnect.android.foundation.analytics.Analytics
import com.fitconnect.android.foundation.analytics.AnalyticsEvent
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.Logger

enum class ErrorDomain {
    API,
    VALIDATION,
    AUTH,
    PERMISSION,
    NETWORK,
    CRASH,
    UI,
    STORAGE,
    UNKNOWN,
}

data class PipelineError(
    val domain: ErrorDomain,
    val error: AppError,
    val recoverable: Boolean,
    val userMessageKey: String,
)

/**
 * Single error funnel. UI and repositories report here — never toast ad-hoc
 * exception messages.
 */
interface ErrorPipeline {
    fun report(domain: ErrorDomain, error: AppError, recoverable: Boolean = true): PipelineError
    fun map(error: AppError): PipelineError
}

class DefaultErrorPipeline(
    private val logger: Logger,
    private val analytics: Analytics,
) : ErrorPipeline {
    override fun report(domain: ErrorDomain, error: AppError, recoverable: Boolean): PipelineError {
        val mapped = map(error).copy(domain = domain, recoverable = recoverable)
        logger.e("ErrorPipeline", "${mapped.domain}: ${mapped.userMessageKey}", causeOf(error))
        analytics.track(
            AnalyticsEvent(
                name = "error_pipeline",
                properties = mapOf(
                    "domain" to mapped.domain.name,
                    "recoverable" to mapped.recoverable.toString(),
                ),
            ),
        )
        return mapped
    }

    override fun map(error: AppError): PipelineError = when (error) {
        is AppError.Network -> PipelineError(
            domain = ErrorDomain.NETWORK,
            error = error,
            recoverable = true,
            userMessageKey = "error.network",
        )
        is AppError.Auth -> PipelineError(
            domain = ErrorDomain.AUTH,
            error = error,
            recoverable = error.kind != AppError.AuthKind.FORBIDDEN,
            userMessageKey = "error.auth",
        )
        is AppError.Api -> PipelineError(
            domain = ErrorDomain.API,
            error = error,
            recoverable = error.statusCode in 500..599,
            userMessageKey = "error.api",
        )
        is AppError.Storage -> PipelineError(
            domain = ErrorDomain.STORAGE,
            error = error,
            recoverable = true,
            userMessageKey = "error.storage",
        )
        is AppError.Unexpected -> PipelineError(
            domain = ErrorDomain.UNKNOWN,
            error = error,
            recoverable = false,
            userMessageKey = "error.unexpected",
        )
    }

    private fun causeOf(error: AppError): Throwable? = when (error) {
        is AppError.Network -> error.cause
        is AppError.Auth -> error.cause
        is AppError.Storage -> error.cause
        is AppError.Unexpected -> error.cause
        is AppError.Api -> null
    }
}
