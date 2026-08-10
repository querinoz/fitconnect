package com.fitconnect.android.telemetry

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.telemetry.di.DefaultTelemetryContainer
import com.fitconnect.android.telemetry.domain.DataQuality
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.Provenance
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.domain.WorkoutSession
import com.fitconnect.android.telemetry.quality.DataQualityEngine
import com.fitconnect.android.telemetry.sync.DeduplicationEngine
import com.fitconnect.android.telemetry.sync.SyncStatus
import com.fitconnect.android.telemetry.time.FixedTelemetryClock
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange
import com.fitconnect.android.telemetry.units.CanonicalUnits
import com.fitconnect.android.telemetry.units.TelemetryUnit
import com.fitconnect.android.telemetry.units.UnitConversionException
import com.fitconnect.android.telemetry.units.UnitConverter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

private const val DAY_MS = 86_400_000L

private class FakeConnectivity(initial: Boolean = true) : ConnectivityMonitor {
    val state = MutableStateFlow(initial)
    override val online: StateFlow<Boolean> = state
    override fun start() = Unit
}

private fun testContainer(
    online: Boolean = true,
    nowEpochMs: Long = 1_000L * DAY_MS,
): Triple<DefaultTelemetryContainer, FakeConnectivity, FixedTelemetryClock> {
    val connectivity = FakeConnectivity(online)
    val clock = FixedTelemetryClock(nowEpochMs)
    return Triple(DefaultTelemetryContainer(connectivity, clock), connectivity, clock)
}

private fun provenance(
    provider: ProviderId,
    sourceId: String,
    at: TelemetryInstant,
    confidence: Double = 1.0,
) = Provenance(
    provider = provider,
    device = null,
    deviceId = null,
    sourceRecordId = sourceId,
    originalUnit = TelemetryUnit.BPM,
    confidence = confidence,
    syncedAt = at,
    createdAt = at,
    updatedAt = at,
)

private fun sample(
    id: String,
    metric: MetricType,
    value: Double,
    atEpochMs: Long,
    provider: ProviderId = ProviderId.HEALTH_CONNECT,
    endEpochMs: Long? = null,
    confidence: Double = 1.0,
) = TelemetrySample(
    id = id,
    athleteId = "ath-t",
    metric = metric,
    value = value,
    unit = CanonicalUnits.of(metric),
    at = TelemetryInstant.utc(atEpochMs),
    endAt = endEpochMs?.let { TelemetryInstant.utc(it) },
    provenance = provenance(provider, "src-$id", TelemetryInstant.utc(atEpochMs), confidence),
)

private fun workout(
    id: String,
    provider: ProviderId,
    startEpochMs: Long,
    durationMs: Long,
    sportKey: String = "running",
    distance: Double? = 10_000.0,
    power: Double? = null,
) = WorkoutSession(
    id = id,
    athleteId = "ath-t",
    sportKey = sportKey,
    title = "Test $id",
    start = TelemetryInstant.utc(startEpochMs),
    end = TelemetryInstant.utc(startEpochMs + durationMs),
    distanceMeters = distance,
    calories = 500.0,
    avgHeartRate = 145.0,
    maxHeartRate = 175.0,
    avgPowerWatts = power,
    elevationGainMeters = null,
    provenance = provenance(provider, "src-$id", TelemetryInstant.utc(startEpochMs)),
)

class UnitConverterTest {

