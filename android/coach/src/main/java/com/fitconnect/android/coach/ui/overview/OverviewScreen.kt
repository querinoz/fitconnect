package com.fitconnect.android.coach.ui.overview

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.platform.testTag
import androidx.compose.runtime.collectAsState
import com.fitconnect.android.coach.domain.CoachOverview
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteZenithHeader
import com.fitconnect.android.designui.components.HexBadge
import com.fitconnect.android.designui.components.HexBadgeTone
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun OverviewScreen(
    onOpenAthletes: () -> Unit,
    onOpenCalendar: () -> Unit,
    onOpenInbox: () -> Unit,
    onOpenBookings: () -> Unit,
    onOpenPrograms: () -> Unit,
    onOpenAnalytics: () -> Unit,
    onOpenRevenue: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenSession: (String) -> Unit,
    onOpenAthlete: (String) -> Unit,
) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<CoachOverview>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.overview() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_overview")
        reload()
        container.platform.productRealtime.start()
    }

    CoachLoad(result, ::reload) { home ->
        val attentionCount = home.athletesNeedingAttention.size
        CoachScreenScaffold(
            title = home.greeting,
            subtitle = "Squad command center",
            overline = "COACH OS",
            testTag = "coach_overview",
            showTitle = false,
        ) {
            item {
                val link by container.platform.productRealtime.linkState.collectAsState()
                EosPremiumCard {
                    EliteStack(spacing = EliteSpace.Md) {
                        EliteZenithHeader(
                            sysLabel = "CURRENT EXPERIENCE · COACH",
                            title = home.greeting,
                            subtitle = "What needs you now — then today's sessions.",
                            badge = {
                                HexBadge(
                                    text = home.pendingBookings.coerceAtMost(99).toString().padStart(2, '0'),
                                    tone = HexBadgeTone.Volt,
                                )
                            },
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                        ) {
                            HexStatus("REALTIME ${link.name}")
                            HexStatus("${home.upcomingSessions.size} upcoming")
                        }
                    }
                }
            }
            item {
                EosPremiumCard(modifier = Modifier.testTag("coach_what_now")) {
                    EliteStack(spacing = EliteSpace.Sm) {
                        com.fitconnect.android.designui.components.EliteSysLabel("WHAT NOW")
                        Text(
                            text = when {
                                attentionCount > 0 ->
                                    "$attentionCount athlete${if (attentionCount == 1) "" else "s"} need attention"
                                home.pendingBookings > 0 ->
                                    "${home.pendingBookings} booking${if (home.pendingBookings == 1) "" else "s"} pending"
                                home.unreadMessages > 0 ->
                                    "${home.unreadMessages} unread message${if (home.unreadMessages == 1) "" else "s"}"
                                else -> "Squad stable — no urgent flags"
                            },
                            style = MaterialTheme.typography.headlineSmall,
                        )
                        Text(
                            text = when {
                                attentionCount > 0 -> "Review recovery risk before today's sessions."
                                home.pendingBookings > 0 -> "Confirm or reschedule pending bookings."
                                home.unreadMessages > 0 -> "Clear inbox signals so athletes stay unblocked."
                                else -> "Use the agenda below to stay ahead of the day."
                            },
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteButton(
                                label = when {
                                    attentionCount > 0 -> "REVIEW ATHLETES"
                                    home.pendingBookings > 0 -> "OPEN BOOKINGS"
                                    home.unreadMessages > 0 -> "OPEN INBOX"
                                    else -> "OPEN CALENDAR"
                                },
                                onClick = {
                                    when {
                                        attentionCount > 0 -> onOpenAthletes()
                                        home.pendingBookings > 0 -> onOpenBookings()
                                        home.unreadMessages > 0 -> onOpenInbox()
                                        else -> onOpenCalendar()
                                    }
                                },
                                variant = EliteButtonVariant.Primary,
                                modifier = Modifier.weight(1f),
                            )
                            EliteButton(
                                label = "SESSIONS",
                                onClick = onOpenCalendar,
                                variant = EliteButtonVariant.Secondary,
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }
                }
            }
            item {
                EliteStack(spacing = EliteSpace.Sm) {
                    com.fitconnect.android.designui.components.EliteSectionHeader(
                        title = "Squad KPIs",
                        overline = "SIGNAL",
                    )
                    EliteMetricCard(label = "Attention", value = "$attentionCount")
                    EliteMetricCard(label = "Bookings", value = "${home.pendingBookings}")
                    EliteMetricCard(label = "Inbox", value = "${home.unreadMessages}")
                    EliteMetricCard(label = "Revenue", value = "€${home.revenueSummaryCents / 100}")
                }
            }
            item {
                EosPremiumCard {
                    com.fitconnect.android.designui.components.EliteSectionHeader(
                        title = "AI command brief",
                        overline = "SYS.AI",
                    )
                    Text(home.aiSummary, style = MaterialTheme.typography.bodyLarge)
                    HexStatus("BRIEFING READY")
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(title = "Today's agenda", overline = "LIVE")
            }
            items(home.agenda, key = { it.id }) { event ->
                EliteCard(onClick = { event.sessionId?.let(onOpenSession) }) {
                    Text(event.title, style = MaterialTheme.typography.titleMedium)
                    HexStatus(if (event.conflict) "CONFLICT" else "ON SCHEDULE")
                    if (event.conflict) {
                        Text("Conflict · travel ${event.travelMinutes}m", color = MaterialTheme.colorScheme.error)
                    }
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(title = "Upcoming sessions", overline = "DEPLOY")
            }
            items(home.upcomingSessions, key = { it.id }) { session ->
                EliteCard(onClick = { onOpenSession(session.id) }) {
                    Text(session.title, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "${session.athleteNames.joinToString()} · ${session.kind} · ${session.durationMin}m",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    HexStatus("DEPLOY ${session.durationMin}m")
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(
                    title = "Athletes requiring attention",
                    overline = "ALERT",
                )
            }
            items(home.athletesNeedingAttention, key = { it.id }) { athlete ->
                EliteCard(onClick = { onOpenAthlete(athlete.id) }) {
                    Text(athlete.displayName, style = MaterialTheme.typography.titleMedium)
                    Text("Recovery ${athlete.recovery} · ${athlete.status}", color = MaterialTheme.colorScheme.error)
                    HexStatus("AT RISK")
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(title = "Recovery alerts", overline = "PHYSIO")
            }
            items(home.recoveryAlerts) { alert ->
                EliteCard(variant = EliteCardVariant.Metric) {
                    Text(alert, style = MaterialTheme.typography.bodyLarge)
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(title = "Quick actions", overline = "NAV")
            }
            item {
                EliteFlowRow {
                    home.quickActions.take(3).forEach { action ->
                        EliteChip(
                            label = action,
                            contentDescription = "Coach action $action",
                            onClick = {
                                when {
                                    action.contains("program", true) -> onOpenPrograms()
                                    action.contains("booking", true) -> onOpenBookings()
                                    action.contains("calendar", true) -> onOpenCalendar()
                                    action.contains("message", true) -> onOpenInbox()
                                    else -> onOpenNotifications()
                                }
                            },
                        )
                    }
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(title = "Live activity", overline = "FEED")
            }
            items(home.liveFeed, key = { it.id }) { feed ->
                EliteCard(variant = EliteCardVariant.Glass) {
                    Text(feed.text, style = MaterialTheme.typography.bodyLarge)
                    HexStatus("LIVE")
                }
            }
            item {
                EliteFlowRow {
                    EliteButton(
                        label = "Athletes",
                        onClick = onOpenAthletes,
                        variant = EliteButtonVariant.Secondary,
                        contentDescription = "Open Athletes roster",
                    )
                    EliteButton(
                        label = "Analytics",
                        onClick = onOpenAnalytics,
                        variant = EliteButtonVariant.Ghost,
                        contentDescription = "Open Analytics",
                    )
                    EliteButton(
                        label = "Revenue",
                        onClick = onOpenRevenue,
                        variant = EliteButtonVariant.Ghost,
                        contentDescription = "Open Revenue",
                    )
                }
            }
            item { LiveSquadCard() }
            item { SquadAscendCard() }
        }
    }
}

@Composable
private fun SquadAscendCard() {
    val container = LocalCoachContainer.current
    val squad = remember {
        container.ascend.joinChallenge("ath-1", "squad-fc-week")
        container.ascend.squadChallenge(
            "squad-fc-week",
            listOf("ath-1", com.fitconnect.ascend.demo.AscendDemo.INES, com.fitconnect.ascend.demo.AscendDemo.MARINA),
        )
    }
    EliteCard(variant = EliteCardVariant.Glass, modifier = Modifier.testTag("coach_squad_challenge")) {
        EliteStack(spacing = EliteSpace.Md) {
            com.fitconnect.android.designui.components.EliteSectionHeader(
                title = "FC PERFORMANCE WEEK",
                overline = "SQUAD CHALLENGE",
            )
            if (squad == null) {
                Text("No squad protocol active.", style = MaterialTheme.typography.bodyMedium)
            } else {
                Text(
                    "TARGET  ${(squad.target / 1000.0)} KM",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    "TEAM PROGRESS  ${"%.1f".format(squad.progress / 1000.0)} / ${"%.0f".format(squad.target / 1000.0)} KM",
                    style = MaterialTheme.typography.bodyLarge,
                )
                squad.contributions.forEach { (athlete, meters) ->
                    Text(
                        "$athlete · ${"%.1f".format(meters / 1000.0)} km contribution",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                Text(
                    "Recovery distribution is protected. This is participation, not a humiliation ranking. LOCAL_DEMO.",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

@Composable
private fun LiveSquadCard() {
    val container = LocalCoachContainer.current
    val envelope by container.telemetry.wearInbox.lastEnvelope.collectAsState()
    var companion by remember { mutableStateOf(com.fitconnect.android.telemetry.wear.WearCompanionState.NOT_PAIRED) }
    var locationAllowed by remember { mutableStateOf(false) }
    LaunchedEffect(envelope?.userId) {
        companion = container.telemetry.wearCompanion.state()
        val coachId = container.platform.sessionStore.snapshot().userId
        val athleteId = envelope?.userId
        locationAllowed = if (!coachId.isNullOrBlank() && !athleteId.isNullOrBlank()) {
            container.telemetry.privacy.coachMayRead(
                coachId = coachId,
                athleteId = athleteId,
                metric = com.fitconnect.android.telemetry.domain.MetricType.LOCATION,
            )
        } else {
            false
        }
    }
    EliteCard(variant = EliteCardVariant.Glass, modifier = Modifier) {
        EliteStack(spacing = EliteSpace.Md) {
            com.fitconnect.android.designui.components.EliteSectionHeader(
                title = "LIVE SQUAD",
                overline = "WATCH",
            )
            EliteBadge(text = companion.name)
            Text(
                "Connection is never faked. CONNECTED requires a reachable FitConnect Wear node.",
                style = MaterialTheme.typography.bodySmall,
            )
            if (envelope == null) {
                Text("ATHLETE · OFFLINE · no live session packet", style = MaterialTheme.typography.bodyMedium)
            } else {
                Text("ATHLETE · ${envelope?.userId} · session ${envelope?.sessionId}")
                envelope?.samples?.firstOrNull { it.metric == "HEART_RATE" }?.let { hr ->
                    Text("HR ${hr.value?.toInt() ?: hr.availability.name}")
                }
            }
            if (!locationAllowed) {
                Text(
                    "Location sharing off. Coach map stays empty until the athlete grants COACH_SHARING.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                )
            } else {
                val lat = envelope?.samples?.firstOrNull { it.metric == "LATITUDE" }?.value
                val lon = envelope?.samples?.firstOrNull { it.metric == "LONGITUDE" }?.value
                Text("Live map ${lat ?: "—"}, ${lon ?: "—"}")
            }
        }
    }
}
