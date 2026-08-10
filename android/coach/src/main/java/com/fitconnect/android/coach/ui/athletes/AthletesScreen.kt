package com.fitconnect.android.coach.ui.athletes

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
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
import com.fitconnect.android.coach.domain.AthleteStatus
import com.fitconnect.android.coach.domain.RosterAthlete
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.ElitePersonCard
import com.fitconnect.android.designui.components.EliteSwitch
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun AthletesScreen(onOpenAthlete: (String) -> Unit) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }
    var tag by remember { mutableStateOf("") }
    var group by remember { mutableStateOf("") }
    var favoritesOnly by remember { mutableStateOf(false) }
    var atRiskOnly by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<AppResult<List<RosterAthlete>>?>(null) }

    fun reload() {
        scope.launch {
            result = container.coachRepository.roster(
                query = query.ifBlank { null },
                tag = tag.ifBlank { null },
                group = group.ifBlank { null },
                favoritesOnly = favoritesOnly,
                status = if (atRiskOnly) AthleteStatus.AT_RISK else null,
            )
        }
    }

    LaunchedEffect(query, tag, group, favoritesOnly, atRiskOnly) {
        container.platform.analytics.screen("coach_athletes")
        reload()
    }

    CoachLoad(result, ::reload) { athletes ->
        CoachScreenScaffold(
            title = "Athletes",
            subtitle = "Search · filters · tags · groups · teams · status",
            testTag = "coach_athletes",
        ) {
            item {
                EliteTextField(value = query, onValueChange = { query = it }, label = "Search")
                EliteTextField(value = tag, onValueChange = { tag = it }, label = "Tag")
                Row(
                    horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
                    content = {
                        EliteSwitch(checked = favoritesOnly, onCheckedChange = { favoritesOnly = it })
                        Text("Favorites", style = MaterialTheme.typography.bodyLarge)
                        EliteSwitch(checked = atRiskOnly, onCheckedChange = { atRiskOnly = it })
                        Text("At risk", style = MaterialTheme.typography.bodyLarge)
                    },
                )
            }
            items(athletes, key = { it.id }) { athlete ->
                EliteCard(onClick = { onOpenAthlete(athlete.id) }) {
                    ElitePersonCard(
                        title = athlete.displayName + if (athlete.favorite) " ★" else "",
                        subtitle = buildString {
                            append(athlete.status.name)
                            append(" · readiness ")
                            append(athlete.readiness)
                            append(" · recovery ")
                            append(athlete.recovery)
                            append(" · attendance ")
                            append(athlete.attendancePercent)
                            append("%")
                            athlete.team?.let { append(" · $it") }
                        },
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
                        content = {
                            athlete.tags.forEach { t ->
                                EliteChip(label = t, onClick = { tag = t })
                            }
                            athlete.groups.forEach { g ->
                                EliteChip(
                                    label = g,
                                    selected = group.equals(g, ignoreCase = true),
                                    onClick = { group = if (group.equals(g, ignoreCase = true)) "" else g },
                                )
                            }
                        },
                    )
                }
            }
        }
    }
}
