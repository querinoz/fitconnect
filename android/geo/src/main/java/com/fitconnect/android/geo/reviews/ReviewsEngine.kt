package com.fitconnect.android.geo.reviews

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

enum class ReviewTargetKind { COACH, GYM, PROGRAM, FACILITY }

enum class ModerationState { PENDING, APPROVED, REJECTED, FLAGGED }

data class Review(
    val id: String,
    val targetKind: ReviewTargetKind,
    val targetId: String,
    val authorId: String,
    val rating: Int,
    val comment: String,
    val photoUrls: List<String> = emptyList(),
    val verified: Boolean = false,
    val moderation: ModerationState = ModerationState.PENDING,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
)

interface ReviewsEngine {
    fun forTarget(kind: ReviewTargetKind, targetId: String): List<Review>
    fun average(kind: ReviewTargetKind, targetId: String): Double
    suspend fun submit(review: Review): AppResult<Review>
    suspend fun moderate(id: String, state: ModerationState): AppResult<Review>
}

class DefaultReviewsEngine : ReviewsEngine {
    private val store = ConcurrentHashMap<String, Review>()

    init {
        listOf(
            Review("rv1", ReviewTargetKind.COACH, "p_coach_maya", "a1", 5, "Clear plans, great cues.", verified = true, moderation = ModerationState.APPROVED),
            Review("rv2", ReviewTargetKind.GYM, "p_gym_volt", "a3", 4, "Solid floor space.", photoUrls = listOf("photo://gym1"), moderation = ModerationState.APPROVED),
            Review("rv3", ReviewTargetKind.PROGRAM, "p_program_vo2", "a1", 5, "Progressive and sane.", verified = true, moderation = ModerationState.APPROVED),
        ).forEach { store[it.id] = it }
    }

    override fun forTarget(kind: ReviewTargetKind, targetId: String): List<Review> =
        store.values.filter { it.targetKind == kind && it.targetId == targetId && it.moderation != ModerationState.REJECTED }
            .sortedByDescending { it.createdAtEpochMs }

    override fun average(kind: ReviewTargetKind, targetId: String): Double {
        val ratings = forTarget(kind, targetId).filter { it.moderation == ModerationState.APPROVED }.map { it.rating }
        return if (ratings.isEmpty()) 0.0 else ratings.average()
    }

    override suspend fun submit(review: Review): AppResult<Review> {
        if (review.rating !in 1..5) return AppResult.Err(AppError.Unexpected("Rating must be 1..5"))
        val saved = review.copy(id = review.id.ifBlank { "rv-${UUID.randomUUID().toString().take(8)}" })
        store[saved.id] = saved
        return AppResult.Ok(saved)
    }

    override suspend fun moderate(id: String, state: ModerationState): AppResult<Review> {
        val current = store[id] ?: return AppResult.Err(AppError.Unexpected("Review missing"))
        val next = current.copy(moderation = state)
        store[id] = next
        return AppResult.Ok(next)
    }
}
