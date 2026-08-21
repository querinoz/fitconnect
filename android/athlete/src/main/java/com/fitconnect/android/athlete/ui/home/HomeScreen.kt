package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.AscendMissionCard
import com.fitconnect.android.designui.components.AscendStreakCard
import com.fitconnect.android.designui.components.AscendXPBar
import com.fitconnect.android.designui.components.EliteAiDirective
import com.fitconnect.android.designui.components.EliteAiFab
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteBentoCard
import com.fitconnect.android.designui.components.EliteBentoMetric
import com.fitconnect.android.designui.components.EliteBentoRow
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFeedPost
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteLiveDot
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.ElitePrimeInstrument
import com.fitconnect.android.designui.components.EliteSectionHeader
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.eliteDayStrain
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.healthconnect.HealthConnectSdkMapper
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.i18n.AppLocale
import com.fitconnect.ascend.copy.AscendCopy
import com.fitconnect.ascend.domain.MissionKind
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

    var worldPulse by remember { mutableStateOf<List<com.fitconnect.android.community.domain.CommunityPost>>(emptyList()) }
    var worldNames by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var worldAvatars by remember { mutableStateOf<Map<String, String?>>(emptyMap()) }

    fun reload() {
        scope.launch { result = container.athleteRepository.home() }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_home")
        reload()
        container.community.seedIfNeeded()
        val page = container.community.feed.feed(
            com.fitconnect.android.community.feed.FeedRequest(
                viewerId = LocalAthleteRepository.ATHLETE_ID,
                kind = com.fitconnect.android.community.feed.FeedKind.FOLLOWING,
                limit = 3,
            ),
        )
        worldPulse = page.items
        val ids = page.items.map { it.authorId }.distinct()
        worldNames = ids.associateWith { id -> container.community.profiles.get(id)?.displayName ?: id }
        worldAvatars = ids.associateWith { id -> container.community.profiles.get(id)?.avatarUri }
    }

    AthleteLoad(result = result, onRetry = ::reload) { home ->
        val locale by container.platform.localeManager.observe().collectAsState(initial = AppLocale.EN)
        val lang = locale.bcp47
        val ascend = container.ascend.snapshot(LocalAthleteRepository.ATHLETE_ID)
        val t = { key: String -> AscendCopy.t(lang, key) }
        val daily = ascend.missions.firstOrNull { it.kind == MissionKind.DAILY }
        val streak = ascend.streaks.firstOrNull { it.kind == StreakKind.PERFORMANCE }
        val nervous = when {
            home.readiness.recoveryScore >= 75 -> "OPTIMAL"
            home.readiness.recoveryScore >= 50 -> "BALANCED"
            home.readiness.recoveryScore >= 30 -> "CAUTION"
            else -> "STRAIN"
        }
        val strain = eliteDayStrain(home.readiness.score)
        val hcState = HealthConnectSdkMapper.probe(LocalContext.current)
        AthleteScreenScaffold(
            title = home.greeting,
            subtitle = "Performance cockpit · ${DemoPersona.MODE_LABEL}",
            overline = "ATHLETE OS · TODAY",
            testTag = "athlete_home",
            showTitle = false,
            floating = { EliteAiFab(onClick = onOpenAi) },
        ) {
            if (hcState != HealthConnectSdkState.AVAILABLE) {
                item {
                    HealthConnectStatusCard(
                        state = hcState,
                        onAction = onOpenActivity,
                    )
                }
            }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    EliteSysLabel("ATHLETE OS · TODAY")
                    Text(home.greeting, style = MaterialTheme.typography.headlineMedium)
                    EliteBadge(text = DemoPersona.MODE_LABEL)
                }
            }
            item {
                ElitePrimeInstrument(
                    score = home.readiness.recoveryScore,
                    showCaption = false,
                )
            }
            item {
                EliteBentoRow {
                    EliteBentoMetric(
                        label = "HRV",
                        value = "${home.readiness.hrvMs}",
                        unit = "ms",
                        delta = "READINESS ${home.readiness.score}%",
                        modifier = Modifier.weight(1f),
                        onClick = onOpenRecovery,
                    )
                    EliteBentoMetric(
                        label = "DAY STRAIN",
                        value = "%.1f".format(strain),
                        unit = "/ 21",
                        delta = "LOAD ${"%.1f".format(home.readiness.trainingLoad)}",
                        accentVolt = false,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            item {
                EliteBentoMetric(
                    label = "SLEEP",
                    value = "${home.readiness.sleepQuality}",
                    unit = "% quality",
                    delta = nervous,
                    onClick = onOpenSleep,
                )
            }
            item {
                EliteAiDirective(
                    body = home.readiness.recommendation,
                    action = "Start session",
                    onAction = onOpenActivity,
                )
            }
            item {
                EliteBentoCard(onClick = onOpenCommunity) {
                    val squad = remember {
                        container.ascend.joinChallenge(LocalAthleteRepository.ATHLETE_ID, "squad-fc-week")
                        container.ascend.squadChallenge(
                            "squad-fc-week",
                            listOf(
                                LocalAthleteRepository.ATHLETE_ID,
                                com.fitconnect.ascend.demo.AscendDemo.INES,
                                com.fitconnect.ascend.demo.AscendDemo.MARINA,
                            ),
                        )
                    }
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                        EliteLiveDot(live = false, label = "SQUAD · LOCAL_DEMO")
                        Text("FC Performance", style = MaterialTheme.typography.titleLarge)
                        if (squad == null) {
                            Text(
                                "Squad protocol not seeded.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        } else {
                            Text(
                                "${"%.1f".format(squad.progress / 1000.0)} / ${"%.0f".format(squad.target / 1000.0)} km",
                                style = MaterialTheme.typography.bodyLarge,
                            )
                            squad.contributions.entries.take(3).forEach { (athlete, meters) ->
                                Text(
                                    "${athlete.substringBefore("@")} · ${"%.1f".format(meters / 1000.0)} km",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }
                    }
                }
            }
            if (worldPulse.isNotEmpty()) {
                item {
                    EliteSectionHeader(
                        title = "World signal",
                        overline = "LOCAL_DEMO",
                        actionLabel = "SEE ALL",
                        onAction = onOpenCommunity,
                    )
                }
                items(worldPulse, key = { it.id }) { post ->
                    val media = post.media.firstOrNull()
                    EliteFeedPost(
                        authorId = post.authorId,
                        authorName = worldNames[post.authorId] ?: post.authorId,
                        authorInitials = (worldNames[post.authorId] ?: post.authorId)
                            .split(" ")
                            .mapNotNull { it.firstOrNull()?.uppercaseChar()?.toString() }
                            .take(2)
                            .joinToString("")
                            .ifBlank { "FC" },
                        avatarName = worldAvatars[post.authorId],
                        kindLabel = post.kind.name,
                        timeLabel = "LIVE WORLD",
                        body = post.text,
                        imageName = media?.thumbnailUrl ?: media?.localUri,
                        videoRawName = media?.takeIf {
                            it.kind == com.fitconnect.android.community.domain.MediaKind.VIDEO
                        }?.localUri,
                        facts = post.workoutFacts?.takeIf { post.shareTelemetryFacts }?.let { facts ->
                            listOfNotNull(
                                facts.distanceMeters?.let { "KM" to "%.1f".format(it / 1000.0) },
                                "MIN" to facts.durationMinutes.toString(),
                            )
                        }.orEmpty(),
                        compact = true,
                        onReact = {},
                        onClick = onOpenCommunity,
                    )
                }
            }
            daily?.let { mission ->
                item {
                    AscendMissionCard(
                        overline = "TODAY'S PERFORMANCE TARGET",
                        title = t(mission.objectiveKey),
                        progressLabel = "${mission.progress.toInt()} / ${mission.target.toInt()}",
                        why = t(mission.whyKey),
                        progress = (mission.progress / mission.target).toFloat(),
                    )
                }
            }
            item {
                AscendXPBar(
                    rankLabel = t(ascend.level.rank.nameKey),
                    level = ascend.level.level,
                    xpLabel = "${ascend.totalXp} / ${ascend.totalXp + ascend.level.xpToNext} XP",
                    remainingLabel = "+${ascend.level.xpToNext} XP TO NEXT LEVEL",
                    progress = ascend.level.progressPercent / 100f,
                    nextUnlock = ascend.level.nextUnlock?.let { t(it.nameKey) },
                )
            }
            streak?.let { active ->
                item {
                    AscendStreakCard(
                        title = t("ui.streak"),
                        daysLabel = "${active.days}",
                        statusLabel = active.status.name,
                        body = "Recovery days can protect this streak. Rest is part of performance.",
                    )
                }
            }
            item {
                EliteButton(
                    label = t("ui.vault"),
                    variant = EliteButtonVariant.Secondary,
                    onClick = onOpenVault,
                    modifier = Modifier.testTag("home_open_vault"),
                )
            }
            item {
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.READINESS,
                        points = listOf(
                            EliteChartPoint(0f, 70f),
                            EliteChartPoint(1f, 74f),
                            EliteChartPoint(2f, 68f),
                            EliteChartPoint(3f, 80f),
                            EliteChartPoint(4f, home.readiness.score.toFloat()),
                        ),
                        contentDescription = "Readiness trend",
                    ),
                    modifier = Modifier.testTag("athlete_home_readiness_chart"),
                )
            }
            home.nextSession?.let { session ->
                item {
                    EliteCard(onClick = { onOpenSession(session.id) }) {
                        EliteSysLabel("UPCOMING SESSION")
                        Text(session.title, style = MaterialTheme.typography.titleLarge)
                        Text(
                            "${session.sport.value} · ${session.durationMin} min",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
            item {
                EliteStack {
                    EliteMetricCard(
                        label = "Conditions",
                        value = "${home.weather.tempC}°",
                        accent = EliteSurfaceColors.TELEMETRY.toColor(),
                    )
                    Text(home.weather.summary, style = MaterialTheme.typography.bodyMedium)
                }
            }
            home.coachMessage?.let { msg ->
                item {
                    EliteCard(variant = EliteCardVariant.Person) {
                        EliteSysLabel("COACH CHANNEL")
                        Text(msg.from, style = MaterialTheme.typography.titleMedium)
                        Text(msg.preview, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
            item { EliteSectionHeader(title = "Today's plan", overline = "TASKS") }
            items(home.tasks, key = { it.id }) { task ->
                EliteCard(onClick = {
                    scope.launch {
                        container.athleteRepository.toggleTask(task.id)
                        reload()
                    }
                }) {
                    Text(
                        if (task.done) "✓ ${task.title}" else task.title,
                        style = MaterialTheme.typography.bodyLarge,
                    )
                }
            }
            item {
                EliteStack {
                    EliteSectionHeader(title = "Quick actions", overline = "NAV")
                    EliteFlowRow {
                        home.quickActions.take(3).forEach { action ->
                            EliteChip(label = action, onClick = {
                                when {
                                    action.contains("session", true) -> onOpenTraining()
                                    action.contains("readiness", true) -> onOpenRecovery()
                                    action.contains("program", true) -> onOpenPrograms()
                                    else -> onOpenNotifications()
                                }
                            })
                        }
                    }
                }
            }
            item { EliteSectionHeader(title = "Recent activity", overline = "TELEMETRY") }
            items(home.recentActivity) { line ->
                EliteCard(variant = EliteCardVariant.Glass) {
                    Text(line, style = MaterialTheme.typography.bodyLarge)
                }
            }
            item {
                EliteStack {
                    EliteButton(
                        "Start monitoring",
                        onClick = onOpenActivity,
                        modifier = Modifier.testTag("home_start_monitoring"),
                    )
                    EliteChip(label = "Recovery", onClick = onOpenRecovery)
                }
            }
            if (home.readiness.warnings.isNotEmpty()) {
                item {
                    EliteCard(variant = EliteCardVariant.Metric) {
                        EliteSysLabel("ALERTS")
                        home.readiness.warnings.forEach {
                            Text(it, color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }
    }
}
