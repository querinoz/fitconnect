package com.fitconnect.android

import android.app.Application
import com.fitconnect.android.ai.adapters.DemoCommunityAiAdapter
import com.fitconnect.android.ai.adapters.DemoProgramAiAdapter
import com.fitconnect.android.ai.adapters.DemoSessionAiAdapter
import com.fitconnect.android.ai.adapters.DemoSportsAiAdapter
import com.fitconnect.android.ai.adapters.TelemetryAiAdapter
import com.fitconnect.android.ai.di.AiContainer
import com.fitconnect.android.ai.di.DefaultAiContainer
import com.fitconnect.android.athlete.di.AthleteContainer
import com.fitconnect.android.athlete.di.DefaultAthleteContainer
import com.fitconnect.android.coach.di.CoachContainer
import com.fitconnect.android.coach.di.DefaultCoachContainer
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.config.AppConfig
import com.fitconnect.android.foundation.config.AppEnvironment
import com.fitconnect.android.foundation.crash.CrashHandler
import com.fitconnect.android.firebase.FirebaseBootstrap
import com.fitconnect.android.firebase.FirebaseCrashReporter
import com.fitconnect.android.foundation.di.AppContainer
import com.fitconnect.android.foundation.di.DefaultAppContainer
import com.fitconnect.android.foundation.offline.OfflineWorkExecutor
import com.fitconnect.android.foundation.perf.StartupTracer
import com.fitconnect.android.geo.di.DefaultGeoContainer
import com.fitconnect.android.geo.di.GeoContainer
import com.fitconnect.android.sports.di.DefaultSportsContainer
import com.fitconnect.android.sports.di.SportsContainer
import com.fitconnect.android.sports.metrics.MetricSample
import com.fitconnect.android.telemetry.di.DefaultTelemetryContainer
import com.fitconnect.android.telemetry.di.TelemetryContainer
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.observability.WatchDiagEvent
import com.fitconnect.ascend.demo.AscendDemo
import com.fitconnect.ascend.engine.AscendEngine
import com.fitconnect.shared.wear.WearPaths
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Phase 11: cold start only wires foundation + connectivity/lifecycle.
 * Feature engines (sports/geo/telemetry/ai/athlete/coach) lazy-init on first use
 * so the splash shell is not blocked by MasterKey + full DI graph.
 */
class FitConnectApplication : Application() {
    val startupTracer = StartupTracer()

    lateinit var container: AppContainer
        private set

    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private val sportsLock = Any()
    private val geoLock = Any()
    private val telemetryLock = Any()
    private val aiLock = Any()
    private val athleteLock = Any()
    private val coachLock = Any()
    private val ascendLock = Any()

    @Volatile private var sportsContainerRef: SportsContainer? = null
    @Volatile private var geoContainerRef: GeoContainer? = null
    @Volatile private var telemetryContainerRef: TelemetryContainer? = null
    @Volatile private var aiContainerRef: AiContainer? = null
    @Volatile private var athleteContainerRef: AthleteContainer? = null
    @Volatile private var coachContainerRef: CoachContainer? = null
    @Volatile private var ascendEngineRef: AscendEngine? = null

    val sportsContainer: SportsContainer
        get() = sportsContainerRef ?: synchronized(sportsLock) {
            sportsContainerRef ?: DefaultSportsContainer().also {
                sportsContainerRef = it
                startupTracer.mark("sports_ready")
            }
        }

    val geoContainer: GeoContainer
        get() = geoContainerRef ?: synchronized(geoLock) {
            geoContainerRef ?: DefaultGeoContainer(allowMockLocation = BuildConfig.DEBUG).also {
                geoContainerRef = it
                startupTracer.mark("geo_ready")
            }
        }

    val telemetryContainer: TelemetryContainer
        get() = telemetryContainerRef ?: synchronized(telemetryLock) {
            telemetryContainerRef ?: DefaultTelemetryContainer(
                container.connectivity,
                appContext = this@FitConnectApplication,
            ).also {
                telemetryContainerRef = it
                startupTracer.mark("telemetry_ready")
            }
        }

