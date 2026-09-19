package com.fitconnect.android.sports.intelligence

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.sports.domain.SportId
import org.json.JSONObject

data class TrainingTodayNutritionContext(
    val estimateKind: String,
    val confidence: String,
    val kcal: Int?,
    val proteinG: Int?,
    val carbohydrateG: Int?,
    val fatG: Int?,
    val hydrationMl: Int?,
    val fuelingHint: String?,
    val note: String?,
)

data class TrainingTodayCard(
    val sportId: SportId,
    val sessionName: String,
    val sessionType: String,
    val durationMin: Int,
    val readinessState: String,
    val readinessScore: Int?,
    val trainingLoadLabel: String,
    val adapted: Boolean,
    val fuelingHint: String?,
)

data class TrainingTodaySnapshot(
    val identity: AthleteSportsIdentity?,
    val today: TrainingTodayCard?,
    val nutrition: TrainingTodayNutritionContext?,
    val honestyNote: String?,
    val backendReachable: Boolean,
)

/**
 * Server TODAY train card — wires sport identity + adaptation + nutrition ESTIMATE context.
 */
class HttpTrainingTodayRemote(
    private val api: () -> ApiClient,
) {
    suspend fun getToday(sportWireId: String? = null): AppResult<TrainingTodaySnapshot> {
        val path = buildString {
            append("/api/v1/training/today")
            if (!sportWireId.isNullOrBlank()) {
                append("?sport=")
                append(java.net.URLEncoder.encode(sportWireId, Charsets.UTF_8.name()))
            }
        }
        return when (val result = api().get(path)) {
            is AppResult.Err -> result
            is AppResult.Ok -> parse(result.value)
        }
    }

    suspend fun listSports(): AppResult<List<Pair<String, String>>> {
        return when (val result = api().get("/api/v1/training/today?view=sports")) {
            is AppResult.Err -> result
            is AppResult.Ok -> {
                try {
                    val root = JSONObject(result.value)
                    val arr = root.optJSONArray("sports") ?: return AppResult.Ok(emptyList())
                    val out = mutableListOf<Pair<String, String>>()
                    for (i in 0 until arr.length()) {
                        val o = arr.optJSONObject(i) ?: continue
                        val id = o.optString("id")
                        val label = o.optString("label", id)
                        if (id.isNotBlank()) out += id to label
                    }
                    AppResult.Ok(out)
                } catch (_: Exception) {
                    AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
                }
            }
        }
    }

    private fun parse(raw: String): AppResult<TrainingTodaySnapshot> {
        return try {
            val root = JSONObject(raw)
            val identityObj = root.optJSONObject("identity")
            val identity = if (identityObj != null) {
                val primary = identityObj.optString("primarySport", "").takeIf { it.isNotBlank() }
                AthleteSportsIdentity(
                    primarySport = primary?.let { SportWireIds.fromWire(it) },
                    secondarySports = emptyList(),
                    primaryGoal = identityObj.optString("primaryGoal", "").takeIf { it.isNotBlank() },
                    sportLevel = identityObj.optString("sportLevel", "").takeIf { it.isNotBlank() },
                    complete = root.optBoolean("identityComplete", false),
                    missing = emptyList(),
                    backend = root.optString("identityBackend", "unknown"),
                )
            } else {
                null
            }

            val todayObj = root.optJSONObject("today")
            val today = if (todayObj != null) {
                val session = todayObj.optJSONObject("session") ?: JSONObject()
                val sportRaw = todayObj.optString("sportId", SportId.GENERAL_FITNESS.value)
                TrainingTodayCard(
                    sportId = SportWireIds.fromWire(sportRaw),
                    sessionName = session.optString("name", session.optString("title", "Today session")),
                    sessionType = session.optString("type", session.optString("sessionType", "session")),
                    durationMin = session.optInt("durationMin", todayObj.optInt("durationMin", 40)),
                    readinessState = todayObj.optString("readinessState", "MISSING"),
                    readinessScore = todayObj.optInt("readinessScore").takeIf {
                        todayObj.has("readinessScore") && !todayObj.isNull("readinessScore")
                    },
                    trainingLoadLabel = todayObj.optString("trainingLoadLabel", "UNKNOWN"),
                    adapted = todayObj.optBoolean("adapted", false),
                    fuelingHint = todayObj.optString("fuelingHint", "").takeIf { it.isNotBlank() },
                )
            } else {
                null
            }

            val nutr = root.optJSONObject("nutritionContext")
            val nutrition = if (nutr != null) {
                TrainingTodayNutritionContext(
                    estimateKind = nutr.optString("estimateKind", "ESTIMATE"),
                    confidence = nutr.optString("confidence", "LOW"),
                    kcal = nutr.optInt("kcal").takeIf { nutr.has("kcal") && !nutr.isNull("kcal") },
                    proteinG = nutr.optInt("proteinG").takeIf { nutr.has("proteinG") && !nutr.isNull("proteinG") },
                    carbohydrateG = nutr.optInt("carbohydrateG").takeIf {
                        nutr.has("carbohydrateG") && !nutr.isNull("carbohydrateG")
                    },
                    fatG = nutr.optInt("fatG").takeIf { nutr.has("fatG") && !nutr.isNull("fatG") },
                    hydrationMl = nutr.optInt("hydrationMl").takeIf {
                        nutr.has("hydrationMl") && !nutr.isNull("hydrationMl")
                    },
                    fuelingHint = nutr.optString("fuelingHint", "").takeIf { it.isNotBlank() },
                    note = root.optJSONObject("honesty")?.optString("note"),
                )
            } else {
                null
            }

            AppResult.Ok(
                TrainingTodaySnapshot(
                    identity = identity,
                    today = today,
                    nutrition = nutrition,
                    honestyNote = root.optJSONObject("honesty")?.optString("note"),
                    backendReachable = true,
                ),
            )
        } catch (_: Exception) {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }
}
