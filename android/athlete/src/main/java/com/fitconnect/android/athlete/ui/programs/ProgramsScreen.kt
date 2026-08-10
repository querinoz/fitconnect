package com.fitconnect.android.athlete.ui.programs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.domain.ProgramEnrollment
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteProgress
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun ProgramsScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<List<ProgramEnrollment>>?>(null) }
    var expandedId by remember { mutableStateOf<String?>(null) }
    var status by remember { mutableStateOf<String?>(null) }
    fun reload() { scope.launch { result = container.athleteRepository.programs() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_programs")
        reload()
    }

    AthleteLoad(result, ::reload) { programs ->
        AthleteScreenScaffold(
            title = "Programs",
            subtitle = "List · detail · week · enroll · progress",
            testTag = "athlete_programs",
        ) {
            status?.let { msg ->
                item { Text(msg, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary) }
            }
            if (programs.isEmpty()) {
                item {
                    EliteCard {
                        Text("No programs enrolled yet", style = MaterialTheme.typography.bodyLarge)
                    }
                }
            }
            items(programs, key = { it.id }) { program ->
                val expanded = expandedId == program.id
                EliteCard(
                    onClick = { expandedId = if (expanded) null else program.id },
                    modifier = Modifier.testTag("program_card_${program.id}"),
                ) {
                    Text(program.title, style = MaterialTheme.typography.titleLarge)
                    Text(
                        "Week ${program.currentWeek} / ${program.totalWeeks}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    EliteProgress(progress = program.progressPercent / 100f)
                    Text("Next: ${program.nextWorkoutTitle}", style = MaterialTheme.typography.bodyLarge)
                    if (expanded) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                            Text("Program detail", style = MaterialTheme.typography.titleMedium)
                            Text(
                                "Progress ${program.progressPercent}% · complete when week ${program.totalWeeks} finishes.",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text("Milestones", style = MaterialTheme.typography.titleMedium)
                            program.milestones.forEach {
                                Text("· $it", style = MaterialTheme.typography.bodyMedium)
                            }
                            Text("Workout focus", style = MaterialTheme.typography.titleMedium)
                            Text(program.nextWorkoutTitle, style = MaterialTheme.typography.bodyLarge)
                            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                                EliteButton(
                                    label = "Enroll / sync",
                                    onClick = {
                                        scope.launch {
                                            container.athleteRepository.enrollProgram(program.id)
                                            status = "Enrollment synced · ${program.id}"
                                            reload()
                                        }
                                    },
                                )
                                EliteButton(
                                    label = "Collapse",
                                    variant = EliteButtonVariant.Ghost,
                                    onClick = { expandedId = null },
                                )
                            }
                        }
                    } else {
                        EliteButton(
                            label = "Open detail",
                            variant = EliteButtonVariant.Secondary,
                            onClick = { expandedId = program.id },
                        )
                    }
                }
            }
        }
    }
}