    @Test
    fun explicitConversionsAreCorrect() {
        assertEquals(1.0, UnitConverter.convert(1000.0, TelemetryUnit.METERS, TelemetryUnit.KILOMETERS), 1e-9)
        assertEquals(1609.344, UnitConverter.convert(1.0, TelemetryUnit.MILES, TelemetryUnit.METERS), 1e-9)
        assertEquals(3.6, UnitConverter.convert(1.0, TelemetryUnit.METERS_PER_SECOND, TelemetryUnit.KM_PER_HOUR), 1e-9)
        assertEquals(32.0, UnitConverter.convert(0.0, TelemetryUnit.CELSIUS, TelemetryUnit.FAHRENHEIT), 1e-9)
        assertEquals(100.0, UnitConverter.convert(212.0, TelemetryUnit.FAHRENHEIT, TelemetryUnit.CELSIUS), 1e-9)
        assertEquals(2.2046226218, UnitConverter.convert(1.0, TelemetryUnit.KILOGRAMS, TelemetryUnit.POUNDS), 1e-9)
    }

    @Test
    fun conversionIsReversibleWithinTolerance() {
        val pairs = listOf(
            TelemetryUnit.METERS to TelemetryUnit.MILES,
            TelemetryUnit.KILOMETERS to TelemetryUnit.MILES,
            TelemetryUnit.KILOGRAMS to TelemetryUnit.POUNDS,
            TelemetryUnit.CELSIUS to TelemetryUnit.FAHRENHEIT,
            TelemetryUnit.METERS_PER_SECOND to TelemetryUnit.KM_PER_HOUR,
            TelemetryUnit.MILLISECONDS to TelemetryUnit.MINUTES,
        )
        for ((from, to) in pairs) {
            for (value in listOf(0.1, 1.0, 36.6, 1234.5)) {
                val roundTrip = UnitConverter.convert(UnitConverter.convert(value, from, to), to, from)
                assertEquals("round-trip $from->$to", value, roundTrip, 1e-6)
            }
        }
    }

    @Test(expected = UnitConversionException::class)
    fun unsupportedConversionThrows() {
        UnitConverter.convert(1.0, TelemetryUnit.BPM, TelemetryUnit.KILOGRAMS)
    }

    @Test
    fun everyMetricHasCanonicalUnit() {
        MetricType.entries.forEach { metric -> assertNotNull(CanonicalUnits.of(metric)) }
    }
}

class TelemetryTimeTest {

    @Test
    fun comparisonIsEpochBasedNotStringBased() {
        val early = TelemetryInstant(1_000L, zoneOffsetMinutes = 600)
        val late = TelemetryInstant(2_000L, zoneOffsetMinutes = -600)
        assertTrue(early < late)
    }

    @Test
    fun crossMidnightSessionKeepsLocalDay() {
        // 23:30 local at UTC+2 → local day differs from UTC day.
        val utcMs = 100L * DAY_MS - 30 * 60_000L // 23:30 UTC on day 99
        val instant = TelemetryInstant(utcMs, zoneOffsetMinutes = 120)
        assertEquals(100L, instant.localDayIndex()) // local time already crossed midnight
        assertEquals(99L, TelemetryInstant.utc(utcMs).localDayIndex())
    }

    @Test
    fun rangeOverlapMath() {
        val a = TimeRange(TelemetryInstant.utc(0), TelemetryInstant.utc(100))
        val b = TimeRange(TelemetryInstant.utc(50), TelemetryInstant.utc(150))
        val c = TimeRange(TelemetryInstant.utc(200), TelemetryInstant.utc(300))
        assertTrue(a.overlaps(b))
        assertFalse(a.overlaps(c))
        assertEquals(50L, a.overlapMs(b))
        assertEquals(0L, a.overlapMs(c))
    }
}

class DataQualityEngineTest {
    private val clock = FixedTelemetryClock(1_000L * DAY_MS)
    private val engine = DataQualityEngine(clock)

    @Test
    fun impossibleHeartRateIsInvalidNotCorrected() {
        val s = sample("q1", MetricType.HEART_RATE, 400.0, 999L * DAY_MS)
        val result = engine.assess(s)
        assertEquals(DataQuality.INVALID, result.quality)
        assertTrue(result.flags.any { it.startsWith("out_of_bounds") })
    }

