package com.fitconnect.android.sports.performance

import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.goals.GoalDefinition
import com.fitconnect.android.sports.goals.GoalKind
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

data class LoadSeries(
    val dailyLoads: List<Double>,
)

data class PerformanceSnapshot(
    val sportId: SportId?,
    val trainingLoad: Double,
    val acuteLoad: Double,
    val chronicLoad: Double,
    val recoveryScore: Int,
    val fatigue: Double,
    val fitness: Double,
    val consistency: Int,
    val progression: Double,
    val readiness: Int,
    val risk: String,
    val trend: String,
    val recommendations: List<String>,
)

data class ReadinessInputs(
    val hrvMs: Int,
    val sleepQuality: Int,
    val restingHrBpm: Int,
    val subjective: Int,
    val acuteLoad: Double,
    val chronicLoad: Double,
)

/**
 * Sport-independent performance model. Does not hardcode sport rules —
 * sport context only influences recommendation phrasing via goals/indicators.
 */
interface PerformanceEngine {
    fun computeLoads(series: LoadSeries): Triple<Double, Double, Double>
    fun computeReadiness(inputs: ReadinessInputs): Int
    fun snapshot(
        sportId: SportId?,
        series: LoadSeries,
        inputs: ReadinessInputs,
        goals: List<GoalDefinition> = emptyList(),
    ): PerformanceSnapshot
}

class DefaultPerformanceEngine : PerformanceEngine {

    override fun computeLoads(series: LoadSeries): Triple<Double, Double, Double> {
        val daily = series.dailyLoads
        if (daily.isEmpty()) return Triple(0.0, 0.0, 0.0)
        val training = daily.last()
        val acute = daily.takeLast(7).average()
        val chronic = daily.takeLast(28).ifEmpty { daily }.average()
        return Triple(training, acute, chronic)
    }

    override fun computeReadiness(inputs: ReadinessInputs): Int {
        val hrvScore = min(100, (inputs.hrvMs / 80.0 * 100).roundToInt())
        val sleep = inputs.sleepQuality.coerceIn(0, 100)
        val rhrPenalty = max(0, inputs.restingHrBpm - 50) * 1.5
        val subjective = inputs.subjective.coerceIn(0, 100)
        val acwr = if (inputs.chronicLoad <= 0) 1.0 else inputs.acuteLoad / inputs.chronicLoad
        val loadPenalty = when {
            acwr > 1.5 -> 20.0
            acwr > 1.3 -> 10.0
            else -> 0.0
        }
        val raw = (hrvScore * 0.35 + sleep * 0.30 + subjective * 0.25 + (100 - rhrPenalty) * 0.10) - loadPenalty
        return raw.roundToInt().coerceIn(1, 100)
    }

    override fun snapshot(
        sportId: SportId?,
        series: LoadSeries,
        inputs: ReadinessInputs,
        goals: List<GoalDefinition>,
    ): PerformanceSnapshot {
        val (training, acute, chronic) = computeLoads(series)
        val readiness = computeReadiness(inputs.copy(acuteLoad = acute, chronicLoad = chronic))
        val acwr = if (chronic <= 0) 1.0 else acute / chronic
        val fitness = chronic
        val fatigue = acute
        val recovery = (100 - (fatigue / max(fitness, 1.0) * 40)).roundToInt().coerceIn(1, 100)
        val consistency = if (series.dailyLoads.isEmpty()) 0 else {
            val mean = series.dailyLoads.average()
            val variance = series.dailyLoads.map { abs(it - mean) }.average()
            (100 - variance * 5).roundToInt().coerceIn(0, 100)
        }
        val progression = if (series.dailyLoads.size < 2) 0.0 else
            series.dailyLoads.last() - series.dailyLoads.first()
        val risk = when {
            acwr > 1.5 -> "high"
            acwr > 1.3 -> "elevated"
            readiness < 50 -> "monitor"
            else -> "low"
        }
        val trend = when {
            progression > 5 -> "improving"
            progression < -5 -> "declining"
            else -> "stable"
        }
        val recommendations = buildRecommendations(readiness, risk, goals)
        return PerformanceSnapshot(
            sportId = sportId,
            trainingLoad = training,
            acuteLoad = acute,
            chronicLoad = chronic,
            recoveryScore = recovery,
            fatigue = fatigue,
            fitness = fitness,
            consistency = consistency,
            progression = progression,
            readiness = readiness,
            risk = risk,
            trend = trend,
            recommendations = recommendations,
        )
    }

    private fun buildRecommendations(
        readiness: Int,
        risk: String,
        goals: List<GoalDefinition>,
    ): List<String> {
        val out = mutableListOf<String>()
        when {
            readiness >= 80 -> out += "Green light for quality work — keep volume controlled."
            readiness >= 60 -> out += "Steady aerobic / skill work preferred."
            else -> out += "Prioritize recovery — reduce intensity."
        }
        if (risk == "high" || risk == "elevated") {
            out += "ACWR elevated — protect soft tissue and sleep."
        }
        goals.forEach { goal ->
            when (goal.kind) {
                GoalKind.MARATHON, GoalKind.COMPETITION -> out += "Align today's load with ${goal.title} timeline."
                GoalKind.REHABILITATION -> out += "Stay inside rehab constraints for ${goal.title}."
                GoalKind.WEIGHT_LOSS -> out += "Prefer Zone 2 volume for ${goal.title}."
                GoalKind.HYPERTROPHY, GoalKind.STRENGTH -> out += "Protect lifting quality for ${goal.title}."
                GoalKind.MAINTENANCE, GoalKind.HEALTH, GoalKind.CUSTOM -> out += "Stay consistent toward ${goal.title}."
            }
        }
        return out.distinct()
    }
}