    val aiContainer: AiContainer
        get() = aiContainerRef ?: synchronized(aiLock) {
            aiContainerRef ?: DefaultAiContainer(
                connectivity = container.connectivity,
                telemetryPort = TelemetryAiAdapter(telemetryContainer.athleteFacade),
                programPort = DemoProgramAiAdapter(),
                sportsPort = DemoSportsAiAdapter(),
                sessionPort = DemoSessionAiAdapter(),
                communityPort = DemoCommunityAiAdapter(),
            ).also {
                aiContainerRef = it
                startupTracer.mark("ai_ready")
            }
        }

    val ascendEngine: AscendEngine
        get() = ascendEngineRef ?: synchronized(ascendLock) {
            ascendEngineRef ?: AscendEngine(
                demoLabeledUsers = setOf(
                    "ath-1",
                    AscendDemo.INES,
                    AscendDemo.MARINA,
                    AscendDemo.TOMAS,
                ),
            ).also { engine ->
                ascendEngineRef = engine
                startupTracer.mark("ascend_ready")
            }
        }

    val athleteContainer: AthleteContainer
        get() = athleteContainerRef ?: synchronized(athleteLock) {
            athleteContainerRef ?: DefaultAthleteContainer(
                container, sportsContainer, geoContainer, telemetryContainer, aiContainer,
                ascend = ascendEngine,
            ).also {
                athleteContainerRef = it
                startupTracer.mark("athlete_ready")
            }
        }

    val coachContainer: CoachContainer
        get() = coachContainerRef ?: synchronized(coachLock) {
            coachContainerRef ?: DefaultCoachContainer(
                container, sportsContainer, geoContainer, telemetryContainer, aiContainer,
                ascend = ascendEngine,
            ).also {
                coachContainerRef = it
                startupTracer.mark("coach_ready")
            }
        }

    override fun onCreate() {
        super.onCreate()
        val config = AppConfig(
            environment = if (BuildConfig.DEBUG) AppEnvironment.DEBUG else AppEnvironment.PRODUCTION,
            apiBaseUrl = BuildConfig.API_BASE_URL,
            supabaseUrl = BuildConfig.SUPABASE_URL.takeIf { it.isNotBlank() },
            supabaseAnonKey = BuildConfig.SUPABASE_ANON_KEY.takeIf { it.isNotBlank() },
            isDebuggable = BuildConfig.DEBUG,
            allowLocalAuth = BuildConfig.ALLOW_LOCAL_AUTH,
            firebaseAuthConfigured = BuildConfig.FIREBASE_CONFIGURED,
            googleWebClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID.takeIf { it.isNotBlank() },
            fcmConfigured = BuildConfig.FCM_CONFIGURED,
            releaseChannel = BuildConfig.RELEASE_CHANNEL,
            versionName = BuildConfig.VERSION_NAME,
            versionCode = BuildConfig.VERSION_CODE,
        )
        if (BuildConfig.FIREBASE_CONFIGURED) {
            FirebaseBootstrap.start(this)
        }
        container = DefaultAppContainer(
            this,
            config,
            enforceProductionConfig = BuildConfig.ENFORCE_PROD_CONFIG,
            notificationOverride = { log ->
                if (BuildConfig.FCM_CONFIGURED) {
                    com.fitconnect.android.push.FcmNotificationGateway(
                        this@FitConnectApplication,
                        log,
                    )
                } else {
                    null
                }
            },
            identityAuthOverride = { platform ->
                if (!BuildConfig.FIREBASE_CONFIGURED) {
                    null
                } else {
                    com.fitconnect.android.foundation.auth.FirebaseAuthRepository(
                        gateway = com.fitconnect.android.auth.AndroidFirebaseAuthGateway(),
                        sessionStore = platform.sessionStore,
                        logger = platform.logger,
                        isolation = platform.accountIsolation,
                        keyValueStore = platform.keyValueStore,
                        connectivity = platform.connectivity,
                        identityRemote = platform.identityRemote,
                        credentialClearer = {
                            androidx.credentials.CredentialManager.create(this@FitConnectApplication)
                                .clearCredentialState(androidx.credentials.ClearCredentialStateRequest())
                        },
                    )
                }
            },
        )
        startupTracer.mark("foundation_ready")
        registerOfflineHandlers()
        CrashHandler(
            container.logger,
            reporter = if (BuildConfig.FIREBASE_CONFIGURED) FirebaseCrashReporter() else null,
        ).install()
        container.connectivity.start()
        container.lifecycle.start()
        startupTracer.mark("shell_ready")
        runCatching {
            Wearable.getCapabilityClient(this).addLocalCapability(WearPaths.CAPABILITY)
        }
        // Demo telemetry is opt-in via debug flag — never auto-sync on every cold start.
        if (BuildConfig.DEBUG && shouldBootstrapDemoTelemetry()) {
            appScope.launch { bootstrapDemoTelemetry() }
        }
        container.logger.i(
            "FitConnectApplication",
            "shell ready marks=${startupTracer.snapshot().joinToString { "${it.name}:${it.elapsedMs}ms" }}",
        )
    }

