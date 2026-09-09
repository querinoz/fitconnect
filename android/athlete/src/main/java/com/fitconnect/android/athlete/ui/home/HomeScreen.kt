package com.fitconnect.android.athlete.ui.home

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.health.connect.client.PermissionController
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.data.canonicalAthleteId
import com.fitconnect.android.athlete.demo.AthleteContentResolver
import com.fitconnect.android.athlete.demo.AthleteDemoBanner
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.TodayReadinessUi
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTelemetryInsight
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.healthconnect.HealthConnectIntents
import com.fitconnect.android.fitness.healthconnect.HealthConnectPermissionState
import com.fitconnect.android.fitness.healthconnect.HealthConnectSdkMapper
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.navigation.identityBadgeLabel
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    onOpenRecovery: () -> Unit,
    onOpenTraining: () -> Unit,
    onOpenSession: (String) -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenPrograms: () -> Unit,
    onOpenSports: () -> Unit,
    onOpenAi: () -> Unit = {},
    onOpenCommunity: () -> Unit = {},
    onOpenProfile: () -> Unit = {},
    onOpenDiscover: () -> Unit = {},
    onOpenActivity: () -> Unit = {},
    onOpenSleep: () -> Unit = {},
    onOpenDaily: () -> Unit = {},
    onOpenVault: () -> Unit = {},
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<HomeSnapshot>?>(null) }
    var todayUi by remember { mutableStateOf<TodayReadinessUi?>(null) }
    var athleteLabel by remember { mutableStateOf<String?>(null) }
    var sessionLocalDemo by remember { mutableStateOf(false) }
    var athleteId by remember { mutableStateOf(LocalAthleteRepository.ATHLETE_ID) }
    var recentSessions by remember { mutableStateOf<List<TodaySessionCardUi>>(emptyList()) }

    suspend fun loadSessions(includeDemoFallback: Boolean) {
        val uid = container.platform.sessionStore.canonicalAthleteId()
        athleteId = uid
        val workouts = container.fitness.workoutStore.listOwn(uid)
        recentSessions = TodaySessionResolver.resolve(
            workouts = workouts,
            includeDemoFallback = includeDemoFallback,
        )
    }

    fun reload() {
        scope.launch {
            val homeResult = container.athleteRepository.home()
            result = homeResult
            if (homeResult is AppResult.Ok) {
                val uid = container.platform.sessionStore.canonicalAthleteId()
                athleteId = uid
                todayUi = AthleteContentResolver.todayReadiness(
                    athleteId = uid,
                    home = homeResult.value,
                    telemetry = container.telemetry.athleteFacade,
                )
                loadSessions(sessionLocalDemo || todayUi?.isAnyDemo != false)
            }
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_home")
        sessionLocalDemo = container.platform.sessionStore.snapshot().isLocalDemo
        athleteId = container.platform.sessionStore.canonicalAthleteId()
        athleteLabel = (container.athleteRepository.profile() as? AppResult.Ok)
            ?.value
            ?.displayName
            ?.uppercase()
        reload()
        container.platform.productRealtime.start()
    }

    AthleteLoad(result = result, onRetry = ::reload) { home ->
        val context = LocalContext.current
        val hcScope = rememberCoroutineScope()
        val hcState = HealthConnectSdkMapper.probe(context)
        var permissionState by remember {
            mutableStateOf(HealthConnectPermissionState.SDK_NOT_READY)
        }
        LaunchedEffect(hcState) {
            permissionState = container.fitness.healthConnectPermissions.permissionState()
            if (hcState == HealthConnectSdkState.AVAILABLE &&
                permissionState == HealthConnectPermissionState.GRANTED
            ) {
                container.fitness.syncHealthConnect()
                val uid = container.platform.sessionStore.canonicalAthleteId()
                athleteId = uid
                container.telemetry.healthData.syncSleepAndSteps(
                    athleteId = uid,
                    nowEpochMs = System.currentTimeMillis(),
                )
                loadSessions(sessionLocalDemo || todayUi?.isAnyDemo != false)
            }
        }
        val permissionLauncher = rememberLauncherForActivityResult(
            PermissionController.createRequestPermissionResultContract(),
        ) {
            hcScope.launch {
                permissionState = container.fitness.healthConnectPermissions.permissionState()
                if (permissionState == HealthConnectPermissionState.GRANTED) {
                    container.fitness.syncHealthConnect()
                    val uid = container.platform.sessionStore.canonicalAthleteId()
                    athleteId = uid
                    container.telemetry.healthData.syncSleepAndSteps(
                        athleteId = uid,
                        nowEpochMs = System.currentTimeMillis(),
                    )
                    loadSessions(sessionLocalDemo || todayUi?.isAnyDemo != false)
                }
            }
        }
        val readinessUi = todayUi
        AthleteScreenScaffold(
            title = home.greeting,
            subtitle = "How you are · what to do · what changed",
            overline = "TODAY",
            testTag = "athlete_home",
            showTitle = false,
            floating = null,
        ) {
            item {
                TodayEditorialHeader(
                    greeting = home.greeting,
                    identityBadge = if (container.platform.config.visualQaChromeDiet) {
                        null
                    } else {
                        identityBadgeLabel(
                            isDebugBuild = container.platform.config.isDebuggable,
                            isLocalDemoSession = sessionLocalDemo,
                        )
                    },
                    onNotifications = onOpenNotifications,
                )
            }
            readinessUi?.let { ui ->
                if (home.readiness.warnings.isNotEmpty()) {
                    item {
                        EliteCard(variant = EliteCardVariant.Metric) {
                            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                                EliteSysLabel("NEEDS ATTENTION")
                                home.readiness.warnings.forEach { warning ->
                                    Text(warning, color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                }
                item {
                    TodayDualRingSection(
                        readinessPercent = ui.readinessPercent.value,
                        loadNormalized = ui.load.value,
                        readinessStatus = if (ui.readinessPercent.value >= 70) "STATUS: EXCELLENT" else "STATUS: BUILD",
                        loadStatus = if (ui.load.value <= 0.8f) "LOAD: OPTIMAL" else "LOAD: HIGH",
                        recoveryCaption = "RECOVERY: ${ui.sleepLabel.value.ifBlank { "—" }}",
                        activityCaption = if (ui.load.value >= 0.7f) "ACTIVITY: HIGH" else "ACTIVITY: STEADY",
                    )
                }
                item {
                    val readiness = ui.readinessPercent.value.coerceIn(0, 100)
                    EliteTelemetryInsight(
                        label = "READINESS",
                        value = "$readiness",
                        unit = "/100",
                        trend = home.readiness.recommendation.takeIf { it.isNotBlank() },
                        context = "Sleep ${ui.sleepLabel.value.ifBlank { "—" }} · load ${(ui.load.value * 100).toInt()}%",
                        insight = when {
                            readiness >= 70 -> "Recovery supports high-intensity training today."
                            readiness >= 45 -> "Keep intensity moderate; prioritize quality over volume."
                            else -> "Favor recovery and mobility before hard sessions."
                        },
                        demo = ui.isAnyDemo,
                        actionLabel = "Open recovery",
                        onAction = onOpenRecovery,
                    )
                }
            }
            item {
                TodaySessionHeroSection(
                    session = recentSessions.firstOrNull(),
                    recommendation = home.readiness.recommendation,
                    onStart = onOpenActivity,
                    onOpenSession = { sessionId ->
                        if (sessionId.startsWith("demo:")) {
                            onOpenActivity()
                        } else {
                            onOpenSession(sessionId)
                        }
                    },
                )
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(
                        label = "TRAIN",
                        onClick = onOpenActivity,
                        variant = EliteButtonVariant.Primary,
                        modifier = Modifier.weight(1f),
                    )
                    EliteButton(
                        label = "PROGRAMS",
                        onClick = onOpenPrograms,
                        variant = EliteButtonVariant.Secondary,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            if (!container.platform.config.visualQaChromeDiet) {
                if (hcState != HealthConnectSdkState.AVAILABLE) {
                    item {
                        HealthConnectStatusCard(
                            state = hcState,
                            onAction = { HealthConnectIntents.openInstallOrUpdate(context, hcState) },
                        )
                    }
                } else if (permissionState != HealthConnectPermissionState.GRANTED) {
                    item {
                        HealthConnectPermissionCard(
                            permissionState = permissionState,
                            onRequestPermissions = {
                                permissionLauncher.launch(
                                    container.fitness.healthConnectPermissions.onboardingPermissions(),
                                )
                            },
                            onOpenSettings = { HealthConnectIntents.openManageData(context) },
                        )
                    }
                }
                item {
                    AthleteDemoBanner(
                        visible = sessionLocalDemo || readinessUi?.isAnyDemo == true,
                    )
                }
            }
            if (recentSessions.size > 1) {
                item {
                    TodaySessionCarousel(
                        sessions = recentSessions.drop(1),
                        onSessionClick = { sessionId ->
                            if (sessionId.startsWith("demo:")) {
                                onOpenActivity()
                            } else {
                                onOpenSession(sessionId)
                            }
                        },
                        onSeeAll = onOpenActivity,
                    )
                }
            }
        }
    }
}
