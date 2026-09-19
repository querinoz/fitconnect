package com.fitconnect.android.sports.nutrition

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONArray
import org.json.JSONObject

data class NutritionTargetsView(
    val kcal: Int?,
    val proteinG: Int?,
    val carbohydrateG: Int?,
    val fatG: Int?,
    val hydrationMl: Int?,
    val confidence: String,
    val estimateKind: String,
    val safetyFlags: List<String>,
    val note: String?,
    val sportId: String?,
)

data class NutritionFoodHit(
    val id: String,
    val name: String,
    val brand: String?,
    val kcalPer100g: Double?,
    val proteinGPer100g: Double?,
    val source: String?,
)

data class NutritionLogEntry(
    val id: String,
    val foodId: String,
    val grams: Double,
    val dateISO: String,
)

data class MealPlanSummary(
    val weekStartISO: String?,
    val dayCount: Int,
    val groceryItemCount: Int,
    val note: String?,
)

/**
 * Nutrition Intelligence API client — ESTIMATE targets, food search, confirm-gated log.
 * Never invents macros; writes require confirm=true.
 */
class HttpNutritionRemote(
    private val api: () -> ApiClient,
) {
    suspend fun getTargets(
        sportWireId: String,
        dayKind: String = "moderate",
        durationMin: Int = 45,
        goal: String = "PERFORMANCE",
    ): AppResult<NutritionTargetsView> {
        val path =
            "/api/v1/nutrition/targets?sport=${enc(sportWireId)}&day=${enc(dayKind)}" +
                "&durationMin=$durationMin&goal=${enc(goal)}"
        return when (val result = api().get(path)) {
            is AppResult.Err -> result
            is AppResult.Ok -> parseTargets(result.value)
        }
    }

    suspend fun searchFoods(query: String): AppResult<List<NutritionFoodHit>> {
        val path = "/api/v1/nutrition/targets?view=foods&q=${enc(query)}"
        return when (val result = api().get(path)) {
            is AppResult.Err -> result
            is AppResult.Ok -> parseFoods(result.value)
        }
    }

    suspend fun listLogs(dateISO: String? = null): AppResult<List<NutritionLogEntry>> {
        val path = if (dateISO.isNullOrBlank()) {
            "/api/v1/nutrition/log"
        } else {
            "/api/v1/nutrition/log?date=${enc(dateISO)}"
        }
        return when (val result = api().get(path)) {
            is AppResult.Err -> result
            is AppResult.Ok -> parseLogs(result.value)
        }
    }

    suspend fun confirmLogFood(
        foodId: String,
        grams: Double,
        dateISO: String,
        slot: String? = null,
    ): AppResult<NutritionLogEntry> {
        val body = JSONObject().apply {
            put("confirm", true)
            put("foodId", foodId)
            put("grams", grams)
            put("dateISO", dateISO)
            if (slot != null) put("slot", slot)
        }
        return when (val result = api().post("/api/v1/nutrition/log", body.toString())) {
            is AppResult.Err -> result
            is AppResult.Ok -> parseLogEntry(result.value)
        }
    }

    suspend fun mealPlan(
        sportWireId: String,
        dayKind: String = "moderate",
        durationMin: Int = 45,
    ): AppResult<MealPlanSummary> {
        val path =
            "/api/v1/nutrition/targets?view=meal-plan&sport=${enc(sportWireId)}" +
                "&day=${enc(dayKind)}&durationMin=$durationMin"
        return when (val result = api().get(path)) {
            is AppResult.Err -> result
            is AppResult.Ok -> parseMealPlan(result.value)
        }
    }

    private fun parseTargets(raw: String): AppResult<NutritionTargetsView> {
        return try {
            val root = JSONObject(raw)
            val t = root.optJSONObject("targets") ?: return AppResult.Ok(
                NutritionTargetsView(
                    kcal = null,
                    proteinG = null,
                    carbohydrateG = null,
                    fatG = null,
                    hydrationMl = null,
                    confidence = "LOW",
                    estimateKind = "UNAVAILABLE",
                    safetyFlags = emptyList(),
                    note = root.optString("note", null),
                    sportId = root.optString("sportId", null),
                ),
            )
            val flags = mutableListOf<String>()
            val arr = t.optJSONArray("safetyFlags")
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val item = arr.opt(i)
                    when (item) {
                        is JSONObject -> flags += item.optString("message", item.toString())
                        is String -> flags += item
                    }
                }
            }
            AppResult.Ok(
                NutritionTargetsView(
                    kcal = t.nullableInt("kcal"),
                    proteinG = t.nullableInt("proteinG"),
                    carbohydrateG = t.nullableInt("carbohydrateG"),
                    fatG = t.nullableInt("fatG"),
                    hydrationMl = t.nullableInt("hydrationMl"),
                    confidence = t.optString("confidence", "LOW"),
                    estimateKind = t.optString("estimateKind", "ESTIMATE"),
                    safetyFlags = flags,
                    note = root.optString("note", "").takeIf { it.isNotBlank() },
                    sportId = root.optString("sportId", "").takeIf { it.isNotBlank() },
                ),
            )
        } catch (_: Exception) {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    private fun parseFoods(raw: String): AppResult<List<NutritionFoodHit>> {
        return try {
            val root = JSONObject(raw)
            val arr = root.optJSONArray("foods") ?: JSONArray()
            val out = mutableListOf<NutritionFoodHit>()
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                val id = o.optString("id", o.optString("foodId", ""))
                if (id.isBlank()) continue
                out += NutritionFoodHit(
                    id = id,
                    name = o.optString("name", id),
                    brand = o.optString("brand", "").takeIf { it.isNotBlank() },
                    kcalPer100g = o.nullableDouble("kcalPer100g")
                        ?: o.nullableDouble("energyKcalPer100g"),
                    proteinGPer100g = o.nullableDouble("proteinGPer100g")
                        ?: o.nullableDouble("proteinG"),
                    source = o.optString("source", "").takeIf { it.isNotBlank() },
                )
            }
            AppResult.Ok(out)
        } catch (_: Exception) {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    private fun parseLogs(raw: String): AppResult<List<NutritionLogEntry>> {
        return try {
            val root = JSONObject(raw)
            val arr = root.optJSONArray("logs") ?: JSONArray()
            val out = mutableListOf<NutritionLogEntry>()
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                out += NutritionLogEntry(
                    id = o.optString("id", ""),
                    foodId = o.optString("foodId", ""),
                    grams = o.optDouble("grams", 0.0),
                    dateISO = o.optString("dateISO", ""),
                )
            }
            AppResult.Ok(out)
        } catch (_: Exception) {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    private fun parseLogEntry(raw: String): AppResult<NutritionLogEntry> {
        return try {
            val root = JSONObject(raw)
            val entry = root.optJSONObject("entry") ?: return AppResult.Err(
                AppError.Network(AppError.NetworkKind.UNKNOWN),
            )
            AppResult.Ok(
                NutritionLogEntry(
                    id = entry.optString("id", ""),
                    foodId = entry.optString("foodId", ""),
                    grams = entry.optDouble("grams", 0.0),
                    dateISO = entry.optString("dateISO", ""),
                ),
            )
        } catch (_: Exception) {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    private fun parseMealPlan(raw: String): AppResult<MealPlanSummary> {
        return try {
            val root = JSONObject(raw)
            val plan = root.optJSONObject("plan")
            val grocery = root.optJSONObject("grocery")
            val days = plan?.optJSONArray("days")
            val items = grocery?.optJSONArray("items") ?: grocery?.optJSONArray("remaining")
            AppResult.Ok(
                MealPlanSummary(
                    weekStartISO = plan?.optString("weekStartISO", null),
                    dayCount = days?.length() ?: 0,
                    groceryItemCount = items?.length() ?: 0,
                    note = root.optString("note", "").takeIf { it.isNotBlank() },
                ),
            )
        } catch (_: Exception) {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    private fun enc(v: String): String =
        java.net.URLEncoder.encode(v, Charsets.UTF_8.name())

    private fun JSONObject.nullableInt(key: String): Int? =
        if (has(key) && !isNull(key)) optInt(key) else null

    private fun JSONObject.nullableDouble(key: String): Double? =
        if (has(key) && !isNull(key)) optDouble(key) else null
}