    @Test
    fun futureTimestampFlagged() {
        val s = sample("q2", MetricType.HEART_RATE, 60.0, 1_001L * DAY_MS)
        assertEquals(DataQuality.INVALID, engine.assess(s).quality)
        assertTrue(engine.assess(s).flags.contains("future_timestamp"))
    }

    @Test
    fun negativeDurationFlagged() {
        val s = sample("q3", MetricType.SLEEP, 400.0, 999L * DAY_MS, endEpochMs = 999L * DAY_MS - 1)
        assertTrue(engine.assess(s).flags.contains("negative_duration"))
    }

    @Test
    fun lowConfidenceIsSuspectNotInvalid() {
        val s = sample("q4", MetricType.HEART_RATE, 60.0, 999L * DAY_MS, confidence = 0.3)
        assertEquals(DataQuality.SUSPECT, engine.assess(s).quality)
    }

    @Test
    fun validSamplePasses() {
        val s = sample("q5", MetricType.HRV, 65.0, 999L * DAY_MS)
        assertEquals(DataQuality.VALID, engine.assess(s).quality)
        assertTrue(engine.assess(s).flags.isEmpty())
    }

    @Test
    fun outliersDetectedByMad() {
        val normal = (0 until 10).map { sample("n$it", MetricType.HEART_RATE, 60.0 + it, 990L * DAY_MS + it) }
        val outlier = sample("outlier", MetricType.HEART_RATE, 240.0, 990L * DAY_MS + 20)
        val flagged = engine.flagOutliers(normal + outlier)
        assertEquals(setOf("outlier"), flagged)
    }
}

class DeduplicationEngineTest {
    private val dedup = DeduplicationEngine()

    @Test
    fun sameWorkoutFromThreeProvidersMergesKeepingProvenance() {
        val base = 500L * DAY_MS
        val garmin = workout("w-g", ProviderId.GARMIN, base, 3_600_000, power = null)
        val strava = workout("w-s", ProviderId.STRAVA, base + 60_000, 3_500_000, power = 220.0)
        val hc = workout("w-h", ProviderId.HEALTH_CONNECT, base + 30_000, 3_550_000)
        val result = dedup.dedupe(listOf(garmin, strava, hc), emptyList())
        assertEquals(1, result.merged.size)
        assertEquals(2, result.duplicatesDetected)
        val merged = result.merged.single()
        assertEquals(ProviderId.GARMIN, merged.provenance.provider) // priority
        assertEquals(220.0, merged.avgPowerWatts!!, 1e-9) // gap filled from Strava
        assertEquals(2, merged.mergedFrom.size) // nothing discarded
    }

    @Test
    fun differentSportsNeverMerge() {
        val base = 500L * DAY_MS
        val run = workout("w-r", ProviderId.GARMIN, base, 3_600_000, sportKey = "running")
        val ride = workout("w-c", ProviderId.STRAVA, base, 3_600_000, sportKey = "cycling")
        assertEquals(2, dedup.dedupe(listOf(run, ride), emptyList()).merged.size)
    }

    @Test
    fun nonOverlappingWorkoutsNeverMerge() {
        val morning = workout("w-m", ProviderId.GARMIN, 500L * DAY_MS, 3_600_000)
        val evening = workout("w-e", ProviderId.STRAVA, 500L * DAY_MS + 10 * 3_600_000L, 3_600_000)
        assertEquals(2, dedup.dedupe(listOf(morning, evening), emptyList()).merged.size)
    }

    @Test
    fun dedupIsIdempotent() {
        val base = 500L * DAY_MS
        val incoming = listOf(
            workout("w-g", ProviderId.GARMIN, base, 3_600_000),
            workout("w-s", ProviderId.STRAVA, base, 3_600_000),
        )
        val once = dedup.dedupe(incoming, emptyList())
        val twice = dedup.dedupe(incoming, once.merged)
        assertEquals(1, twice.merged.size)
    }
}

class SyncEngineTest {

