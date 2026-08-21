package com.fitconnect.android.fitness.store

import com.fitconnect.android.fitness.domain.WorkoutSession
import com.fitconnect.shared.fitness.ProviderId

/**
 * Room/SQLite queries that feed social surfaces. Every social SELECT must
 * include the shareable predicate. [SocialQueryContractTest] fails the build
 * if a new social query is added without it.
 */
object SocialSessionQueries {
    const val TABLE = "workout_sessions"

    const val DDL = """
        CREATE TABLE IF NOT EXISTS workout_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          external_id TEXT NOT NULL,
          sport TEXT NOT NULL,
          started_at INTEGER NOT NULL,
          ended_at INTEGER NOT NULL,
          distance_m REAL,
          shareable INTEGER NOT NULL,
          UNIQUE(provider_id, external_id)
        );
        CREATE INDEX IF NOT EXISTS workout_sessions_user_shareable_started
          ON workout_sessions(user_id, shareable, started_at DESC);
    """

    const val SOCIAL_FEED = """
        SELECT * FROM workout_sessions
        WHERE shareable = 1
          AND (user_id = :viewerId OR visibility = 'public')
          AND provider_id != 'STRAVA'
        ORDER BY started_at DESC
    """

    const val SOCIAL_RANKING = """
        SELECT * FROM workout_sessions
        WHERE shareable = 1 AND provider_id != 'STRAVA'
        ORDER BY started_at DESC
    """

    const val SOCIAL_CHALLENGE = """
        SELECT * FROM workout_sessions
        WHERE shareable = 1 AND provider_id != 'STRAVA' AND user_id IN (:memberIds)
    """

    const val PUBLIC_PROFILE = """
        SELECT * FROM workout_sessions
        WHERE user_id = :profileUserId AND shareable = 1 AND provider_id != 'STRAVA'
        ORDER BY started_at DESC
    """

    val ALL_SOCIAL = listOf(SOCIAL_FEED, SOCIAL_RANKING, SOCIAL_CHALLENGE, PUBLIC_PROFILE)

    fun allowsSocialRead(viewerId: String, session: WorkoutSession): Boolean {
        if (session.providerId == ProviderId.STRAVA) {
            return viewerId == session.userId
        }
        return viewerId == session.userId || session.shareable
    }
}
