package com.fitconnect.android.sports.intelligence

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.sports.domain.SportId
import org.json.JSONArray
import org.json.JSONObject

/**
 * Server sports identity — source of truth for primary sport / goals.
 * Local catalog remains for offline session composition.
 */
data class AthleteSportsIdentity(
    val primarySport: SportId?,
    val secondarySports: List<SportId>,
    val primaryGoal: String?,
    val sportLevel: String?,
    val complete: Boolean,
    val missing: List<String>,
    val backend: String,
)

class HttpSportsIdentityRemote(
    private val api: () -> ApiClient,
) {
    suspend fun getIdentity(): AppResult<AthleteSportsIdentity> {
        return when (val result = api().get("/api/v1/sports/identity")) {
            is AppResult.Err -> result
            is AppResult.Ok -> parse(result.value)
        }
    }

    suspend fun putIdentity(
        primarySport: String,
        primaryGoal: String?,
        sportLevel: String?,
        secondarySports: List<String> = emptyList(),
    ): AppResult<AthleteSportsIdentity> {
        val body = JSONObject().apply {
            put("primarySport", primarySport)
            if (primaryGoal != null) put("primaryGoal", primaryGoal)
            if (sportLevel != null) put("sportLevel", sportLevel)
            put("secondarySports", JSONArray(secondarySports))
        }
        return when (val result = api().put("/api/v1/sports/identity", body.toString())) {
            is AppResult.Err -> result
            is AppResult.Ok -> parse(result.value)
        }
    }

    private fun parse(raw: String): AppResult<AthleteSportsIdentity> {
        return try {
            val root = JSONObject(raw)
            val profile = root.optJSONObject("profile") ?: JSONObject()
            val primary = profile.optString("primarySport", "").takeIf { it.isNotBlank() }
            val secondary = mutableListOf<SportId>()
            val arr = profile.optJSONArray("secondarySports")
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val id = arr.optString(i)
                    if (id.isNotBlank()) secondary += SportId(id)
                }
            }
            val missing = mutableListOf<String>()
            val missArr = root.optJSONArray("missing")
            if (missArr != null) {
                for (i in 0 until missArr.length()) {
                    missing += missArr.optString(i)
                }
            }
            AppResult.Ok(
                AthleteSportsIdentity(
                    primarySport = primary?.let { SportId(it) },
                    secondarySports = secondary,
                    primaryGoal = profile.optString("primaryGoal", "").takeIf { it.isNotBlank() },
                    sportLevel = profile.optString("sportLevel", "").takeIf { it.isNotBlank() },
                    complete = root.optBoolean("complete", false),
                    missing = missing,
                    backend = root.optString("backend", "unknown"),
                ),
            )
        } catch (_: Exception) {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }
}
