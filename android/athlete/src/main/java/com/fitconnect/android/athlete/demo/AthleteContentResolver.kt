package com.fitconnect.android.athlete.demo

import com.fitconnect.android.athlete.domain.AnalysisSurfaceUi
import com.fitconnect.android.athlete.domain.AthleteDataProvenance
import com.fitconnect.android.athlete.domain.DiscoverMapPreviewUi
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.ProfileSurfaceUi
import com.fitconnect.android.athlete.domain.Provenanced
import com.fitconnect.android.athlete.domain.TodayReadinessUi
import com.fitconnect.android.athlete.domain.TrainSurfaceUi
import com.fitconnect.android.athlete.domain.VaultBadgeUi
import com.fitconnect.android.athlete.domain.VaultProgressUi
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.sports.zones.HeartRateZones
import com.fitconnect.android.telemetry.domain.MetricType
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

        val stepsMeasured = telemetry.overview(athleteId).latestSteps?.value
        val steps = if (stepsMeasured != null) {
            Provenanced(
                value = stepsMeasured.roundToInt(),
                provenance = AthleteDataProvenance.MEASURED,
                sourceLabel = TELEMETRY_SOURCE,
            )
        } else {
            Provenanced(
                value = AthleteDemoCatalog.FALLBACK_STEPS,
                provenance = AthleteDataProvenance.LOCAL_DEMO,
                sourceLabel = AthleteDemoCatalog.MODE_LABEL,
            )
        }

        val isAnyDemo = listOf(hrvMs, sleepLabel, readinessPercent, load, steps).any { it.isDemo }

        return TodayReadinessUi(
            readinessPercent = readinessPercent,
            hrvMs = hrvMs,
            load = load,
            sleepLabel = sleepLabel,
            steps = steps,
            isAnyDemo = isAnyDemo,
        )
    }

    fun readinessChartPoints(latestScore: Int): List<EliteChartPoint> {
        val template = AthleteDemoCatalog.READINESS_CHART_TEMPLATE_Y
        return template.mapIndexed { index, y ->
            EliteChartPoint(index.toFloat(), y)
        } + EliteChartPoint(template.size.toFloat(), latestScore.toFloat())
    }

    fun analysisSurface(): AnalysisSurfaceUi {
        val demo = AthleteDataProvenance.LOCAL_DEMO
        val label = AthleteDemoCatalog.MODE_LABEL
        val weeklyLoad = AthleteDemoCatalog.ANALYSIS_WEEKLY_LOAD.map {
            Provenanced(it, demo, label)
        }
        val hrvTrend = AthleteDemoCatalog.ANALYSIS_HRV_TREND_MS.map {
            Provenanced(it, demo, label)
        }
        val zones = AthleteDemoCatalog.ANALYSIS_ZONE_MINUTES.map {
            Provenanced(it, demo, label)
        }
        return AnalysisSurfaceUi(
            weeklyLoad = weeklyLoad,
            weeklyLabels = AthleteDemoCatalog.ANALYSIS_WEEK_LABELS,
            todayIndex = AthleteDemoCatalog.ANALYSIS_TODAY_INDEX,
            hrvTrendMs = hrvTrend,
            hrvDeltaPercent = Provenanced(
                AthleteDemoCatalog.ANALYSIS_HRV_DELTA_PCT,
                demo,
                label,
            ),
            zoneMinutes = zones,
            isAnyDemo = true,
        )
    }

    /**
     * Production Analysis charts from telemetry store.
     * Returns empty series (not demo) when insufficient samples.
     */
    suspend fun analysisFromTelemetry(
        athleteId: String,
        telemetry: AthleteTelemetryFacade,
    ): AnalysisSurfaceUi {
        val loadTrend = telemetry.trend(athleteId, MetricType.TRAINING_LOAD, days = 7)
        val hrvTrend = telemetry.trend(athleteId, MetricType.HRV, days = 7)
        val hrSamples = telemetry.heartRateSamples(athleteId, days = 7)
        val vitals = telemetry.readinessVitals(athleteId)
        // Prefer measured LTHR proxy: if resting HR known, estimate LTHR ≈ RHR + 90 (not a lab test).
        // Label as CALCULATED. Fall back to DEFAULT_LTHR_BPM when no calibration.
        val lthr = when {
            vitals.restingHr != null && vitals.restingHr!! > 30 ->
                (vitals.restingHr!! + 90.0).coerceIn(120.0, 200.0)
            else -> HeartRateZones.DEFAULT_LTHR_BPM
        }

        val hasLoad = loadTrend.points.isNotEmpty()
        val hasHrv = hrvTrend.points.isNotEmpty()
        val zoneMinutesRaw = HeartRateZones.timeInZonesMinutes(hrSamples, lthr)
        val hasZones = zoneMinutesRaw != null

        if (!hasLoad && !hasHrv && !hasZones) {
            return AnalysisSurfaceUi(
                weeklyLoad = emptyList(),
                weeklyLabels = emptyList(),
                todayIndex = -1,
                hrvTrendMs = emptyList(),
                hrvDeltaPercent = Provenanced(
                    0f,
                    AthleteDataProvenance.INSUFFICIENT_DATA,
                    TELEMETRY_SOURCE,
                ),
                zoneMinutes = emptyList(),
                isAnyDemo = false,
            )
        }

        val labels = listOf("D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Today")
        val measured = AthleteDataProvenance.MEASURED
        val calculated = AthleteDataProvenance.CALCULATED
        val weeklyLoad = loadTrend.points.takeLast(7).map {
            Provenanced(it.avg.toFloat(), measured, TELEMETRY_SOURCE)
        }
        val hrvMs = hrvTrend.points.takeLast(7).map {
            Provenanced(it.avg.toFloat(), measured, TELEMETRY_SOURCE)
        }
        val delta = hrvTrend.trendDelta()?.toFloat() ?: 0f
        // LTHR 5-zone ladder (elite-core HEART_RATE_ZONES) — never HR density proxy.
        val zones = (zoneMinutesRaw ?: listOf(0, 0, 0, 0, 0)).map { minutes ->
            Provenanced(
                minutes,
                if (hasZones) calculated else AthleteDataProvenance.INSUFFICIENT_DATA,
                "HR zones · LTHR",
            )
        }
        return AnalysisSurfaceUi(
            weeklyLoad = weeklyLoad,
            weeklyLabels = labels.takeLast(weeklyLoad.size.coerceAtLeast(1)),
            todayIndex = (weeklyLoad.size - 1).coerceAtLeast(0),
            hrvTrendMs = hrvMs,
            hrvDeltaPercent = Provenanced(delta, measured, TELEMETRY_SOURCE),
            zoneMinutes = zones,
            isAnyDemo = false,
        )
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

    fun vaultProgress(): VaultProgressUi {
        val demo = AthleteDataProvenance.LOCAL_DEMO
        val label = AthleteDemoCatalog.MODE_LABEL
        return VaultProgressUi(
            xpWeekly = AthleteDemoCatalog.VAULT_XP_WEEKLY.map {
                Provenanced(it, demo, label)
            },
            xpLabels = AthleteDemoCatalog.VAULT_XP_WEEK_LABELS,
            xpTodayIndex = AthleteDemoCatalog.VAULT_XP_TODAY_INDEX,
            streakWeekly = AthleteDemoCatalog.VAULT_STREAK_WEEKLY.map {
                Provenanced(it, demo, label)
            },
            streakLabels = AthleteDemoCatalog.VAULT_STREAK_WEEK_LABELS,
            heroStreakDays = Provenanced(
                AthleteDemoCatalog.VAULT_HERO_STREAK_DAYS,
                demo,
                label,
            ),
            isAnyDemo = true,
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
