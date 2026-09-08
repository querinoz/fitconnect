package com.fitconnect.android.foundation.identity

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONArray
import org.json.JSONObject

class HttpIdentityRemote(
    private val api: () -> ApiClient,
    private val logger: Logger,
) : IdentityRemote {

    override suspend fun bootstrap(
        displayName: String?,
        email: String?,
        photoUrl: String?,
    ): AppResult<IdentityProfile> {
        val body = JSONObject().apply {
            if (displayName != null) put("displayName", displayName)
            if (email != null) put("email", email)
            if (photoUrl != null) put("avatarUrl", photoUrl)
        }
        return parseProfile(api().post("/api/v1/identity/profile", body.toString()))
    }

    override suspend fun getProfile(): AppResult<IdentityProfile> =
        parseProfile(api().get("/api/v1/identity/profile"))

    override suspend fun getMe(): AppResult<IdentityProfile> =
        parseProfile(api().get("/api/v1/identity/me"))

    override suspend fun setRole(role: UserRole): AppResult<IdentityProfile> {
        if (role != UserRole.ATHLETE && role != UserRole.COACH) {
            return AppResult.Err(AppError.Auth(AppError.AuthKind.FORBIDDEN))
        }
        val body = JSONObject().put("role", role.name.lowercase())
        return when (val result = api().put("/api/v1/identity/role", body.toString())) {
            is AppResult.Err -> result
            is AppResult.Ok -> getMe().let { profile ->
                if (profile is AppResult.Ok) profile
                else parseRoleOnly(result.value)
            }
        }
    }

    override suspend fun setActiveMode(mode: UserRole): AppResult<IdentityProfile> {
        if (mode != UserRole.ATHLETE && mode != UserRole.COACH) {
            return AppResult.Err(AppError.Auth(AppError.AuthKind.FORBIDDEN))
        }
        val body = JSONObject().put("activeMode", mode.name.lowercase())
        return when (val result = api().put("/api/v1/identity/active-mode", body.toString())) {
            is AppResult.Err -> result
            is AppResult.Ok -> getMe().let { me ->
                if (me is AppResult.Ok) me
                else parseRoleOnly(result.value)
            }
        }
    }

    override suspend fun getOnboarding(): AppResult<IdentityOnboarding> =
        parseOnboarding(api().get("/api/v1/identity/onboarding"))

    override suspend fun putOnboarding(state: IdentityOnboarding): AppResult<IdentityOnboarding> {
        val body = JSONObject().apply {
            state.role?.let { put("role", it.name.lowercase()) }
            put("step", state.step)
            put("completed", state.completed)
            put("payload", runCatching { JSONObject(state.payload) }.getOrDefault(JSONObject()))
        }
        return parseOnboarding(api().put("/api/v1/identity/onboarding", body.toString()))
    }

    override suspend fun deleteAccount(): AppResult<Unit> {
        return when (val result = api().post("/api/v1/account/delete", """{"confirm":"DELETE"}""")) {
            is AppResult.Err -> result
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    private fun parseProfile(result: AppResult<String>): AppResult<IdentityProfile> = when (result) {
        is AppResult.Err -> result
        is AppResult.Ok -> runCatching {
            val json = JSONObject(result.value)
            val role = parseRole(json.optString("role"))
            val active = parseRole(json.optString("activeMode")) ?: role
            AppResult.Ok(
                IdentityProfile(
                    uid = json.optString("uid").ifBlank { json.optString("id") },
                    email = json.optString("email").takeIf { it.isNotBlank() },
                    displayName = json.optString("displayName").takeIf { it.isNotBlank() },
                    avatarUrl = json.optString("avatarUrl").takeIf { it.isNotBlank() },
                    locale = json.optString("locale").takeIf { it.isNotBlank() },
                    timezone = json.optString("timezone").takeIf { it.isNotBlank() },
                    accent = json.optString("accent").takeIf { it.isNotBlank() },
                    role = role,
                    onboardingCompleted = json.optBoolean("onboardingCompleted"),
                    onboardingStep = json.optInt("onboardingStep"),
                    capabilities = parseCapabilities(json.optJSONArray("capabilities"), role),
                    activeMode = active,
                ),
            )
        }.getOrElse {
            logger.w("IdentityRemote", "profile parse failed")
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    private fun parseCapabilities(arr: JSONArray?, fallback: UserRole?): Set<UserRole> {
        if (arr == null || arr.length() == 0) {
            return when (fallback) {
                UserRole.ATHLETE, UserRole.COACH -> setOf(fallback)
                else -> emptySet()
            }
        }
        val out = mutableSetOf<UserRole>()
        for (i in 0 until arr.length()) {
            parseRole(arr.optString(i))?.let { out.add(it) }
        }
        return out.filter { it == UserRole.ATHLETE || it == UserRole.COACH }.toSet()
    }

    private fun parseRoleOnly(raw: String): AppResult<IdentityProfile> = runCatching {
        val json = JSONObject(raw)
        val role = parseRole(json.optString("role")) ?: parseRole(json.optString("activeMode"))
        AppResult.Ok(
            IdentityProfile(
                uid = json.optString("uid"),
                email = null,
                displayName = null,
                avatarUrl = null,
                locale = null,
                timezone = null,
                accent = null,
                role = role,
                onboardingCompleted = false,
                onboardingStep = 0,
                capabilities = parseCapabilities(json.optJSONArray("capabilities"), role),
                activeMode = parseRole(json.optString("activeMode")) ?: role,
            ),
        )
    }.getOrElse {
        AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
    }

    private fun parseOnboarding(result: AppResult<String>): AppResult<IdentityOnboarding> = when (result) {
        is AppResult.Err -> result
        is AppResult.Ok -> runCatching {
            val json = JSONObject(result.value)
            AppResult.Ok(
                IdentityOnboarding(
                    uid = json.optString("uid"),
                    role = parseRole(json.optString("role")),
                    step = json.optInt("step"),
                    completed = json.optBoolean("completed"),
                    payload = json.optJSONObject("payload")?.toString() ?: "{}",
                ),
            )
        }.getOrElse {
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    private fun parseRole(raw: String): UserRole? = when (raw.lowercase()) {
        "athlete" -> UserRole.ATHLETE
        "coach" -> UserRole.COACH
        "admin" -> UserRole.ADMIN
        else -> null
    }
}
