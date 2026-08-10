package com.fitconnect.android.coach.ui.programs

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
import com.fitconnect.android.coach.domain.CoachProgram
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun ProgramsScreen(onOpenBuilder: (String) -> Unit) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<List<CoachProgram>>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.programs() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_programs")
        reload()
    }

    CoachLoad(result, ::reload) { programs ->
        CoachScreenScaffold(
            title = "Programs & plans",
            subtitle = "Templates · drafts · publish · clone · builder",
            testTag = "coach_programs",
        ) {
            items(programs, key = { it.id }) { program ->
                EliteCard(onClick = { onOpenBuilder(program.id) }) {
                    Text(program.title, style = MaterialTheme.typography.titleLarge)
                    Text(
                        "${program.state} · v${program.version} · ${program.weeks}w · ${program.cycles} cycles" +
                            if (program.template) " · template" else "",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                        content = {
                            EliteButton(
                                label = "Clone",
                                variant = EliteButtonVariant.Secondary,
                                onClick = {
                                    scope.launch {
                                        container.coachRepository.cloneProgram(program.id)
                                        reload()
                                    }
                                },
                            )
                            EliteButton(
                                label = "Open builder",
                                variant = EliteButtonVariant.Ghost,
                                onClick = { onOpenBuilder(program.id) },
                            )
                        },
                    )
                }
            }
        }
    }
}

@Composable
fun ProgramBuilderScreen(programId: String) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<CoachProgram>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.program(programId) } }
    LaunchedEffect(programId) {
        container.platform.analytics.screen("coach_program_builder")
        reload()
    }

    CoachLoad(result, ::reload) { program ->
        CoachScreenScaffold(
            title = program.title,
            subtitle = "Weeks · cycles · warmup · exercises · supersets · intervals · media",
            testTag = "coach_program_builder",
        ) {
            item {
                Text(
                    "State ${program.state} · version ${program.version}",
                    style = MaterialTheme.typography.titleMedium,
                )
            }
            items(program.blocks, key = { it.id }) { block ->
                EliteCard {
                    Text("Week ${block.week} · ${block.dayLabel} · ${block.title}", style = MaterialTheme.typography.titleMedium)
                    Text("Warmup", style = MaterialTheme.typography.labelLarge)
                    block.warmup.forEach { Text("· $it", style = MaterialTheme.typography.bodyMedium) }
                    Text("Exercises", style = MaterialTheme.typography.labelLarge)
                    block.exercises.forEach { ex ->
                        Text(
                            buildString {
                                append(ex.name)
                                append(" — ")
                                append(ex.detail)
                                if (ex.isSuperset) append(" · superset")
                                ex.interval?.let { append(" · interval $it") }
                                if (ex.restSec > 0) append(" · rest ${ex.restSec}s")
                            },
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                    Text("Cooldown", style = MaterialTheme.typography.labelLarge)
                    block.cooldown.forEach { Text("· $it", style = MaterialTheme.typography.bodyMedium) }
                    block.notes?.let {
                        Text("Notes: $it", style = MaterialTheme.typography.bodyMedium)
                    }
                    if (block.attachments.isNotEmpty()) {
                        Text("Attachments: ${block.attachments.joinToString()}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            item {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                    content = {
                        EliteButton(
                            label = "Publish",
                            onClick = {
                                scope.launch {
                                    container.coachRepository.publishProgram(program.id)
                                    reload()
                                }
                            },
                        )
                        EliteButton(
                            label = "Save draft",
                            variant = EliteButtonVariant.Secondary,
                            onClick = {
                                scope.launch {
                                    container.coachRepository.setProgramDraft(program.id)
                                    reload()
                                }
                            },
                        )
                        EliteButton(
                            label = "Clone",
                            variant = EliteButtonVariant.Ghost,
                            onClick = {
                                scope.launch { container.coachRepository.cloneProgram(program.id) }
                            },
                        )
                    },
                )
            }
            item {
                Text(
                    "Version history: current v${program.version}. Each publish increments version.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
