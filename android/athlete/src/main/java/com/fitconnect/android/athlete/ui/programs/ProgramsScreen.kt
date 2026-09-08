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
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteProgress
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteZenithHeader
import com.fitconnect.android.designui.components.HexBadge
import com.fitconnect.android.designui.components.HexBadgeTone
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

private data class CatalogProgram(
    val id: String,
    val title: String,
    val weeks: Int,
    val sport: String,
    val level: String,
)

@Composable
fun ProgramsScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<List<ProgramEnrollment>>?>(null) }
    var catalog by remember { mutableStateOf<List<CatalogProgram>>(emptyList()) }
    var expandedId by remember { mutableStateOf<String?>(null) }
    var status by remember { mutableStateOf<String?>(null) }

    fun reload() {
        scope.launch {
            result = container.athleteRepository.programs()
            if (!container.platform.sessionStore.snapshot().isLocalDemo) {
                when (val raw = container.platform.apiClient.get("/api/v1/athletes/programs")) {
                    is AppResult.Ok -> {
                        val root = JSONObject(raw.value)
                        val arr = root.optJSONArray("catalog") ?: JSONArray()
                        catalog = buildList {
                            for (i in 0 until arr.length()) {
                                val o = arr.getJSONObject(i)
                                add(
                                    CatalogProgram(
                                        id = o.getString("id"),
                                        title = o.optString("title", "Program"),
                                        weeks = o.optInt("weeks", 1),
                                        sport = o.optString("sport", ""),
                                        level = o.optString("level", ""),
                                    ),
                                )
                            }
                        }
                    }
                    is AppResult.Err -> catalog = emptyList()
                }
            } else {
                catalog = emptyList()
            }
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_programs")
        reload()
    }

    AthleteLoad(result, ::reload) { programs ->
        AthleteScreenScaffold(
            title = "Programs",
            subtitle = "List · detail · week · enroll · progress",
            testTag = "athlete_programs",
            showTitle = false,
        ) {
            item {
                EosPremiumCard {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                        EliteZenithHeader(
                            sysLabel = "LIBRARY COMMAND",
                            title = "Programs",
                            subtitle = "Training library, enrollments, and next workout progression in one command lane.",
                            badge = {
                                HexBadge(
                                    text = programs.size.coerceAtMost(99).toString().padStart(2, '0'),
                                    tone = HexBadgeTone.Volt,
                                )
                            },
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            HexStatus("${catalog.size} catalog")
                            HexStatus("${programs.size} enrolled")
                        }
                    }
                }
            }
            status?.let { msg ->
                item {
                    Text(msg, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
            if (catalog.isNotEmpty()) {
                item { EliteSysLabel("TRAINING LIBRARY · CATALOG") }
                items(catalog, key = { "cat_${it.id}" }) { prog ->
                    EliteCard(modifier = Modifier.testTag("program_catalog_${prog.id}")) {
                        Text(prog.title, style = MaterialTheme.typography.titleLarge)
                        Text(
                            "${prog.sport} · ${prog.level} · ${prog.weeks} weeks",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        EliteButton(
                            label = "Enroll",
                            onClick = {
                                scope.launch {
                                    when (val enroll = container.athleteRepository.enrollProgram(prog.id)) {
                                        is AppResult.Ok -> {
                                            status = "Enrolled · ${prog.title}"
                                            reload()
                                        }
                                        is AppResult.Err -> status = "Enroll failed · try again"
                                    }
                                }
                            },
                        )
                    }
                }
            }
            item { EliteSysLabel("MY ENROLLMENTS") }
            if (programs.isEmpty()) {
                item {
                    EliteEmptyState(
                        title = "No programs yet",
                        body = "Enroll from the catalog to track weekly progress and your next workout.",
                        actionLabel = "Refresh",
                        onAction = ::reload,
                    )
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
                            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                                EliteButton(
                                    label = "Sync",
                                    onClick = {
                                        scope.launch {
                                            when (val enroll = container.athleteRepository.enrollProgram(program.id)) {
                                                is AppResult.Ok -> {
                                                    status = "Enrollment synced · ${program.id}"
                                                    reload()
                                                }
                                                is AppResult.Err -> status = enroll.error.toString()
                                            }
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
                    }
                }
            }
        }
    }
}
