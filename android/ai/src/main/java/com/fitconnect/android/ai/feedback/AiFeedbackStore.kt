package com.fitconnect.android.ai.feedback

import com.fitconnect.android.ai.domain.FeedbackLabel

data class AiFeedbackEvent(
    val targetId: String,
    val userId: String,
    val label: FeedbackLabel,
    val note: String?,
    val atEpochMs: Long,
)

/** Feedback feeds evaluation — never auto-retrains models. */
class AiFeedbackStore(private val nowProvider: () -> Long = System::currentTimeMillis) {
    private val events = mutableListOf<AiFeedbackEvent>()

    @Synchronized
    fun submit(targetId: String, userId: String, label: FeedbackLabel, note: String? = null) {
        events += AiFeedbackEvent(targetId, userId, label, note, nowProvider())
    }

    @Synchronized
    fun all(): List<AiFeedbackEvent> = events.toList()

    @Synchronized
    fun counts(): Map<FeedbackLabel, Int> = events.groupingBy { it.label }.eachCount()
}
