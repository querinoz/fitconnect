package com.fitconnect.android.athlete.demo

import com.fitconnect.android.athlete.domain.AthleteDataProvenance
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.Provenanced
import com.fitconnect.android.athlete.domain.TodayReadinessUi
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.telemetry.integration.AthleteTelemetryFacade
import kotlin.math.roundToInt

/**
 * Merges measured telemetry with catalog fallbacks — per field, never mixing silently.
 */
object AthleteContentResolver {

    private const val TELEMETRY_SOURCE = "Telemetry"
    private const val SPORTS_ENGINE_SOURCE = "Sports engine"

    suspend fun todayReadiness(
        athleteId: String,
        home: HomeSnapshot,
        telemetry: AthleteTelemetryFacade,
    ): TodayReadinessUi {
        val vitals = telemetry.readinessVitals(athleteId)
        val hrvMeasured = vitals.hrvMs != null
        val sleepMeasured = vitals.sleepMinutes != null
        val restingHrMeasured = vitals.restingHr != null
        val anyInputDemo = !hrvMeasured || !sleepMeasured || !restingHrMeasured

        val hrvMs = if (hrvMeasured) {
            Provenanced(
                value = vitals.hrvMs!!.roundToInt(),
                provenance = AthleteDataProvenance.MEASURED,
                sourceLabel = TELEMETRY_SOURCE,
            )
        } else {
            Provenanced(
                value = home.readiness.hrvMs,
                provenance = AthleteDataProvenance.LOCAL_DEMO,
                sourceLabel = AthleteDemoCatalog.MODE_LABEL,
            )
        }

        val sleepLabel = if (sleepMeasured) {
            val minutes = vitals.sleepMinutes!!.roundToInt()
            Provenanced(
                value = AthleteDemoCatalog.formatSleepMinutes(minutes),
                provenance = AthleteDataProvenance.MEASURED,
                sourceLabel = TELEMETRY_SOURCE,
            )
        } else {
            Provenanced(
                value = AthleteDemoCatalog.FALLBACK_SLEEP_LABEL,
                provenance = AthleteDataProvenance.LOCAL_DEMO,
                sourceLabel = AthleteDemoCatalog.MODE_LABEL,
            )
        }

        val readinessPercent = Provenanced(
            value = home.readiness.recoveryScore,
            provenance = if (anyInputDemo) {
                AthleteDataProvenance.LOCAL_DEMO
            } else {
                AthleteDataProvenance.CALCULATED
            },
            sourceLabel = if (anyInputDemo) AthleteDemoCatalog.MODE_LABEL else SPORTS_ENGINE_SOURCE,
        )

        val load = Provenanced(
            value = home.readiness.trainingLoad.toFloat(),
            provenance = if (anyInputDemo) {
                AthleteDataProvenance.LOCAL_DEMO
            } else {
                AthleteDataProvenance.CALCULATED
            },
            sourceLabel = if (anyInputDemo) AthleteDemoCatalog.MODE_LABEL else SPORTS_ENGINE_SOURCE,
        )

        val isAnyDemo = listOf(hrvMs, sleepLabel, readinessPercent, load).any { it.isDemo }

        return TodayReadinessUi(
            readinessPercent = readinessPercent,
            hrvMs = hrvMs,
            load = load,
            sleepLabel = sleepLabel,
            isAnyDemo = isAnyDemo,
        )
    }

    fun readinessChartPoints(latestScore: Int): List<EliteChartPoint> {
        val template = AthleteDemoCatalog.READINESS_CHART_TEMPLATE_Y
        return template.mapIndexed { index, y ->
            EliteChartPoint(index.toFloat(), y)
        } + EliteChartPoint(template.size.toFloat(), latestScore.toFloat())
    }
}