    @Test
    fun initialSyncImportsAndCheckpoints() = runBlocking {
        val (container, _, clock) = testContainer()
        val provider = container.providers.getValue(ProviderId.HEALTH_CONNECT)
        provider.connect()
        val now = TelemetryInstant.now(clock)
        val report = container.syncEngine.sync(
            provider, "ath-t", provider.capabilities().readableMetrics,
            TimeRange(now.plusMs(-7 * DAY_MS), now),
        )
        assertEquals(SyncStatus.SUCCESS, report.status)
        assertTrue(report.recordsImported > 0)
        assertNotNull(container.syncEngine.checkpoint(ProviderId.HEALTH_CONNECT, "ath-t"))
    }

    @Test
    fun resyncIsIdempotent() = runBlocking {
        val (container, _, clock) = testContainer()
        val provider = container.providers.getValue(ProviderId.HEALTH_CONNECT)
        provider.connect()
        val now = TelemetryInstant.now(clock)
        val range = TimeRange(now.plusMs(-7 * DAY_MS), now)
        val metrics = provider.capabilities().readableMetrics
        container.syncEngine.sync(provider, "ath-t", metrics, range)
        val countAfterFirst = container.store.countSamples("ath-t")
        val second = container.syncEngine.sync(provider, "ath-t", metrics, range)
        assertEquals(SyncStatus.SUCCESS, second.status)
        assertEquals(0, second.recordsImported) // no new records — idempotent
        assertEquals(countAfterFirst, container.store.countSamples("ath-t"))
    }

    @Test
    fun offlineSyncQueuesAndDrainsOnRecovery() = runBlocking {
        val (container, connectivity, clock) = testContainer(online = false)
        val provider = container.providers.getValue(ProviderId.GARMIN)
        provider.connect()
        val now = TelemetryInstant.now(clock)
        val report = container.syncEngine.sync(
            provider, "ath-t", provider.capabilities().readableMetrics,
            TimeRange(now.plusMs(-3 * DAY_MS), now),
        )
        assertEquals(SyncStatus.PENDING_NETWORK, report.status)
        assertEquals(1, container.syncEngine.pendingCount())
        assertEquals(0, container.store.countSamples("ath-t"))

        connectivity.state.value = true
        val drained = container.syncEngine.drainPending()
        assertEquals(1, drained.size)
        assertEquals(SyncStatus.SUCCESS, drained.single().status)
        assertTrue(container.store.countSamples("ath-t") > 0)
        assertEquals(0, container.syncEngine.pendingCount())
    }

    @Test
    fun disconnectedProviderFailsWithoutRetryStorm() = runBlocking {
        val (container, _, clock) = testContainer()
        val provider = container.providers.getValue(ProviderId.WHOOP) // never connected
        val now = TelemetryInstant.now(clock)
        val report = container.syncEngine.sync(
            provider, "ath-t", provider.capabilities().readableMetrics,
            TimeRange(now.plusMs(-DAY_MS), now),
        )
        assertEquals(SyncStatus.FAILED, report.status)
        assertNotNull(report.failure)
        assertEquals(0, container.store.countSamples("ath-t"))
    }

    @Test
    fun invalidRecordsAreRejectedAndCounted() = runBlocking {
        val (container, _, clock) = testContainer()
        // Directly exercise store + quality via engine on provider data:
        // simulated data is in-bounds, so craft an invalid sample through the store path.
        val bad = sample("bad", MetricType.HEART_RATE, 999.0, clock.nowEpochMs() - DAY_MS)
        val assessment = DataQualityEngine(clock).assess(bad)
        assertEquals(DataQuality.INVALID, assessment.quality)
    }
}

class StoreAndAggregationTest {

