package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.config.AppConfig
import com.fitconnect.android.foundation.security.AccountIsolationController
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import com.fitconnect.android.foundation.session.SessionStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Production IdP adapter — Supabase Auth REST (anon key only).
 * Never embeds service-role keys. Requires [AppConfig.usesLiveAuth].
 */
class SupabaseAuthRepository(
    private val config: AppConfig,
    private val sessionStore: SessionStore,
    private val logger: Logger,
    private val isolation: AccountIsolationController? = null,
    private val http: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build(),
) : AuthRepository, TokenRefresher {

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    private fun base(): String? {
        val url = config.supabaseUrl?.trimEnd('/') ?: return null
        if (config.supabaseAnonKey.isNullOrBlank()) return null
        return url
    }

    override suspend fun signIn(
        provider: AuthProviderKind,
        credentials: AuthCredentials,
    ): AppResult<AuthUser> = withContext(Dispatchers.IO) {
        when (provider) {
            AuthProviderKind.EMAIL_PASSWORD -> passwordGrant(
                email = credentials.email.orEmpty(),
                password = credentials.password.orEmpty(),
                signUp = false,
            )
            AuthProviderKind.GUEST -> {
                isolation?.wipeForLogout()
                sessionStore.clear()
                sessionStore.save(
                    SessionSnapshot(
                        userId = null,
                        role = UserRole.GUEST,
                        tokens = null,
                        isAnonymous = false,
                        biometricUnlockEnabled = false,
                    ),
                )
                AppResult.Ok(AuthUser(id = "guest", email = null, role = UserRole.GUEST))
            }
            AuthProviderKind.GOOGLE, AuthProviderKind.APPLE ->
                AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
            AuthProviderKind.MAGIC_LINK,
            AuthProviderKind.ANONYMOUS, AuthProviderKind.BIOMETRIC_UNLOCK,
            -> AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
    }

    override suspend fun signUp(
        email: String,
        password: String,
        confirmPassword: String?,
    ): AppResult<AuthUser> {
        AuthValidators.passwordsMatch(password, confirmPassword)?.let {
            return AuthErrorMapper.err(it)
        }
        return passwordGrant(email, password, signUp = true)
    }

    override suspend fun sendMagicLink(email: String): AppResult<Unit> = sendPasswordReset(email)

    override suspend fun sendPasswordReset(email: String): AppResult<Unit> = withContext(Dispatchers.IO) {
        AuthValidators.email(email)?.let { return@withContext AuthErrorMapper.err(it) }
        val root = base()
            ?: return@withContext AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        val payload = JSONObject().put("email", email.trim()).toString()
        val req = Request.Builder()
            .url("$root/auth/v1/recover")
            .addHeader("apikey", config.supabaseAnonKey!!)
            .addHeader("Content-Type", "application/json")
            .post(payload.toRequestBody(jsonMedia))
            .build()
        runCatching {
            http.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) {
                    logger.w("SupabaseAuth", "recover failed status=${resp.code}")
                    return@withContext AuthErrorMapper.err(AppError.AuthKind.UNKNOWN_AUTH_ERROR)
                }
                AppResult.Ok(Unit)
            }
        }.getOrElse {
            logger.w("SupabaseAuth", "recover error")
            AuthErrorMapper.err(AppError.AuthKind.NETWORK_ERROR)
        }
    }

    override suspend fun signInAnonymously(): AppResult<AuthUser> =
        AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))

    override suspend fun continueAsGuest(): AppResult<Unit> {
        isolation?.wipeForLogout()
        sessionStore.clear()
        return sessionStore.save(
            SessionSnapshot(
                userId = null,
                role = UserRole.GUEST,
                tokens = null,
                isAnonymous = false,
                biometricUnlockEnabled = false,
            ),
        )
    }

    override suspend fun restoreSession(): AppResult<SessionSnapshot> {
        val snap = sessionStore.snapshot()
        return if (snap.tokens != null) AppResult.Ok(snap)
        else AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
    }

    override suspend fun refreshSession(): AppResult<AuthTokens> = refresh()

    override suspend fun refresh(): AppResult<AuthTokens> = withContext(Dispatchers.IO) {
        val root = base() ?: return@withContext AppResult.Err(AppError.Auth(AppError.AuthKind.REFRESH_FAILED))
        val refresh = sessionStore.refreshToken()
            ?: return@withContext AppResult.Err(AppError.Auth(AppError.AuthKind.REFRESH_FAILED))
        val body = JSONObject().put("refresh_token", refresh).toString()
        val req = Request.Builder()
            .url("$root/auth/v1/token?grant_type=refresh_token")
            .addHeader("apikey", config.supabaseAnonKey!!)
            .addHeader("Content-Type", "application/json")
            .post(body.toRequestBody(jsonMedia))
            .build()
        runCatching {
            http.newCall(req).execute().use { resp ->
                val text = resp.body?.string().orEmpty()
                if (!resp.isSuccessful) {
                    logger.w("SupabaseAuth", "refresh failed status=${resp.code}")
                    return@withContext AppResult.Err(AppError.Auth(AppError.AuthKind.REFRESH_FAILED))
                }
                persistTokenResponse(text)
            }
        }.getOrElse {
            logger.w("SupabaseAuth", "refresh error", it)
            AppResult.Err(AppError.Auth(AppError.AuthKind.REFRESH_FAILED))
        }
    }

    override suspend fun logout(): AppResult<Unit> {
        isolation?.wipeForLogout()
        return sessionStore.clear()
    }

    override suspend fun deleteSession(): AppResult<Unit> = logout()

    override suspend fun enableBiometricUnlock(enabled: Boolean): AppResult<Unit> {
        val snap = sessionStore.snapshot()
        return sessionStore.save(snap.copy(biometricUnlockEnabled = enabled))
    }

    override suspend fun unlockWithBiometric(): AppResult<AuthUser> {
        val snap = sessionStore.snapshot()
        if (!snap.biometricUnlockEnabled || snap.tokens == null) {
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        return AppResult.Ok(AuthUser(snap.userId ?: "unknown", null, snap.role))
    }

    private suspend fun passwordGrant(
        email: String,
        password: String,
        signUp: Boolean,
    ): AppResult<AuthUser> = withContext(Dispatchers.IO) {
        val root = base()
            ?: return@withContext AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        AuthValidators.email(email)?.let { return@withContext AuthErrorMapper.err(it) }
        AuthValidators.password(password)?.let { return@withContext AuthErrorMapper.err(it) }
        val path = if (signUp) "signup" else "token?grant_type=password"
        val payload = JSONObject()
            .put("email", email.trim())
            .put("password", password)
            .toString()
        val req = Request.Builder()
            .url("$root/auth/v1/$path")
            .addHeader("apikey", config.supabaseAnonKey!!)
            .addHeader("Content-Type", "application/json")
            .post(payload.toRequestBody(jsonMedia))
            .build()
        runCatching {
            http.newCall(req).execute().use { resp ->
                val text = resp.body?.string().orEmpty()
                if (!resp.isSuccessful) {
                    logger.w("SupabaseAuth", "auth failed status=${resp.code}")
                    val kind = when (resp.code) {
                        400, 401 -> AppError.AuthKind.INVALID_CREDENTIALS
                        422 -> AppError.AuthKind.EMAIL_ALREADY_EXISTS
                        429 -> AppError.AuthKind.TOO_MANY_REQUESTS
                        else -> AppError.AuthKind.UNKNOWN_AUTH_ERROR
                    }
                    return@withContext AuthErrorMapper.err(kind)
                }
                when (val tokens = persistTokenResponse(text)) {
                    is AppResult.Ok -> {
                        val userId = sessionStore.snapshot().userId ?: "unknown"
                        val role = sessionStore.role()
                        AppResult.Ok(AuthUser(userId, email.trim(), role))
                    }
                    is AppResult.Err -> tokens
                }
            }
        }.getOrElse {
            logger.w("SupabaseAuth", "auth error", it)
            AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
    }

    private suspend fun persistTokenResponse(text: String): AppResult<AuthTokens> {
        val json = JSONObject(text)
        val access = json.optString("access_token").ifBlank {
            json.optJSONObject("session")?.optString("access_token").orEmpty()
        }
        val refresh = json.optString("refresh_token").ifBlank {
            json.optJSONObject("session")?.optString("refresh_token")
        }
        val userObj = json.optJSONObject("user") ?: json.optJSONObject("session")?.optJSONObject("user")
        val userId = userObj?.optString("id").orEmpty()
        if (access.isBlank() || userId.isBlank()) {
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        val expiresIn = json.optLong("expires_in", 3600)
        val role = mapRole(userObj?.optJSONObject("user_metadata")?.optString("role"))
        isolation?.wipeForAccountSwitch(userId)
        val tokens = AuthTokens(
            accessToken = access,
            refreshToken = refresh,
            expiresAtEpochMs = System.currentTimeMillis() + expiresIn * 1000,
        )
        sessionStore.save(
            SessionSnapshot(
                userId = userId,
                role = role,
                tokens = tokens,
                isAnonymous = false,
                biometricUnlockEnabled = false,
            ),
        )
        return AppResult.Ok(tokens)
    }

    private fun mapRole(raw: String?): UserRole = when (raw?.lowercase()) {
        "coach" -> UserRole.COACH
        "admin" -> UserRole.ADMIN // server metadata only — never client-elevated locally
        else -> UserRole.ATHLETE
    }
}
