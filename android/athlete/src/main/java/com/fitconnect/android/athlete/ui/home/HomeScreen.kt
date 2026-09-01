package com.fitconnect.android.athlete.ui.home

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import com.fitconnect.android.athlete.demo.AthleteContentResolver
import com.fitconnect.android.athlete.demo.AthleteDemoBanner
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.TodayReadinessUi
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteAiFab
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.healthconnect.HealthConnectIntents
import com.fitconnect.android.fitness.healthconnect.HealthConnectPermissionState
import com.fitconnect.android.fitness.healthconnect.HealthConnectSdkMapper
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.ascend.domain.StreakKind
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
    var recentSessions by remember { mutableStateOf<List<TodaySessionCardUi>>(emptyList()) }

    suspend fun loadSessions(includeDemoFallback: Boolean) {
        val workouts = container.fitness.workoutStore.listOwn(LocalAthleteRepository.ATHLETE_ID)
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
                todayUi = AthleteContentResolver.todayReadiness(
                    athleteId = LocalAthleteRepository.ATHLETE_ID,
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
        athleteLabel = (container.athleteRepository.profile() as? AppResult.Ok)
            ?.value
            ?.displayName
            ?.uppercase()
        reload()
    }

    AthleteLoad(result = result, onRetry = ::reload) { home ->
        val ascend = container.ascend.snapshot(LocalAthleteRepository.ATHLETE_ID)
        val streak = ascend.streaks.firstOrNull { it.kind == StreakKind.PERFORMANCE }
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
                    loadSessions(sessionLocalDemo || todayUi?.isAnyDemo != false)
                }
            }
        }
        val readinessUi = todayUi
        AthleteScreenScaffold(
            title = home.greeting,
            subtitle = "Performance cockpit",
            overline = "ATHLETE OS · TODAY",
            testTag = "athlete_home",
            showTitle = false,
            floating = { EliteAiFab(onClick = onOpenAi) },
        ) {
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
                TodayEditorialHeader(
                    greeting = home.greeting,
                    showDemoBadge = sessionLocalDemo || readinessUi?.isAnyDemo == true,
                )
            }
            streak?.let { active ->
                if (active.days > 0) {
                    item {
                        TodayStreakBar(days = active.days)
                    }
                }
            }
            item {
                AthleteDemoBanner(
                    visible = sessionLocalDemo || readinessUi?.isAnyDemo == true,
                )
            }
            readinessUi?.let { ui ->
                item {
                    TodayReadinessPanel(
                        ui = ui,
                        athleteLabel = athleteLabel,
                    )
                }
                item {
                    TodayMetricStrip(
                        hrvMs = ui.hrvMs,
                        sleepLabel = ui.sleepLabel,
                        steps = ui.steps,
                        load = ui.load,
                    )
                }
            }
            item {
                TodayCompactAiCta(
                    body = home.readiness.recommendation,
                    actionLabel = "Start session",
                    onAction = onOpenActivity,
                )
            }
            item {
                TodaySessionCarousel(
                    sessions = recentSessions,
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
            if (home.readiness.warnings.isNotEmpty()) {
                item {
                    EliteCard(variant = EliteCardVariant.Metric) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                            EliteSysLabel("ALERTS")
                            home.readiness.warnings.forEach { warning ->
                                Text(warning, color = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }
    }
}
