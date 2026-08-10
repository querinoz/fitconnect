package com.fitconnect.android.ai.integration

import com.fitconnect.android.ai.domain.Evidence

/**
 * Outbound ports. `:ai` never depends on `:sports`, `:telemetry`, `:community`
 * or OS modules — adapters in `:app` / `:athlete` / `:coach` supply facts.
 * Missing data must be represented as null/empty — never fabricated.
 */

data class TelemetryFactSheet(
    val athleteId: String,
    val hrvMs: Double? = null,
    val hrvTrendPct: Double? = null,
    val sleepMinutes: Double? = null,
    val sleepTrendPct: Double? = null,
    val restingHr: Double? = null,
    val trainingLoad: Double? = null,
    val readinessScore: Int? = null,
    val dataQuality: String? = null,
    val asOfEpochMs: Long,
) {
    fun toEvidence(): List<Evidence> = buildList {
        hrvMs?.let { add(Evidence("HRV", "telemetry", "hrv_ms", "%.0f".format(it), asOfEpochMs)) }
        hrvTrendPct?.let { add(Evidence("HRV trend", "telemetry", "hrv_trend_pct", "%.1f%%".format(it), asOfEpochMs)) }
        sleepMinutes?.let { add(Evidence("Sleep", "telemetry", "sleep_min", "%.0f".format(it), asOfEpochMs)) }
        sleepTrendPct?.let { add(Evidence("Sleep trend", "telemetry", "sleep_trend_pct", "%.1f%%".format(it), asOfEpochMs)) }
        restingHr?.let { add(Evidence("Resting HR", "telemetry", "rhr", "%.0f".format(it), asOfEpochMs)) }
        trainingLoad?.let { add(Evidence("Training load", "telemetry", "load", "%.0f".format(it), asOfEpochMs)) }
        readinessScore?.let { add(Evidence("Readiness", "athlete", "readiness", "$it", asOfEpochMs)) }
    }
}

data class ProgramFactSheet(
    val programId: String?,
    val title: String?,
    val week: Int?,
    val completionPercent: Int?,
    val nextSessionTitle: String?,
    val missedSessions: Int = 0,
    val asOfEpochMs: Long,
) {
    fun toEvidence(): List<Evidence> = buildList {
        title?.let { add(Evidence("Program", "programs", "title", it, asOfEpochMs)) }
        week?.let { add(Evidence("Current week", "programs", "week", "$it", asOfEpochMs)) }
        completionPercent?.let { add(Evidence("Completion", "programs", "completion_pct", "$it%", asOfEpochMs)) }
        nextSessionTitle?.let { add(Evidence("Next session", "programs", "next_session", it, asOfEpochMs)) }
        if (missedSessions > 0) {
            add(Evidence("Missed sessions", "programs", "missed", "$missedSessions", asOfEpochMs))
        }
    }
}

data class SportFactSheet(
    val primarySportKey: String?,
    val goalSummary: String?,
    val phase: String?,
    val upcomingCompetition: String?,
    val asOfEpochMs: Long,
) {
    fun toEvidence(): List<Evidence> = buildList {
        primarySportKey?.let { add(Evidence("Sport", "sports", "sport_key", it, asOfEpochMs)) }
        goalSummary?.let { add(Evidence("Goal", "sports", "goal", it, asOfEpochMs)) }
        phase?.let { add(Evidence("Training phase", "sports", "phase", it, asOfEpochMs)) }
        upcomingCompetition?.let { add(Evidence("Competition", "sports", "competition", it, asOfEpochMs)) }
    }
}

data class SessionFactSheet(
    val upcomingTitles: List<String> = emptyList(),
    val recentCompleted: Int = 0,
    val asOfEpochMs: Long,
) {
    fun toEvidence(): List<Evidence> = buildList {
        if (upcomingTitles.isNotEmpty()) {
            add(Evidence("Upcoming sessions", "sessions", "upcoming", upcomingTitles.joinToString(", "), asOfEpochMs))
        }
        add(Evidence("Recent completed", "sessions", "recent_completed", "$recentCompleted", asOfEpochMs))
    }
}

interface AiTelemetryPort {
    suspend fun summary(athleteId: String): TelemetryFactSheet?
}

interface AiProgramPort {
    suspend fun progress(athleteId: String): ProgramFactSheet?
}

interface AiSportsPort {
    suspend fun profile(athleteId: String): SportFactSheet?
}

interface AiSessionPort {
    suspend fun sessions(athleteId: String): SessionFactSheet?
}

interface AiCommunityPort {
    /** Public / authorized community snippets only — never private health posts. */
    suspend fun relevantPublic(athleteId: String): List<String>
}

class EmptyAiTelemetryPort : AiTelemetryPort {
    override suspend fun summary(athleteId: String): TelemetryFactSheet? = null
}

class EmptyAiProgramPort : AiProgramPort {
    override suspend fun progress(athleteId: String): ProgramFactSheet? = null
}

class EmptyAiSportsPort : AiSportsPort {
    override suspend fun profile(athleteId: String): SportFactSheet? = null
}

class EmptyAiSessionPort : AiSessionPort {
    override suspend fun sessions(athleteId: String): SessionFactSheet? = null
}

class EmptyAiCommunityPort : AiCommunityPort {
    override suspend fun relevantPublic(athleteId: String): List<String> = emptyList()
}
