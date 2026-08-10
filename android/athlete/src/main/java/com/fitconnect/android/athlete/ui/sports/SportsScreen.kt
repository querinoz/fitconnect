package com.fitconnect.android.athlete.ui.sports

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
import com.fitconnect.android.athlete.domain.AthleteProfile
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.sports.domain.SportId
import kotlinx.coroutines.launch

@Composable
fun SportsScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<AthleteProfile>?>(null) }
    var focusSport by remember { mutableStateOf<SportId?>(null) }
    fun reload() { scope.launch { result = container.athleteRepository.profile() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_sports")
        reload()
    }

    AthleteLoad(result, ::reload) { profile ->
        val engine = container.sportsEngine
        val athleteSports = container.sports.athleteFacade.profile(profile.id)
        val selected = focusSport ?: athleteSports.primarySport
        AthleteScreenScaffold(
            title = "Sports Intelligence",
            subtitle = "Primary ${engine.profile(athleteSports.primarySport).displayName} · season ${athleteSports.seasonLabel ?: "—"}",
            testTag = "athlete_sports",
        ) {
            item { Text("Your sports", style = MaterialTheme.typography.titleMedium) }
            items(profile.sports) { sportId ->
                val sport = engine.profile(sportId)
                EliteCard {
                    Text(sport.displayName, style = MaterialTheme.typography.titleLarge)
                    Text(sport.category.name, style = MaterialTheme.typography.labelLarge)
                    sport.allMetrics().forEach { metric ->
                        Text(
                            "${metric.label} (${metric.unit.ifBlank { "score" }}) · ${metric.kind}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
            item { Text("Personal records", style = MaterialTheme.typography.titleMedium) }
            items(athleteSports.personalRecords.entries.toList()) { (k, v) ->
                Text("$k · $v", style = MaterialTheme.typography.bodyMedium)
            }
            item { Text("Competition calendar", style = MaterialTheme.typography.titleMedium) }
            items(container.sports.athleteFacade.competitionCalendar(profile.id)) { line ->
                Text(line, style = MaterialTheme.typography.bodyMedium)
            }
            item { Text("Registry · inspect sport", style = MaterialTheme.typography.titleMedium) }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    engine.all().take(8).forEach { sport ->
                        EliteChip(
                            label = sport.displayName,
                            selected = selected == sport.id,
                            onClick = { focusSport = sport.id },
                        )
                    }
                }
            }
            item {
                EliteCard {
                    val sport = engine.profile(selected)
                    Text(sport.displayName, style = MaterialTheme.typography.titleLarge)
                    Text(
                        "Category ${sport.category.name} · LOCAL_DEMO metrics catalog",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    sport.allMetrics().take(6).forEach { metric ->
                        Text(
                            "· ${metric.label} (${metric.unit.ifBlank { "score" }})",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }
        }
    }
}
