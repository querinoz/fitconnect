package com.fitconnect.android.athlete.demo

import com.fitconnect.android.athlete.domain.AthleteDataProvenance
import com.fitconnect.android.athlete.domain.DiscoverMapPreviewUi
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.ProfileSurfaceUi
import com.fitconnect.android.athlete.domain.Provenanced
import com.fitconnect.android.athlete.domain.TodayReadinessUi
import com.fitconnect.android.athlete.domain.TrainSurfaceUi
import com.fitconnect.android.athlete.domain.VaultBadgeUi
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.telemetry.integration.AthleteTelemetryFacade
import com.fitconnect.ascend.badges.BadgeProgressEngine
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

    fun discoverMapPreview(
        routeDistanceKm: Double?,
        routeDurationMin: Int?,
    ): DiscoverMapPreviewUi {
        val distance = if (routeDistanceKm != null) {
            Provenanced(routeDistanceKm, AthleteDataProvenance.CALCULATED, "Geo routes")
        } else {
            Provenanced(
                AthleteDemoCatalog.DISCOVER_MAP_DISTANCE_KM,
                AthleteDataProvenance.LOCAL_DEMO,
                AthleteDemoCatalog.MODE_LABEL,
            )
        }
        val duration = if (routeDurationMin != null) {
            Provenanced(routeDurationMin, AthleteDataProvenance.CALCULATED, "Geo routes")
        } else {
            Provenanced(
                AthleteDemoCatalog.DISCOVER_MAP_DURATION_MIN,
                AthleteDataProvenance.LOCAL_DEMO,
                AthleteDemoCatalog.MODE_LABEL,
            )
        }
        val hr = Provenanced(
            AthleteDemoCatalog.DISCOVER_MAP_HR_BPM,
            AthleteDataProvenance.LOCAL_DEMO,
            AthleteDemoCatalog.MODE_LABEL,
        )
        val pace = Provenanced(
            AthleteDemoCatalog.DISCOVER_MAP_PACE_LABEL,
            AthleteDataProvenance.LOCAL_DEMO,
            AthleteDemoCatalog.MODE_LABEL,
        )
        return DiscoverMapPreviewUi(
            distanceKm = distance,
            durationMin = duration,
            heartRateBpm = hr,
            paceLabel = pace,
            isAnyDemo = listOf(distance, duration, hr, pace).any { it.isDemo },
        )
    }

    fun vaultBadges(): VaultBadgeUi {
        val workouts = AthleteDemoCatalog.VAULT_SHAREABLE_WORKOUTS +
            AthleteDemoCatalog.VAULT_PRIVATE_STRAVA_WORKOUT
        val progress = BadgeProgressEngine.evaluate(workouts)
        val shareableKm = progress.shareableDistanceM / 1000.0
        val privateKm = progress.privateDistanceM / 1000.0
        val summary = if (shareableKm > 0.0) {
            "Shareable ${"%.1f".format(shareableKm)} km · Private ${"%.1f".format(privateKm)} km · ${AthleteDemoCatalog.MODE_LABEL}"
        } else {
            progress.emptyCopy
        }
        return VaultBadgeUi(
            shareableKm = shareableKm,
            privateKm = privateKm,
            summary = summary,
            isDemo = true,
        )
    }

    fun profileSurface(displayName: String): ProfileSurfaceUi = ProfileSurfaceUi(
        displayName = Provenanced(
            value = displayName,
            provenance = AthleteDataProvenance.LOCAL_DEMO,
            sourceLabel = AthleteDemoCatalog.MODE_LABEL,
        ),
        bodyMetricsDemo = true,
        goalsDemo = true,
        hexatarNote = AthleteDemoCatalog.HEXATAR_DETERMINISTIC_NOTE,
        isAnyDemo = true,
    )

    fun trainSurface(sourceLabel: String): TrainSurfaceUi = TrainSurfaceUi(
        sourceLabel = sourceLabel,
        isDemoCapture = sourceLabel.equals(AthleteDemoCatalog.TRAIN_CAPTURE_SOURCE, ignoreCase = true) ||
            sourceLabel.contains(AthleteDemoCatalog.MODE_LABEL, ignoreCase = true),
    )
}