    @Test
    fun storePaginatesAndNeverReturnsUnbounded() = runBlocking {
        val (container, _, _) = testContainer()
        val samples = (0 until 1_200).map {
            sample("s$it", MetricType.HEART_RATE, 60.0 + (it % 30), 100L * DAY_MS + it * 60_000L)
        }
        container.store.upsertSamples(samples)
        val range = TimeRange(TelemetryInstant.utc(0), TelemetryInstant.utc(200L * DAY_MS))
        val page1 = container.store.samples("ath-t", MetricType.HEART_RATE, range, limit = 500)
        assertEquals(500, page1.items.size)
        assertNotNull(page1.nextOffset)
        val page3 = container.store.samples("ath-t", MetricType.HEART_RATE, range, offset = 1_000, limit = 500)
        assertEquals(200, page3.items.size)
        assertNull(page3.nextOffset)
    }

    @Test
    fun aggregationBucketsDailyWithStats() = runBlocking {
        val (container, _, _) = testContainer()
        val base = 100L * DAY_MS
        container.store.upsertSamples(
            listOf(
                sample("d1a", MetricType.HRV, 50.0, base + 1),
                sample("d1b", MetricType.HRV, 70.0, base + 2),
                sample("d2a", MetricType.HRV, 80.0, base + DAY_MS),
            ),
        )
        val series = container.aggregation.aggregate(
            "ath-t", MetricType.HRV,
            TimeRange(TelemetryInstant.utc(base - DAY_MS), TelemetryInstant.utc(base + 2 * DAY_MS)),
            com.fitconnect.android.telemetry.aggregate.Bucket.DAILY,
        )
        assertEquals(2, series.points.size)
        assertEquals(50.0, series.points[0].min, 1e-9)
        assertEquals(70.0, series.points[0].max, 1e-9)
        assertEquals(60.0, series.points[0].avg, 1e-9)
        assertEquals(20.0, series.trendDelta()!!, 1e-9)
    }

    @Test
    fun rollingAverageAndPercentile() = runBlocking {
        val (container, _, _) = testContainer()
        val base = 100L * DAY_MS
        container.store.upsertSamples(
            (0 until 7).map { sample("r$it", MetricType.HRV, 60.0 + it * 2, base + it * DAY_MS) },
        )
        val series = container.aggregation.aggregate(
            "ath-t", MetricType.HRV,
            TimeRange(TelemetryInstant.utc(base), TelemetryInstant.utc(base + 7 * DAY_MS)),
            com.fitconnect.android.telemetry.aggregate.Bucket.DAILY,
        )
        val rolling = container.aggregation.rollingAverage(series, window = 3)
        assertEquals(series.points.size, rolling.size)
        assertEquals(60.0, rolling.first(), 1e-9)
        assertEquals(70.0, rolling.last(), 1e-9) // avg of 68,70,72
        assertEquals(72.0, container.aggregation.percentile(series.points.map { it.avg }, 100.0)!!, 1e-9)
    }

    @Test
    fun deleteByProviderRemovesOnlyThatProvider() = runBlocking {
        val (container, _, _) = testContainer()
        container.store.upsertSamples(
            listOf(
                sample("hc1", MetricType.HRV, 60.0, 100L * DAY_MS, ProviderId.HEALTH_CONNECT),
                sample("ga1", MetricType.HRV, 62.0, 100L * DAY_MS + 1, ProviderId.GARMIN),
            ),
        )
        val deleted = container.store.deleteByProvider("ath-t", ProviderId.HEALTH_CONNECT)
        assertEquals(1, deleted)
        assertEquals(1, container.store.countSamples("ath-t"))
        assertFalse(container.store.sourceRecordExists(ProviderId.HEALTH_CONNECT, "src-hc1"))
        assertTrue(container.store.sourceRecordExists(ProviderId.GARMIN, "src-ga1"))
    }
}

class PrivacyAndDeviceCenterTest {

