package com.fitconnect.android.sports.domain

enum class SportCategory {
    ENDURANCE,
    TEAM,
    RACKET,
    STRENGTH,
    HYBRID,
    WATER,
    WINTER,
    MIND_BODY,
    OTHER,
}

enum class OlympicStatus { OLYMPIC, PARALYMPIC, NON_OLYMPIC, EMERGING }

enum class EnvironmentKind { INDOOR, OUTDOOR, BOTH }

enum class ParticipationKind { INDIVIDUAL, TEAM, BOTH }

enum class Seasonality { YEAR_ROUND, SUMMER, WINTER, SEASONAL }

enum class SkillLevel { BEGINNER, INTERMEDIATE, ADVANCED, ELITE, ALL }

enum class MetricKind { REQUIRED, OPTIONAL, PERFORMANCE, RECOVERY, RISK }

enum class MetricValueType { NUMBER, DURATION, DISTANCE, RATE, SCORE, COUNT, TEXT }

enum class WearableCapability {
    HEART_RATE,
    GPS,
    POWER,
    SWIM,
    SLEEP,
    HRV,
    STEPS,
    HEALTH_CONNECT,
    WEAR_OS,
}

enum class TrainingType {
    ENDURANCE,
    INTERVAL,
    STRENGTH,
    SKILL,
    TECHNIQUE,
    RECOVERY,
    COMPETITION_PREP,
    MOBILITY,
    MIXED,
}

enum class CompetitionType {
    RACE,
    MATCH,
    TOURNAMENT,
    LEAGUE,
    PERSONAL_CHALLENGE,
    VIRTUAL_CHALLENGE,
    TIME_TRIAL,
}

data class MetricDefinition(
    val key: String,
    val label: String,
    val unit: String,
    val kind: MetricKind,
    val valueType: MetricValueType = MetricValueType.NUMBER,
    val description: String = "",
)

data class AgeCategory(
    val id: String,
    val label: String,
    val minAge: Int?,
    val maxAge: Int?,
)

/**
 * Universal sport definition — configuration payload registered in [com.fitconnect.android.sports.registry.SportsRegistry].
 */
data class SportDefinition(
    val id: SportId,
    val displayName: String,
    val category: SportCategory,
    val olympicStatus: OlympicStatus,
    val environment: EnvironmentKind,
    val participation: ParticipationKind,
    val seasonality: Seasonality,
    val skillLevels: Set<SkillLevel>,
    val genderRestrictions: String? = null,
    val ageCategories: List<AgeCategory> = emptyList(),
    val equipment: List<String> = emptyList(),
    val requiredMetrics: List<MetricDefinition> = emptyList(),
    val optionalMetrics: List<MetricDefinition> = emptyList(),
    val performanceIndicators: List<String> = emptyList(),
    val recoveryIndicators: List<String> = emptyList(),
    val riskIndicators: List<String> = emptyList(),
    val supportedWearables: Set<WearableCapability> = emptySet(),
    val trainingTypes: Set<TrainingType> = emptySet(),
    val competitionTypes: Set<CompetitionType> = emptySet(),
    val stravaType: String? = null,
    val version: Int = 1,
    val deprecated: Boolean = false,
    val capabilities: Set<String> = emptySet(),
    val dependencies: Set<SportId> = emptySet(),
) {
    fun allMetrics(): List<MetricDefinition> = requiredMetrics + optionalMetrics
}
