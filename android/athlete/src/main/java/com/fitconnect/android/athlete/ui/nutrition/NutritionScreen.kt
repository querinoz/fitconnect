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

/**
 * Nutrition Intelligence surface — Dashboard/TRAIN entry (not a 5th tab).
 * Targets are ESTIMATE; food log requires confirm. No fabricated calories.
 */
@Composable
fun NutritionScreen(
    sportId: SportId = SportId.GENERAL_FITNESS,
    dayKind: String = "moderate",
    durationMin: Int = 45,
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
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
        title = "Nutrition Intelligence",
        subtitle = "ESTIMATE targets · meals · grocery · confirm-to-log",
        testTag = "athlete_nutrition",
    ) {
        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_targets")) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("TARGETS · ${SportWireIds.toWire(resolvedSport)}")
                    when (targetsState) {
                        "LOADING" -> Text("Loading targets…")
                        "UNAVAILABLE" -> Text(
                            "Targets unavailable — sign in / connect API. No fabricated calories.",
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

        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_meal_plan")) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("MEALS · GROCERY")
                    val plan = mealPlan
                    if (plan == null) {
                        Text(
                            "Meal plan unavailable offline. No invented grocery list.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    } else {
                        Text(
                            "Week ${plan.weekStartISO ?: "—"} · ${plan.dayCount} days · ${plan.groceryItemCount} grocery items",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        plan.note?.let {
                            Text(it, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }

        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_food_search")) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("FOOD SEARCH")
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

        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("nutrition_diary")) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    EliteSysLabel("DIARY")
                    if (logs.isEmpty()) {
                        Text(
                            "No logged meals yet.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    } else {
                        logs.take(8).forEach { entry ->
                            Text(
                                "${entry.dateISO} · ${entry.foodId} · ${entry.grams.toInt()}g",
                                style = MaterialTheme.typography.bodyMedium,
                            )
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
