package com.fitconnect.android.fitness.strava

import com.fitconnect.android.fitness.domain.FitnessProvider
import com.fitconnect.android.fitness.domain.FitnessSyncPage
import com.fitconnect.android.fitness.mapping.ExerciseSessionDto
import com.fitconnect.android.fitness.mapping.ExerciseSessionMapper
import com.fitconnect.android.fitness.store.WorkoutSessionStore
import com.fitconnect.shared.fitness.ProviderConstraints
import com.fitconnect.shared.fitness.ProviderId
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException

/**
 * Strava adapter. Tokens never live in this class — the edge function
 * exchanges the OAuth code. ViewModels depend on [FitnessProvider] only.
 */
class StravaFitnessSource(
    private val store: WorkoutSessionStore,
    private val reader: suspend (cursor: String?) -> Pair<List<ExerciseSessionDto>, String?>,
) : FitnessProvider {
    override val providerId: ProviderId = ProviderId.STRAVA
    override val constraints: ProviderConstraints = ProviderConstraints(providerId)

    override suspend fun syncSince(cursor: String?): FitnessSyncPage {
        val (dtos, next) = reader(cursor)
        val upserted = dtos.map { dto ->
            store.upsert(ExerciseSessionMapper.toDomain(dto, ProviderId.STRAVA))
        }
        return FitnessSyncPage(upserted, next, fullReread = cursor == null)
    }
}

data class StravaRateLimitSnapshot(
    val fifteenMinUsage: Int,
    val fifteenMinLimit: Int,
    val dailyUsage: Int,
    val dailyLimit: Int,
) {
    fun atOrAbove(threshold: Double): Boolean {
        val fifteen = if (fifteenMinLimit <= 0) 0.0 else fifteenMinUsage.toDouble() / fifteenMinLimit
        val daily = if (dailyLimit <= 0) 0.0 else dailyUsage.toDouble() / dailyLimit
        return fifteen >= threshold || daily >= threshold
    }
}

class StravaRateLimitInterceptor(
    private val threshold: Double = 0.85,
    private val onSnapshot: (StravaRateLimitSnapshot) -> Unit = {},
) : Interceptor {
    @Volatile
    var last: StravaRateLimitSnapshot? = null
        private set

    override fun intercept(chain: Interceptor.Chain): Response {
        last?.let { snap ->
            if (snap.atOrAbove(threshold)) {
                throw StravaRateLimitBrake("Strava rate limit at ${(threshold * 100).toInt()}%")
            }
        }
        val response = chain.proceed(chain.request())
        val usage = response.header("X-RateLimit-Usage")?.split(",")
        val limit = response.header("X-RateLimit-Limit")?.split(",")
        val readUsage = response.header("X-ReadRateLimit-Usage")?.split(",")
        val readLimit = response.header("X-ReadRateLimit-Limit")?.split(",")
        val snap = StravaRateLimitSnapshot(
            fifteenMinUsage = (usage?.getOrNull(0) ?: readUsage?.getOrNull(0))?.toIntOrNull() ?: 0,
            fifteenMinLimit = (limit?.getOrNull(0) ?: readLimit?.getOrNull(0))?.toIntOrNull() ?: 100,
            dailyUsage = (usage?.getOrNull(1) ?: readUsage?.getOrNull(1))?.toIntOrNull() ?: 0,
            dailyLimit = (limit?.getOrNull(1) ?: readLimit?.getOrNull(1))?.toIntOrNull() ?: 1000,
        )
        last = snap
        onSnapshot(snap)
        if (snap.atOrAbove(threshold)) {
            throw StravaRateLimitBrake("Strava rate limit at ${(threshold * 100).toInt()}%")
        }
        return response
    }
}

class StravaRateLimitBrake(message: String) : IOException(message)

object StravaPathAllowlist {
    private val BANNED = listOf(
        Regex("^/clubs/[^/]+/activities$"),
        Regex("^/clubs/[^/]+/admins$"),
        Regex("^/clubs/[^/]+/members$"),
        Regex("^/segments/explore$"),
        Regex("^/activities/[^/]+/kudos$"),
        Regex("^/activities/[^/]+/comments$"),
    )

    fun isAllowed(path: String): Boolean = BANNED.none { it.matches(path.trim()) }
}

object StravaAuth {
    /** Custom Tabs entry — code exchange happens on the edge, never in the APK. */
    fun authorizeUrl(apiBase: String, state: String): String {
        require(state.length >= 16) { "OAuth state must be anti-CSRF entropy" }
        val base = apiBase.trimEnd('/')
        return "$base/api/v1/integrations/strava/connect?state=$state"
    }
}