    fun ingestWearMessage(path: String, data: ByteArray) {
        if (path != WearPaths.TELEMETRY_LIVE && path != WearPaths.TELEMETRY_BATCH) return
        val result = telemetryContainer.wearInbox.ingest(data.toString(Charsets.UTF_8))
        when (result) {
            com.fitconnect.android.telemetry.wear.WearIngestResult.ACCEPTED ->
                telemetryContainer.wearDiagnostics.record(WatchDiagEvent.TELEMETRY_SAMPLE)
            com.fitconnect.android.telemetry.wear.WearIngestResult.DUPLICATE,
            com.fitconnect.android.telemetry.wear.WearIngestResult.REJECTED -> Unit
        }
    }

    private fun shouldBootstrapDemoTelemetry(): Boolean = false

    private fun registerOfflineHandlers() {
        val localAck = OfflineWorkExecutor { AppResult.Ok(Unit) }
        // Local-optimistic mutations already applied in UI — ack on reconnect is idempotent.
        listOf(
            "athlete.task.toggle",
            "athlete.program.enroll",
            "coach.session.reschedule",
            "coach.session.cancel",
            "coach.booking.approve",
            "coach.booking.decline",
            "coach.booking.reject",
            "coach.program.publish",
            "coach.program.draft",
        ).forEach { type ->
            container.offlineExecutor.register(type, localAck)
        }
    }

    private suspend fun bootstrapDemoTelemetry() {
        val athleteId = "ath-1"
        val deviceCenter = telemetryContainer.deviceCenter
        deviceCenter.connect(athleteId, ProviderId.HEALTH_CONNECT)
        deviceCenter.syncNow(athleteId, ProviderId.HEALTH_CONNECT)
        deviceCenter.connect("a1", ProviderId.HEALTH_CONNECT)
        deviceCenter.syncNow("a1", ProviderId.HEALTH_CONNECT)
        telemetryContainer.privacy.shareWithCoach(
            athleteId = "a1",
            coachId = "coach-1",
            metrics = setOf(
                MetricType.HRV,
                MetricType.SLEEP,
                MetricType.RECOVERY,
                MetricType.RESTING_HEART_RATE,
                MetricType.TRAINING_LOAD,
            ),
            actorId = "a1",
        )
        val bridge = telemetryContainer.sportsBridge
        bridge.recentWorkouts(athleteId, days = 14).forEach { workout ->
            val sportId = sportsContainer.registry.discover(workout.sportKey).firstOrNull()?.id ?: return@forEach
            bridge.sessionMetrics(athleteId, workout).forEach { (metric, value) ->
                sportsContainer.metrics.record(
                    MetricSample(
                        sportId = sportId,
                        key = metric.name.lowercase(),
                        value = value,
                        recordedAtEpochMs = workout.start.epochMs,
                        source = "telemetry",
                    ),
                )
            }
        }
    }
}
