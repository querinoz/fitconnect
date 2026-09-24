package com.fitconnect.android.sports.guided.share

/**
 * FitConnect-native workout share summary.
 * Default privacy is [SharePrivacy.PRIVATE] — nothing leaves the device until the user confirms.
 */
enum class SharePrivacy {
    PRIVATE,
    SHARED,
}

data class WorkoutShareCard(
    val sessionId: String,
    val sport: String? = null,
    val durationMs: Long? = null,
    val setsCompleted: Int? = null,
    val volumeKg: Double? = null,
    val personalRecord: Boolean = false,
    val trainingLoad: Double? = null,
    val completedAtEpochMs: Long? = null,
    val readinessScore: Int? = null,
    val privacy: SharePrivacy = SharePrivacy.PRIVATE,
) {
    val isShareable: Boolean get() = privacy == SharePrivacy.SHARED
}

object WorkoutShareCardFactory {
    fun fromGuided(
        sessionId: String,
        sport: String = "STRENGTH",
        durationMs: Long?,
        setsCompleted: Int,
        volumeKg: Double?,
        personalRecord: Boolean = false,
        trainingLoad: Double? = null,
        completedAtEpochMs: Long?,
        readinessScore: Int? = null,
    ): WorkoutShareCard = WorkoutShareCard(
        sessionId = sessionId,
        sport = sport,
        durationMs = durationMs,
        setsCompleted = setsCompleted,
        volumeKg = volumeKg,
        personalRecord = personalRecord,
        trainingLoad = trainingLoad,
        completedAtEpochMs = completedAtEpochMs,
        readinessScore = readinessScore,
        privacy = SharePrivacy.PRIVATE,
    )

    /** User-gated promotion to SHARED — never auto-share. */
    fun confirmShare(card: WorkoutShareCard): WorkoutShareCard =
        card.copy(privacy = SharePrivacy.SHARED)

    fun revokeShare(card: WorkoutShareCard): WorkoutShareCard =
        card.copy(privacy = SharePrivacy.PRIVATE)
}
