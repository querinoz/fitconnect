package com.fitconnect.android.ai.streaming

import com.fitconnect.android.ai.provider.AiGenerateRequest
import com.fitconnect.android.ai.provider.AiProvider
import com.fitconnect.android.ai.provider.AiStreamEvent
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onStart

/** Streaming UX helper — start / partial / complete / error without UI flicker. */
class AiStreamController(private val provider: AiProvider) {
    fun stream(request: AiGenerateRequest): Flow<AiStreamEvent> =
        provider.stream(request)
            .onStart { emit(AiStreamEvent(delta = "", done = false)) }
            .catch { emit(AiStreamEvent(delta = null, done = true, error = com.fitconnect.android.ai.provider.AiProviderFailure.UNKNOWN)) }
}