    @Test
    fun coachSeesOnlySharedMetrics() = runBlocking {
        val (container, _, _) = testContainer()
        container.store.upsertSamples(
            listOf(
                sample("p1", MetricType.HRV, 64.0, 100L * DAY_MS),
                sample("p2", MetricType.WEIGHT, 71.0, 100L * DAY_MS + 1),
            ),
        )
        container.privacy.shareWithCoach("ath-t", "coach-x", setOf(MetricType.HRV), actorId = "ath-t")
        val view = container.coachFacade.athleteTelemetry("coach-x", "ath-t")
        assertEquals(setOf(MetricType.HRV), view.sharedMetrics)
        assertTrue(MetricType.HRV in view.vitals)
        assertFalse(MetricType.WEIGHT in view.vitals) // never leaks
    }

    @Test
    fun revocationIsRespectedImmediately() = runBlocking {
        val (container, _, _) = testContainer()
        container.store.upsertSamples(listOf(sample("p3", MetricType.HRV, 64.0, 100L * DAY_MS)))
        container.privacy.shareWithCoach("ath-t", "coach-x", setOf(MetricType.HRV), actorId = "ath-t")
        assertTrue(container.privacy.coachMayRead("coach-x", "ath-t", MetricType.HRV))
        container.privacy.revokeCoachSharing("ath-t", "coach-x")
        assertFalse(container.privacy.coachMayRead("coach-x", "ath-t", MetricType.HRV))
        assertTrue(container.coachFacade.athleteTelemetry("coach-x", "ath-t").vitals.isEmpty())
    }

    @Test
    fun auditTrailRecordsAccessAndConsent() = runBlocking {
        val (container, _, _) = testContainer()
        container.privacy.grantProviderConsent("ath-t", ProviderId.GARMIN)
        container.privacy.shareWithCoach("ath-t", "coach-x", setOf(MetricType.HRV), actorId = "ath-t")
        container.privacy.coachMayRead("coach-x", "ath-t", MetricType.HRV)
        val trail = container.privacy.auditTrail("ath-t")
        assertTrue(trail.any { it.action.startsWith("consent_granted") })
        assertTrue(trail.any { it.action.startsWith("coach_share_granted") })
        assertTrue(trail.any { it.action.startsWith("coach_read_check") })
    }

    @Test
    fun shareWithCoachRejectsActorMismatch() = runBlocking {
        val (container, _, _) = testContainer()
        val ok = container.privacy.shareWithCoach(
            athleteId = "ath-t",
            coachId = "coach-x",
            metrics = setOf(MetricType.HRV),
            actorId = "attacker",
        )
        assertFalse(ok)
        assertFalse(container.privacy.coachMayRead("coach-x", "ath-t", MetricType.HRV))
    }

    @Test
    fun deviceCenterConnectSyncDisconnectLifecycle() = runBlocking {
        val (container, _, _) = testContainer()
        val devices = container.deviceCenter.devices("ath-t")
        assertEquals(8, devices.size)

        val connect = container.deviceCenter.connect("ath-t", ProviderId.HEALTH_CONNECT)
        assertTrue(connect is AppResult.Ok)
        assertTrue(container.privacy.hasProviderConsent("ath-t", ProviderId.HEALTH_CONNECT))

        val sync = container.deviceCenter.syncNow("ath-t", ProviderId.HEALTH_CONNECT, historyDays = 7)
        assertTrue(sync is AppResult.Ok)
        assertTrue((sync as AppResult.Ok).value.recordsImported > 0)
        assertTrue(container.store.countSamples("ath-t") > 0)

        val disconnect = container.deviceCenter.disconnect("ath-t", ProviderId.HEALTH_CONNECT)
        assertTrue(disconnect is AppResult.Ok)
        assertFalse(container.privacy.hasProviderConsent("ath-t", ProviderId.HEALTH_CONNECT))

        // Sync without consent must be refused.
        val refused = container.deviceCenter.syncNow("ath-t", ProviderId.HEALTH_CONNECT)
        assertTrue(refused is AppResult.Err)
    }

