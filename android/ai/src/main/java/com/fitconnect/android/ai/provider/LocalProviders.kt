package com.fitconnect.android.ai.provider

import com.fitconnect.android.ai.domain.ModelMetadata
import com.fitconnect.android.ai.domain.TokenUsage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

/**
 * Deterministic local provider used for offline mode, tests and demo builds.
 * It NEVER invents metrics — it only reformats grounded facts already present
 * in the request messages (Evidence / Context sections). If facts are missing,
 * it explicitly says so.
 */
class GroundedLocalAiProvider(
    private val modelId: String = "fitconnect-local-grounded-v1",
) : AiProvider {
    override val metadata = ModelMetadata(
        id = modelId,
        provider = "local",
        supportsStreaming = true,
        supportsTools = true,
        supportsStructuredOutput = true,
    )

    override suspend fun generate(request: AiGenerateRequest): AiGenerateResponse {
        val started = System.currentTimeMillis()
        val user = request.messages.lastOrNull { it.role == "user" }?.content.orEmpty()
        val context = request.messages.filter { it.role == "system" }.joinToString("\n") { it.content }
        val text = respond(user, context)
        val usage = TokenUsage(
            promptTokens = estimateTokens(request.messages.joinToString { it.content }),
            completionTokens = estimateTokens(text),
        )
        return AiGenerateResponse(
            text = text,
            structuredJson = null,
            usage = usage,
            modelId = modelId,
            latencyMs = System.currentTimeMillis() - started,
        )
    }

    override fun stream(request: AiGenerateRequest): Flow<AiStreamEvent> = flow {
        val response = generate(request)
        val words = response.text.split(' ')
        val buf = StringBuilder()
        for (word in words) {
            if (buf.isNotEmpty()) buf.append(' ')
            buf.append(word)
            emit(AiStreamEvent(delta = word + " ", done = false))
        }
        emit(AiStreamEvent(delta = null, done = true, usage = response.usage))
    }

    override suspend fun embed(texts: List<String>): List<FloatArray> =
        texts.map { text ->
            FloatArray(8) { i -> ((text.hashCode() + i * 31) % 100) / 100f }
        }

    private fun respond(user: String, context: String): String {
        val lower = user.lowercase()
        if (SAFETY_TRIGGERS.any { lower.contains(it) }) {
            return SAFETY_REFUSAL
        }
        val evidenceLines = context.lineSequence()
            .filter { it.startsWith("EVIDENCE:") || it.startsWith("- ") }
            .take(12)
            .toList()
        if (evidenceLines.isEmpty() && !context.contains("AVAILABLE:")) {
            return "I don't have enough information in the authorized FitConnect context to answer that. " +
                "Please sync telemetry or ensure the relevant program/session data is available."
        }
        val facts = evidenceLines.joinToString("\n").ifBlank {
            context.lineSequence().filter { it.startsWith("AVAILABLE:") }.joinToString("\n")
        }
        return buildString {
            append("Based only on authorized FitConnect data:\n")
            append(facts.ifBlank { "No concrete evidence lines were provided." })
            append("\n\n")
            when {
                lower.contains("readiness") ->
                    append("Readiness values come from the Telemetry/Athlete engines — AI does not recompute them.")
                lower.contains("program") ->
                    append("Program status is reported as provided by the Programs Engine.")
                lower.contains("coach") && lower.contains("message") ->
                    append("Draft only — you must review and send any message yourself.")
                else ->
                    append("This is decision support, not a medical or coaching order. You remain in control.")
            }
            append("\nLimitations: AI never invents missing metrics. Unavailable fields were omitted.")
        }
    }

    private fun estimateTokens(text: String): Int = (text.length / 4).coerceAtLeast(1)

    companion object {
        private val SAFETY_TRIGGERS = listOf(
            "diagnos", "prescribe", "medication", "emergency", "chest pain",
            "suicide", "self-harm", "anabolic", "steroid dose",
        )
        const val SAFETY_REFUSAL =
            "I can't provide medical diagnosis, treatment, emergency guidance or medication advice. " +
                "If this is an emergency, contact local emergency services. " +
                "For training decisions, consult your coach or a qualified clinician."
    }
}

/** Explicit offline/unavailable provider — surfaces UNAVAILABLE cleanly. */
class UnavailableAiProvider : AiProvider {
    override val metadata = ModelMetadata(
        id = "unavailable",
        provider = "none",
        supportsStreaming = false,
        supportsTools = false,
        supportsStructuredOutput = false,
    )

    override suspend fun generate(request: AiGenerateRequest): AiGenerateResponse {
        throw AiProviderException(AiProviderFailure.UNAVAILABLE, "AI is offline or disabled")
    }

    override fun stream(request: AiGenerateRequest): Flow<AiStreamEvent> = flow {
        emit(AiStreamEvent(delta = null, done = true, error = AiProviderFailure.UNAVAILABLE))
    }

    override suspend fun embed(texts: List<String>): List<FloatArray> {
        throw AiProviderException(AiProviderFailure.UNAVAILABLE, "Embeddings unavailable")
    }
}
