package com.fitconnect.android.athlete.ui.nutrition

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
import androidx.compose.runtime.mutableDoubleStateOf
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
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.intelligence.SportWireIds
import com.fitconnect.android.sports.nutrition.MealPlanSummary
import com.fitconnect.android.sports.nutrition.NutritionFoodHit
import com.fitconnect.android.sports.nutrition.NutritionLogEntry
import com.fitconnect.android.sports.nutrition.NutritionTargetsView
import java.time.LocalDate
import kotlinx.coroutines.launch

private enum class NutritionSubsurface(val label: String) {
    TODAY("Today"),
    TARGETS("Targets"),
    MEALS("Meals"),
    FOODS("Foods"),
    RECIPES("Recipes"),
    GROCERY("Grocery"),
}

/**
 * Nutrition Intelligence host — dedicated domain with subsurfaces (not one mega-scroll of all domains).
 * Entry from Dashboard/TRAIN only (never a 5th primary tab).
 */
@Composable
fun NutritionScreen(
    sportId: SportId = SportId.GENERAL_FITNESS,
    dayKind: String = "moderate",
    durationMin: Int = 45,
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var surface by remember { mutableStateOf(NutritionSubsurface.TODAY) }
    var targets by remember { mutableStateOf<NutritionTargetsView?>(null) }
    var targetsState by remember { mutableStateOf("LOADING") }
    var query by remember { mutableStateOf("") }
    var foods by remember { mutableStateOf<List<NutritionFoodHit>>(emptyList()) }
    var selected by remember { mutableStateOf<NutritionFoodHit?>(null) }
    var grams by remember { mutableDoubleStateOf(100.0) }
    var confirming by remember { mutableStateOf(false) }
    var logs by remember { mutableStateOf<List<NutritionLogEntry>>(emptyList()) }
    var mealPlan by remember { mutableStateOf<MealPlanSummary?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    var resolvedSport by remember { mutableStateOf(sportId) }

    fun reload() {
        scope.launch {
            targetsState = "LOADING"
            when (val id = container.sportsIdentity.getIdentity()) {
                is AppResult.Ok -> id.value.primarySport?.let { resolvedSport = it }
                is AppResult.Err -> Unit
            }
            val wire = SportWireIds.toWire(resolvedSport)
            when (
                val t = container.nutritionRemote.getTargets(
                    sportWireId = wire,
                    dayKind = dayKind,
                    durationMin = durationMin,
                )
            ) {
                is AppResult.Ok -> {
                    targets = t.value
                    targetsState = if (t.value.estimateKind == "UNAVAILABLE") "UNAVAILABLE" else "AVAILABLE"
                }
                is AppResult.Err -> {
                    targets = null
                    targetsState = "UNAVAILABLE"
                }
            }
            when (val l = container.nutritionRemote.listLogs()) {
                is AppResult.Ok -> logs = l.value
                is AppResult.Err -> logs = emptyList()
            }
            when (
                val m = container.nutritionRemote.mealPlan(
                    sportWireId = wire,
                    dayKind = dayKind,
                    durationMin = durationMin,
                )
            ) {
                is AppResult.Ok -> mealPlan = m.value
                is AppResult.Err -> mealPlan = null
            }
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_nutrition")
        reload()
    }

    AthleteScreenScaffold(
        title = "Nutrition",
        subtitle = "ESTIMATE targets · confirm-to-log · sport ${SportWireIds.toWire(resolvedSport)}",
        testTag = "athlete_nutrition",
    ) {
        item {
            EliteFlowRow {
                NutritionSubsurface.entries.forEach { tab ->
                    EliteChip(
                        label = tab.label,
                        selected = surface == tab,
                        onClick = { surface = tab },
                    )
                }
            }
        }

        when (surface) {
            NutritionSubsurface.TODAY -> {
                item {
                    EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_today")) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteSysLabel("TODAY")
                            val t = targets
                            if (t != null && targetsState == "AVAILABLE") {
                                Text(
                                    buildString {
                                        append(t.kcal?.let { "$it kcal target" } ?: "kcal —")
                                        append(" · logged ${logs.size} entries")
                                    },
                                    style = MaterialTheme.typography.titleMedium,
                                )
                            } else {
                                Text(
                                    "No fabricated day summary — connect API or set profile.",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            if (logs.isEmpty()) {
                                Text(
                                    "Diary empty for now.",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            } else {
                                logs.take(5).forEach { entry ->
                                    Text(
                                        "${entry.dateISO} · ${entry.foodId} · ${entry.grams.toInt()}g",
                                        style = MaterialTheme.typography.bodyMedium,
                                    )
                                }
                            }
                        }
                    }
                }
            }
            NutritionSubsurface.TARGETS -> {
                item {
                    EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_targets")) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteSysLabel("TARGETS")
                            when (targetsState) {
                                "LOADING" -> Text("Loading targets…")
                                "UNAVAILABLE" -> Text(
                                    "Targets unavailable — no fabricated calories.",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                                else -> {
                                    val t = targets
                                    if (t == null) {
                                        Text("No targets returned.")
                                    } else {
                                        Text(
                                            buildString {
                                                append(t.kcal?.let { "$it kcal" } ?: "kcal —")
                                                append(" · P ${t.proteinG ?: "—"}g")
                                                append(" · C ${t.carbohydrateG ?: "—"}g")
                                                append(" · F ${t.fatG ?: "—"}g")
                                            },
                                            style = MaterialTheme.typography.titleLarge,
                                        )
                                        Text(
                                            "${t.estimateKind} · confidence ${t.confidence}" +
                                                (t.hydrationMl?.let { " · hydration ${it}ml" } ?: ""),
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        )
                                        t.note?.let {
                                            Text(it, style = MaterialTheme.typography.bodySmall)
                                        }
                                        t.safetyFlags.forEach { flag ->
                                            Text(
                                                "⚠ $flag",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.error,
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            NutritionSubsurface.MEALS -> {
                item {
                    EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_meal_plan")) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteSysLabel("MEALS")
                            val plan = mealPlan
                            if (plan == null) {
                                Text(
                                    "Meal plan unavailable offline. No invented meals.",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            } else {
                                Text(
                                    "Week ${plan.weekStartISO ?: "—"} · ${plan.dayCount} days",
                                    style = MaterialTheme.typography.bodyMedium,
                                )
                                plan.note?.let {
                                    Text(it, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }
                }
            }
            NutritionSubsurface.FOODS -> {
                item {
                    EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_food_search")) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteSysLabel("FOODS")
                            OutlinedTextField(
                                value = query,
                                onValueChange = { query = it },
                                modifier = Modifier.fillMaxWidth().testTag("nutrition_food_query"),
                                label = { Text("Search food") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                                keyboardActions = KeyboardActions(
                                    onSearch = {
                                        scope.launch {
                                            when (val r = container.nutritionRemote.searchFoods(query)) {
                                                is AppResult.Ok -> {
                                                    foods = r.value
                                                    message = if (r.value.isEmpty()) {
                                                        "No foods found — provenance empty, not invented"
                                                    } else {
                                                        null
                                                    }
                                                }
                                                is AppResult.Err -> {
                                                    foods = emptyList()
                                                    message = "Food lookup unavailable"
                                                }
                                            }
                                        }
                                    },
                                ),
                            )
                            EliteButton(
                                label = "SEARCH",
                                onClick = {
                                    scope.launch {
                                        when (val r = container.nutritionRemote.searchFoods(query)) {
                                            is AppResult.Ok -> {
                                                foods = r.value
                                                message = if (r.value.isEmpty()) {
                                                    "No foods found — provenance empty, not invented"
                                                } else {
                                                    null
                                                }
                                            }
                                            is AppResult.Err -> {
                                                foods = emptyList()
                                                message = "Food lookup unavailable"
                                            }
                                        }
                                    }
                                },
                                variant = EliteButtonVariant.Secondary,
                                modifier = Modifier.testTag("nutrition_food_search_btn"),
                            )
                        }
                    }
                }
                items(foods, key = { it.id }) { food ->
                    EosPremiumCard(
                        onClick = {
                            selected = food
                            confirming = false
                            message = null
                        },
                        modifier = Modifier.testTag("nutrition_food_${food.id}"),
                    ) {
                        Text(food.name, style = MaterialTheme.typography.titleMedium)
                        Text(
                            listOfNotNull(
                                food.brand,
                                food.kcalPer100g?.let { "${it.toInt()} kcal/100g" },
                                food.source?.let { "source $it" },
                            ).joinToString(" · ").ifBlank { "macros when catalog provides them" },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                selected?.let { food ->
                    item {
                        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_confirm_log")) {
                            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                                EliteSysLabel("CONFIRM BEFORE LOG")
                                Text(food.name, style = MaterialTheme.typography.titleMedium)
                                OutlinedTextField(
                                    value = grams.toInt().toString(),
                                    onValueChange = { v ->
                                        grams = v.toDoubleOrNull()?.coerceAtLeast(1.0) ?: grams
                                    },
                                    label = { Text("Grams") },
                                    modifier = Modifier.fillMaxWidth().testTag("nutrition_grams"),
                                    singleLine = true,
                                )
                                if (!confirming) {
                                    EliteButton(
                                        label = "REVIEW LOG",
                                        onClick = { confirming = true },
                                        variant = EliteButtonVariant.Primary,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                                            .testTag("nutrition_review_log"),
                                    )
                                } else {
                                    Text(
                                        "Will log ${grams.toInt()}g of ${food.name}. Not auto-applied.",
                                        style = MaterialTheme.typography.bodyMedium,
                                    )
                                    EliteButton(
                                        label = "CONFIRM LOG",
                                        onClick = {
                                            scope.launch {
                                                when (
                                                    val r = container.nutritionRemote.confirmLogFood(
                                                        foodId = food.id,
                                                        grams = grams,
                                                        dateISO = LocalDate.now().toString(),
                                                    )
                                                ) {
                                                    is AppResult.Ok -> {
                                                        message = "Logged ${r.value.foodId}"
                                                        confirming = false
                                                        selected = null
                                                        reload()
                                                    }
                                                    is AppResult.Err -> {
                                                        message =
                                                            "Log failed — auth or food required. Nothing invented."
                                                    }
                                                }
                                            }
                                        },
                                        variant = EliteButtonVariant.Primary,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .testTag("nutrition_confirm_log_btn"),
                                    )
                                    EliteButton(
                                        label = "CANCEL",
                                        onClick = { confirming = false },
                                        variant = EliteButtonVariant.Secondary,
                                        modifier = Modifier.testTag("nutrition_cancel_log"),
                                    )
                                }
                            }
                        }
                    }
                }
            }
            NutritionSubsurface.RECIPES -> {
                item {
                    EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_recipes")) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteSysLabel("RECIPES")
                            Text(
                                "Recipes surface — open web /nutrition/recipes when catalog returns data. Nothing invented here.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
            NutritionSubsurface.GROCERY -> {
                item {
                    EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_grocery")) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                            EliteSysLabel("GROCERY")
                            val plan = mealPlan
                            if (plan == null) {
                                Text(
                                    "No grocery list without a meal plan — not invented.",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            } else {
                                Text(
                                    "${plan.groceryItemCount} grocery items · week ${plan.weekStartISO ?: "—"}",
                                    style = MaterialTheme.typography.titleMedium,
                                )
                            }
                        }
                    }
                }
            }
        }

        message?.let { msg ->
            item {
                Text(msg, modifier = Modifier.testTag("nutrition_message"))
            }
        }
    }
}
