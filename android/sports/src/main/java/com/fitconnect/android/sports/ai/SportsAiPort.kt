package com.fitconnect.android.sports.ai

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.sports.domain.SportId

/**
 * Future AI hooks for the Sports Intelligence Engine — interfaces only.
 * No model runtime in Phase 06.
 */
data class SportInsight(
    val sportId: SportId,
    val summary: String,
)

interface SportsAiPort {
    suspend fun insight(sportId: SportId): AppResult<SportInsight>
    suspend fun naturalLanguageMetricSearch(query: String): AppResult<List<String>>
}

class ArchitectureSportsAiPort : SportsAiPort {
    override suspend fun insight(sportId: SportId): AppResult<SportInsight> =
        AppResult.Ok(SportInsight(sportId, "AI Engine not enabled"))

    override suspend fun naturalLanguageMetricSearch(query: String): AppResult<List<String>> =
        AppResult.Ok(emptyList())
}
