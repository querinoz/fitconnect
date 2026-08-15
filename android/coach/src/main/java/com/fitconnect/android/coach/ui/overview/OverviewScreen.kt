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
import com.fitconnect.android.coach.domain.CoachOverview
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.components.EliteStack
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
    }

    CoachLoad(result, ::reload) { home ->
        CoachScreenScaffold(
            title = home.greeting,
            subtitle = "Squad command center · LOCAL_DEMO",
            overline = "COACH OS · COMMAND",
            testTag = "coach_overview",
        ) {
            item {
                EliteCard(variant = EliteCardVariant.Glass) {
                    com.fitconnect.android.designui.components.EliteSectionHeader(
                        title = "AI command brief",
                        overline = "SYS.AI",
                    )
                    Text(home.aiSummary, style = MaterialTheme.typography.bodyLarge)
                }
            }
            item {
                EliteStack {
                    com.fitconnect.android.designui.components.EliteSectionHeader(
                        title = "Squad signals",
                        overline = "KPI",
                    )
                    EliteMetricCard(label = "Unread", value = "${home.unreadMessages}")
                    EliteMetricCard(label = "Bookings", value = "${home.pendingBookings}")
                    EliteMetricCard(label = "Revenue", value = "€${home.revenueSummaryCents / 100}")
                }
            }
            item {
                EliteStack {
                com.fitconnect.android.designui.components.EliteSectionHeader(
                    title = "Readiness heatmap",
                    overline = "ROSTER",
                )
                EliteCard(variant = EliteCardVariant.Metric) {
                    home.athletesNeedingAttention.take(6).forEach { athlete ->
                        val tone = when {
                            athlete.recovery >= 75 -> MaterialTheme.colorScheme.secondary
                            athlete.recovery >= 50 -> MaterialTheme.colorScheme.primary
                            else -> MaterialTheme.colorScheme.error
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text(athlete.displayName, style = MaterialTheme.typography.bodyLarge)
                            Text(
                                "${athlete.recovery}",
                                style = com.fitconnect.android.designui.theme.EliteMonoTextStyle,
                                color = tone,
                            )
                        }
                    }
                    if (home.athletesNeedingAttention.isEmpty()) {
                        Text("Squad stable — no attention flags", style = MaterialTheme.typography.bodyMedium)
                    }
                }
                }
            }
            item {
                EliteStack {
                    home.weeklyMetrics.forEach { (k, v) ->
                        Text(
                            "$k · ${v.toInt()}",
                            style = com.fitconnect.android.designui.theme.EliteMonoTextStyle,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(title = "Today's agenda", overline = "LIVE")
            }
            items(home.agenda, key = { it.id }) { event ->
                EliteCard(onClick = { event.sessionId?.let(onOpenSession) }) {
                    Text(event.title, style = MaterialTheme.typography.titleMedium)
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
                        EliteChip(label = action, onClick = {
                            when {
                                action.contains("program", true) -> onOpenPrograms()
                                action.contains("booking", true) -> onOpenBookings()
                                action.contains("calendar", true) -> onOpenCalendar()
                                action.contains("message", true) -> onOpenInbox()
                                else -> onOpenNotifications()
                            }
                        })
                    }
                }
            }
            item {
                com.fitconnect.android.designui.components.EliteSectionHeader(title = "Live activity", overline = "FEED")
            }
            items(home.liveFeed, key = { it.id }) { feed ->
                Text(feed.text, style = MaterialTheme.typography.bodyMedium)
            }
            item {
                EliteFlowRow {
                    EliteButton("Athletes", onClick = onOpenAthletes, variant = EliteButtonVariant.Secondary)
                    EliteButton("Analytics", onClick = onOpenAnalytics, variant = EliteButtonVariant.Ghost)
                    EliteButton("Revenue", onClick = onOpenRevenue, variant = EliteButtonVariant.Ghost)
                }
            }
        }
    }
}
