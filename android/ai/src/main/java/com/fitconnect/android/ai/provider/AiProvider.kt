package com.fitconnect.android.ai.provider

import com.fitconnect.android.ai.domain.ModelMetadata
import com.fitconnect.android.ai.domain.TokenUsage
import kotlinx.coroutines.flow.Flow

enum class AiProviderFailure {
    TIMEOUT,
    RATE_LIMITED,
    UNAVAILABLE,
    INVALID_RESPONSE,
    AUTH,
    BUDGET_EXCEEDED,
    CANCELLED,
    UNKNOWN,
}

class AiProviderException(val failure: AiProviderFailure, message: String) : Exception(message)

data class AiMessage(
    val role: String, // system | user | assistant | tool
    val content: String,
)

data class AiGenerateRequest(
    val messages: List<AiMessage>,
    val temperature: Double = 0.2,
    val maxTokens: Int = 1024,
    val tools: List<String> = emptyList(),
    val structuredSchemaName: String? = null,
    val timeoutMs: Long = 30_000,
)

data class AiGenerateResponse(
    val text: String,
    val structuredJson: String? = null,
    val toolCalls: List<AiToolCall> = emptyList(),
    val usage: TokenUsage,
    val modelId: String,
    val latencyMs: Long,
)

data class AiToolCall(
    val id: String,
    val name: String,
    val argumentsJson: String,
)

data class AiStreamEvent(
    val delta: String?,
    val done: Boolean,
    val usage: TokenUsage? = null,
    val error: AiProviderFailure? = null,
)

/**
 * Provider-independent AI contract. Application code never imports a vendor SDK
 * outside an adapter implementing this interface.
 */
interface AiProvider {
    val metadata: ModelMetadata
    suspend fun generate(request: AiGenerateRequest): AiGenerateResponse
    fun stream(request: AiGenerateRequest): Flow<AiStreamEvent>
    suspend fun embed(texts: List<String>): List<FloatArray>
}

/**
 * Chains providers: primary → fallbacks on UNAVAILABLE / TIMEOUT / RATE_LIMITED.
 */
class FallbackAiProvider(
    private val primary: AiProvider,
    private val fallbacks: List<AiProvider>,
) : AiProvider {
    override val metadata: ModelMetadata = primary.metadata

    override suspend fun generate(request: AiGenerateRequest): AiGenerateResponse {
        val chain = listOf(primary) + fallbacks
        var last: Exception? = null
        for (provider in chain) {
            try {
                return provider.generate(request)
            } catch (e: AiProviderException) {
                last = e
                if (e.failure !in RETRYABLE) throw e
            }
        }
        throw last ?: AiProviderException(AiProviderFailure.UNAVAILABLE, "No AI provider available")
    }

    override fun stream(request: AiGenerateRequest): Flow<AiStreamEvent> = primary.stream(request)

    override suspend fun embed(texts: List<String>): List<FloatArray> = primary.embed(texts)

    private companion object {
        val RETRYABLE = setOf(
            AiProviderFailure.TIMEOUT,
            AiProviderFailure.RATE_LIMITED,
            AiProviderFailure.UNAVAILABLE,
        )
    }
}