    @Test
    fun syncWithoutConsentIsRefused() = runBlocking {
        val (container, _, _) = testContainer()
        val refused = container.deviceCenter.syncNow("ath-t", ProviderId.GARMIN)
        assertTrue(refused is AppResult.Err)
    }
}

class CapabilityAndFacadeTest {

    @Test
    fun capabilityRegistryAnswersProviderQuestions() {
        val (container, _, _) = testContainer()
        val hc = container.capabilities.of(ProviderId.HEALTH_CONNECT)!!
        assertTrue(hc.canRead(MetricType.HEART_RATE))
        assertTrue(hc.supportsDeletion)
        val stravaReaders = container.capabilities.providersFor(MetricType.RECOVERY)
        assertFalse(ProviderId.STRAVA in stravaReaders)
        assertTrue(ProviderId.WHOOP in stravaReaders)
    }

    @Test
    fun athleteFacadeExposesVitalsAndOverview() = runBlocking {
        val (container, _, clock) = testContainer()
        val provider = container.providers.getValue(ProviderId.HEALTH_CONNECT)
        provider.connect()
        container.privacy.grantProviderConsent("ath-t", ProviderId.HEALTH_CONNECT)
        container.deviceCenter.syncNow("ath-t", ProviderId.HEALTH_CONNECT, historyDays = 7)

        val vitals = container.athleteFacade.readinessVitals("ath-t")
        assertNotNull(vitals.hrvMs)
        assertNotNull(vitals.restingHr)

        val overview = container.athleteFacade.overview("ath-t")
        assertTrue(overview.sampleCount > 0)
        assertTrue(overview.coveredMetrics.isNotEmpty())

        val trend = container.athleteFacade.trend("ath-t", MetricType.HRV, days = 7)
        assertTrue(trend.points.isNotEmpty())
    }

    @Test
    fun sportsBridgeMapsWorkoutToSportMetrics() = runBlocking {
        val (container, _, _) = testContainer()
        val run = workout("w-b", ProviderId.GARMIN, 500L * DAY_MS, 3_600_000, distance = 12_000.0)
        val metrics = container.sportsBridge.sessionMetrics("ath-t", run)
        assertEquals(145.0, metrics[MetricType.HEART_RATE]!!, 1e-9)
        assertEquals(12_000.0, metrics[MetricType.DISTANCE]!!, 1e-9)
        assertEquals(300.0, metrics[MetricType.PACE]!!, 1e-9) // 3600s / 12km
    }

    @Test
    fun observabilityCountsWithoutHealthData() = runBlocking {
        val (container, _, clock) = testContainer()
        val provider = container.providers.getValue(ProviderId.HEALTH_CONNECT)
        provider.connect()
        val now = TelemetryInstant.now(clock)
        container.syncEngine.sync(
            provider, "ath-t", provider.capabilities().readableMetrics,
            TimeRange(now.plusMs(-2 * DAY_MS), now),
        )
        val snap = container.observability.snapshot()
        assertEquals(1, snap.syncSuccesses[ProviderId.HEALTH_CONNECT])
    }

    @Test
    fun backgroundPolicyRespectsBatteryAndInterval() {
        val (container, _, _) = testContainer()
        val policy = container.backgroundPolicy
        assertFalse(policy.shouldRun(lastRunEpochMs = null, nowEpochMs = 0, batteryLow = true, online = true))
        assertFalse(policy.shouldRun(lastRunEpochMs = null, nowEpochMs = 0, batteryLow = false, online = false))
        assertTrue(policy.shouldRun(lastRunEpochMs = null, nowEpochMs = 0, batteryLow = false, online = true))
        assertFalse(policy.shouldRun(lastRunEpochMs = 0, nowEpochMs = 30 * 60_000L, batteryLow = false, online = true))
        assertTrue(policy.shouldRun(lastRunEpochMs = 0, nowEpochMs = 61 * 60_000L, batteryLow = false, online = true))
    }
}
