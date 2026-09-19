package com.fitconnect.android.athlete.ui.train

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.PreferenceKeys
import com.fitconnect.android.sports.domain.SportCategory
import com.fitconnect.android.sports.domain.SportDefinition
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.domain.displayLabel
import com.fitconnect.android.sports.domain.gpsSupported
import com.fitconnect.android.sports.intelligence.SportWireIds
import kotlinx.coroutines.launch

/**
 * Two-level Active Training Sport selector — groups from registry categories, then sports + search.
 * Confirm persists identity; no fabricated recent/favorites.
 */
@Composable
fun SportSelectorScreen(
    onConfirmed: () -> Unit = {},
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    val registry = remember { container.sportsEngine.registry() }
    val categories = remember {
        SportCategory.entries.filter { registry.byCategory(it).isNotEmpty() }
    }
    var level by remember { mutableStateOf(1) }
    var group by remember { mutableStateOf<SportCategory?>(null) }
    var query by remember { mutableStateOf("") }
    var selected by remember { mutableStateOf<SportDefinition?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    var currentPrimary by remember { mutableStateOf<SportId?>(null) }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_sport_selector")
        when (val id = container.sportsIdentity.getIdentity()) {
            is AppResult.Ok -> currentPrimary = id.value.primarySport
            is AppResult.Err -> Unit
        }
    }

    val sportsInView: List<SportDefinition> = remember(group, query, level) {
        when {
            level == 1 -> emptyList()
            query.isNotBlank() -> registry.discover(query)
            group != null -> registry.byCategory(group!!)
            else -> registry.all()
        }
    }

    AthleteScreenScaffold(
        title = if (level == 1) "Sport groups" else "Select sport",
        subtitle = currentPrimary?.let {
            "Active · ${registry.get(it)?.displayName ?: it.value}"
        } ?: "Choose Active Training Sport",
        testTag = "athlete_sport_selector",
    ) {
        if (level == 1) {
            item {
                EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("sport_selector_groups")) {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                        EliteSysLabel("LEVEL 1 · GROUPS")
                        Text(
                            "FitConnect registry categories — not a Strava clone.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        EliteFlowRow {
                            categories.forEach { cat ->
                                EliteChip(
                                    label = cat.displayLabel(),
                                    selected = group == cat,
                                    onClick = {
                                        group = cat
                                        level = 2
                                        query = ""
                                        selected = null
                                    },
                                )
                            }
                        }
                    }
                }
            }
        } else {
            item {
                EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("sport_selector_level2")) {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                        EliteSysLabel(
                            "LEVEL 2 · ${group?.displayLabel() ?: "Search"}",
                        )
                        EliteButton(
                            label = "BACK TO GROUPS",
                            onClick = {
                                level = 1
                                selected = null
                                query = ""
                            },
                            variant = EliteButtonVariant.Secondary,
                            modifier = Modifier.testTag("sport_selector_back_groups"),
                        )
                        OutlinedTextField(
                            value = query,
                            onValueChange = { query = it },
                            modifier = Modifier.fillMaxWidth().testTag("sport_selector_search"),
                            label = { Text("Search sports") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                            keyboardActions = KeyboardActions(onSearch = { }),
                        )
                    }
                }
            }
            items(sportsInView, key = { it.id.value }) { sport ->
                EosPremiumCard(
                    onClick = { selected = sport },
                    modifier = Modifier.testTag("sport_selector_item_${sport.id.value}"),
                ) {
                    Text(sport.displayName, style = MaterialTheme.typography.titleMedium)
                    Text(
                        buildString {
                            append(sport.category.displayLabel())
                            if (sport.gpsSupported()) append(" · GPS")
                            else append(" · no GPS")
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            selected?.let { sport ->
                item {
                    EosPremiumCard(
                        modifier = Modifier.fillMaxWidth().testTag("sport_selector_confirm_card"),
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteSysLabel("CONFIRM ACTIVE TRAINING SPORT")
                            Text(sport.displayName, style = MaterialTheme.typography.titleLarge)
                            Text(
                                if (sport.gpsSupported()) {
                                    "GPS metrics available for this sport."
                                } else {
                                    "No GPS chrome — strength/indoor metrics only."
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            EliteButton(
                                label = "CONFIRM SPORT",
                                onClick = {
                                    scope.launch {
                                        val wire = SportWireIds.toWire(sport.id)
                                        container.platform.keyValueStore.set(
                                            PreferenceKeys.ACTIVE_TRAINING_SPORT,
                                            sport.id.value,
                                        )
                                        when (
                                            val put = container.sportsIdentity.putIdentity(
                                                primarySport = wire,
                                                primaryGoal = "PERFORMANCE",
                                                sportLevel = null,
                                            )
                                        ) {
                                            is AppResult.Ok -> {
                                                message = "Active sport · ${sport.displayName}"
                                                onConfirmed()
                                            }
                                            is AppResult.Err -> {
                                                message =
                                                    "Saved locally · ${sport.displayName} (server unreachable)"
                                                onConfirmed()
                                            }
                                        }
                                    }
                                },
                                variant = EliteButtonVariant.Primary,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                                    .testTag("sport_selector_confirm"),
                            )
                        }
                    }
                }
            }
        }
        message?.let { msg ->
            item { Text(msg, modifier = Modifier.testTag("sport_selector_message")) }
        }
    }
}
