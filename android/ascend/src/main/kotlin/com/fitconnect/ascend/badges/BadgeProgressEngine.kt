package com.fitconnect.ascend.badges

import com.fitconnect.shared.fitness.ProviderId

data class WorkoutContribution(
    val distanceM: Double,
    val providerId: ProviderId,
)

data class BadgeProgress(
    val privateDistanceM: Double,
    val shareableDistanceM: Double,
) {
    val stravaOnly: Boolean get() = privateDistanceM > 0.0 && shareableDistanceM == 0.0
    val emptyCopy: String
        get() = if (stravaOnly) {
            "Your private log is growing. Shared badges only count sessions that are not from a restricted provider."
        } else {
            "No shareable sessions yet."
        }
}

/**
 * Two calculations, not a UI filter: private progress may use any origin;
 * shareable / compared badges only consume shareable sessions.
 */
object BadgeProgressEngine {
    fun privateProgress(workouts: List<WorkoutContribution>): Double =
        workouts.sumOf { it.distanceM }

    fun shareableProgress(workouts: List<WorkoutContribution>): Double =
        workouts.filter { it.providerId.shareable }.sumOf { it.distanceM }

    fun evaluate(workouts: List<WorkoutContribution>): BadgeProgress = BadgeProgress(
        privateDistanceM = privateProgress(workouts),
        shareableDistanceM = shareableProgress(workouts),
    )
}
