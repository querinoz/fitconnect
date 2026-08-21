package com.fitconnect.android.fitness.store

import com.fitconnect.android.fitness.domain.WorkoutSession
import com.fitconnect.shared.fitness.ProviderId
import kotlin.math.abs

/**
 * Persistence contract. Room/SQLite schema is defined in [SocialSessionQueries].
 * Unique key is (providerId, externalId). Cross-provider duplicates (Health
 * Connect + Strava of the same run) merge into one row.
 */
interface WorkoutSessionStore {
    suspend fun upsert(session: WorkoutSession): WorkoutSession
    suspend fun get(userId: String, providerId: ProviderId, externalId: String): WorkoutSession?
    suspend fun listOwn(userId: String): List<WorkoutSession>
    /** Feed / ranking / challenge / public profile — never returns STRAVA. */
    suspend fun listShareableForSocial(viewerId: String): List<WorkoutSession>
    suspend fun deleteByProvider(userId: String, providerId: ProviderId): Int
}

class InMemoryWorkoutSessionStore : WorkoutSessionStore {
    private val byKey = linkedMapOf<String, WorkoutSession>()

    override suspend fun upsert(session: WorkoutSession): WorkoutSession {
        val key = key(session.providerId, session.externalId)
        val existingSame = byKey[key]
        if (existingSame != null) {
            val merged = session.copy(id = existingSame.id)
            byKey[key] = merged
            return merged
        }
        val cross = byKey.values.firstOrNull { candidate ->
            candidate.userId == session.userId &&
                candidate.providerId != session.providerId &&
                sameWorkout(candidate, session)
        }
        if (cross != null) {
            val merged = cross.copy(
                mergedFrom = cross.mergedFrom + (session.providerId to session.externalId) +
                    cross.mergedFrom.filterNot { it == session.providerId to session.externalId },
            )
            byKey[key(cross.providerId, cross.externalId)] = merged
            return merged
        }
        byKey[key] = session
        return session
    }

    override suspend fun get(
        userId: String,
        providerId: ProviderId,
        externalId: String,
    ): WorkoutSession? = byKey[key(providerId, externalId)]?.takeIf { it.userId == userId }

    override suspend fun listOwn(userId: String): List<WorkoutSession> =
        byKey.values.filter { it.userId == userId }.sortedByDescending { it.startedAtEpochMs }

    override suspend fun listShareableForSocial(viewerId: String): List<WorkoutSession> =
        byKey.values.filter { session ->
            SocialSessionQueries.allowsSocialRead(viewerId, session)
        }.sortedByDescending { it.startedAtEpochMs }

    override suspend fun deleteByProvider(userId: String, providerId: ProviderId): Int {
        val remove = byKey.filter { it.value.userId == userId && it.value.providerId == providerId }.keys
        remove.forEach { byKey.remove(it) }
        return remove.size
    }

    private fun key(providerId: ProviderId, externalId: String) = "${providerId.name}:$externalId"

    private fun sameWorkout(a: WorkoutSession, b: WorkoutSession): Boolean {
        val startDelta = abs(a.startedAtEpochMs - b.startedAtEpochMs)
        if (startDelta > 120_000) return false
        val da = a.distanceM
        val db = b.distanceM
        if (da != null && db != null && abs(da - db) > 50.0) return false
        return a.sport == b.sport
    }
}
