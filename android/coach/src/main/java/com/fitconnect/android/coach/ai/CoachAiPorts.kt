package com.fitconnect.android.coach.ai

import com.fitconnect.android.foundation.common.AppResult

/**
 * AI preparation ports — interfaces only. Runtime: [EngineCoachAiPort].
 */
data class TrainingSuggestion(
    val athleteId: String,
    val summary: String,
    val loadAdjustment: String,
)

data class RiskSignal(
    val athleteId: String,
    val severity: String,
    val reason: String,
)

data class SessionRecommendation(
    val sessionId: String?,
    val text: String,
)

interface CoachAiPort {
    suspend fun trainingSuggestions(athleteId: String): AppResult<List<TrainingSuggestion>>
    suspend fun riskDetection(rosterIds: List<String>): AppResult<List<RiskSignal>>
    suspend fun recoveryAlerts(rosterIds: List<String>): AppResult<List<String>>
    suspend fun sessionRecommendations(dayEpochMs: Long): AppResult<List<SessionRecommendation>>
    suspend fun loadAdjustments(athleteId: String): AppResult<String>
    suspend fun naturalLanguageSearch(query: String): AppResult<List<String>>
}
