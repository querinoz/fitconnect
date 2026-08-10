package com.fitconnect.android.telemetry.sync

import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.WorkoutSession
import com.fitconnect.android.telemetry.time.TimeRange

/**
 * Deterministic workout deduplication. The same session reported by multiple
 * providers (e.g. Garmin + Strava + Health Connect) is merged into a single
 * canonical workout; nothing is discarded — every source is kept in
 * [WorkoutSession.mergedFrom].
 */
class DeduplicationEngine {

    /** Provider priority when picking the primary record of a merged workout. */
    private val priority: List<ProviderId> = listOf(
        ProviderId.GARMIN,
        ProviderId.POLAR,
        ProviderId.WHOOP,
        ProviderId.HEALTH_CONNECT,
        ProviderId.SAMSUNG_HEALTH,
        ProviderId.FITBIT,
        ProviderId.STRAVA,
        ProviderId.OURA,
        ProviderId.MANUAL,
    )

    data class Result(val merged: List<WorkoutSession>, val duplicatesDetected: Int)

    /**
     * Two workouts are duplicates when: same athlete, same sport, and their
     * time ranges overlap by more than [OVERLAP_THRESHOLD] of the shorter one.
     */
    fun dedupe(incoming: List<WorkoutSession>, existing: List<WorkoutSession>): Result {
        val all = existing + incoming
        val groups = mutableListOf<MutableList<WorkoutSession>>()
        for (workout in all.sortedBy { it.start.epochMs }) {
            val group = groups.firstOrNull { g -> g.any { isDuplicate(it, workout) } }
            if (group != null) {
                // Same source record re-synced: replace instead of duplicating.
                group.removeAll { sameSource(it, workout) }
                group.add(workout)
            } else {
                groups.add(mutableListOf(workout))
            }
        }
        var duplicates = 0
        val merged = groups.map { group ->
            if (group.size == 1) return@map group.single()
            duplicates += group.size - 1
            merge(group)
        }
        return Result(merged, duplicates)
    }

    fun isDuplicate(a: WorkoutSession, b: WorkoutSession): Boolean {
        if (a.athleteId != b.athleteId) return false
        if (sameSource(a, b)) return true
        if (a.sportKey != b.sportKey) return false
        val rangeA = TimeRange(a.start, a.end)
        val rangeB = TimeRange(b.start, b.end)
        val overlap = rangeA.overlapMs(rangeB)
        val shorter = minOf(rangeA.durationMs, rangeB.durationMs)
        if (shorter <= 0L) return false
        return overlap.toDouble() / shorter.toDouble() >= OVERLAP_THRESHOLD
    }

    private fun sameSource(a: WorkoutSession, b: WorkoutSession): Boolean =
        a.provenance.provider == b.provenance.provider &&
            a.provenance.sourceRecordId == b.provenance.sourceRecordId

    private fun merge(group: List<WorkoutSession>): WorkoutSession {
        val primary = group.minByOrNull { priority.indexOf(it.provenance.provider).let { i -> if (i < 0) Int.MAX_VALUE else i } }
            ?: group.first()
        val others = group.filterNot { it === primary }
        return primary.copy(
            // Fill gaps from secondary sources without overwriting the primary.
            distanceMeters = primary.distanceMeters ?: others.firstNotNullOfOrNull { it.distanceMeters },
            calories = primary.calories ?: others.firstNotNullOfOrNull { it.calories },
            avgHeartRate = primary.avgHeartRate ?: others.firstNotNullOfOrNull { it.avgHeartRate },
            maxHeartRate = primary.maxHeartRate ?: others.firstNotNullOfOrNull { it.maxHeartRate },
            avgPowerWatts = primary.avgPowerWatts ?: others.firstNotNullOfOrNull { it.avgPowerWatts },
            elevationGainMeters = primary.elevationGainMeters ?: others.firstNotNullOfOrNull { it.elevationGainMeters },
            mergedFrom = (primary.mergedFrom + others.map { it.provenance } + others.flatMap { it.mergedFrom })
                .distinctBy { "${it.provider}:${it.sourceRecordId}" },
        )
    }

    private companion object {
        const val OVERLAP_THRESHOLD = 0.7
    }
}
