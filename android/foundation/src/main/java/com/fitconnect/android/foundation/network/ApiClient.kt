package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.auth.TokenRefresher
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.perf.PerformanceBudget
import com.fitconnect.android.foundation.session.SessionStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.suspendCancellableCoroutine
import okhttp3.Authenticator
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.util.concurrent.TimeUnit
import javax.net.ssl.SSLException
import kotlin.coroutines.resume

data class NetworkConfig(
    val baseUrl: String,
    val connectTimeoutMs: Long = 15_000,
    val readTimeoutMs: Long = 30_000,
    val writeTimeoutMs: Long = 30_000,
    val userAgent: String = "FitConnect-Android/0.2",
)

interface ApiClient {
    suspend fun get(path: String, headers: Map<String, String> = emptyMap()): AppResult<String>
    suspend fun post(
        path: String,
        body: String,
        headers: Map<String, String> = emptyMap(),
        mediaType: String = "application/json; charset=utf-8",
    ): AppResult<String>
    suspend fun put(
        path: String,
        body: String,
        headers: Map<String, String> = emptyMap(),
        mediaType: String = "application/json; charset=utf-8",
    ): AppResult<String>
    suspend fun delete(path: String, headers: Map<String, String> = emptyMap()): AppResult<String>
    fun cancelAll()
}

fun interface AuthTokenProvider {
    suspend fun bearerToken(): String?
}

class OkHttpApiClient(
    private val config: NetworkConfig,
    private val tokenProvider: AuthTokenProvider,
    private val logger: Logger,
    private val featureFlags: FeatureFlagStore? = null,
    private val tokenRefresher: TokenRefresher? = null,
    private val sessionStore: SessionStore? = null,
    private val responseCache: LruStringCache = LruStringCache(PerformanceBudget.HTTP_CACHE_ENTRIES),
    private val requestPolicy: RequestPolicy = RequestPolicy(),
    private val client: OkHttpClient = defaultClient(
        config,
        tokenProvider,
        logger,
        tokenRefresher,
        sessionStore,
    ),
) : ApiClient {

    override suspend fun get(path: String, headers: Map<String, String>): AppResult<String> {
        if (featureFlags?.killSwitchActive() == true) {
            return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
        val cacheKey = "GET:$path"
        responseCache.get(cacheKey)?.let { return AppResult.Ok(it) }
        if (!requestPolicy.beginDedupe(cacheKey)) {
            responseCache.get(cacheKey)?.let { return AppResult.Ok(it) }
        }
        return try {
            requestPolicy.withRetry {
                val request = Request.Builder()
                    .url(join(config.baseUrl, path))
                    .get()
                    .apply { headers.forEach { (k, v) -> header(k, v) } }
                    .tag(CallTag(path))
                    .build()
                executeAsync(request).also { result ->
                    if (result is AppResult.Ok && featureFlags?.isEnabled(FeatureFlag.OFFLINE_SYNC) == true) {
                        responseCache.put(cacheKey, result.value)
                    }
                }
            }
        } finally {
            requestPolicy.endDedupe(cacheKey)
        }
    }

    override suspend fun post(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = mutate("POST", path, body, headers, mediaType)

    override suspend fun put(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = mutate("PUT", path, body, headers, mediaType)

    override suspend fun delete(path: String, headers: Map<String, String>): AppResult<String> {
        if (featureFlags?.killSwitchActive() == true) {
            return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
        val request = Request.Builder()
            .url(join(config.baseUrl, path))
            .delete()
            .apply { headers.forEach { (k, v) -> header(k, v) } }
            .build()
        return requestPolicy.withRetry { executeAsync(request) }
    }

    override fun cancelAll() {
        client.dispatcher.cancelAll()
    }

    private suspend fun mutate(
        method: String,
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> {
        if (featureFlags?.killSwitchActive() == true) {
            return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
        return requestPolicy.withRetry {
            val builder = Request.Builder().url(join(config.baseUrl, path))
            val media = mediaType.toMediaType()
            when (method) {
                "POST" -> builder.post(body.toRequestBody(media))
                "PUT" -> builder.put(body.toRequestBody(media))
            }
            headers.forEach { (k, v) -> builder.header(k, v) }
            executeAsync(builder.build())
        }
    }

    private suspend fun executeAsync(request: Request): AppResult<String> =
        suspendCancellableCoroutine { cont ->
            val call = client.newCall(request)
            cont.invokeOnCancellation { call.cancel() }
            call.enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    if (cont.isActive) cont.resume(AppResult.Err(mapThrowable(e)))
                }

                override fun onResponse(call: Call, response: Response) {
                    response.use {
                        if (cont.isActive) cont.resume(mapResponse(it))
                    }
                }
            })
        }

    private fun mapResponse(response: Response): AppResult<String> {
        val body = response.body?.string().orEmpty()
        if (response.isSuccessful) return AppResult.Ok(body)
        return when (response.code) {
            401 -> AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
            403 -> AppResult.Err(AppError.Auth(AppError.AuthKind.FORBIDDEN))
            else -> AppResult.Err(
                AppError.Api(statusCode = response.code, message = body.take(240)),
            )
        }
    }

    private fun mapThrowable(t: Throwable): AppError = when (t) {
        is SocketTimeoutException -> AppError.Network(AppError.NetworkKind.TIMEOUT, t)
        is UnknownHostException -> AppError.Network(AppError.NetworkKind.DNS, t)
        is SSLException -> AppError.Network(AppError.NetworkKind.TLS, t)
        is IOException -> AppError.Network(AppError.NetworkKind.UNKNOWN, t)
        else -> AppError.Unexpected(t.message ?: "unknown", t)
    }

    private data class CallTag(val path: String)

    companion object {
        fun defaultClient(
            config: NetworkConfig,
            tokenProvider: AuthTokenProvider,
            logger: Logger,
            tokenRefresher: TokenRefresher?,
            sessionStore: SessionStore?,
        ): OkHttpClient {
            // Token read uses limited IO; avoids blocking the OkHttp dispatcher long-term.
            val authInterceptor = Interceptor { chain ->
                val original = chain.request()
                val token = runCatching {
                    runBlocking(Dispatchers.IO.limitedParallelism(2)) {
                        tokenProvider.bearerToken()
                    }
                }.getOrNull()
                val withAgent = original.newBuilder()
                    .header("User-Agent", config.userAgent)
                    .header("Accept", "application/json")
                if (!token.isNullOrBlank()) {
                    withAgent.header("Authorization", "Bearer $token")
                }
                chain.proceed(withAgent.build())
            }

            val loggingInterceptor = Interceptor { chain ->
                val request = chain.request()
                logger.d("ApiClient", "${request.method} ${request.url.encodedPath}")
                chain.proceed(request)
            }

            val builder = OkHttpClient.Builder()
                .connectTimeout(config.connectTimeoutMs, TimeUnit.MILLISECONDS)
                .readTimeout(config.readTimeoutMs, TimeUnit.MILLISECONDS)
                .writeTimeout(config.writeTimeoutMs, TimeUnit.MILLISECONDS)
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
                .retryOnConnectionFailure(true)

            if (tokenRefresher != null && sessionStore != null) {
                builder.authenticator(TokenAuthenticator(tokenRefresher, sessionStore, logger))
            }

            return builder.build()
        }

        fun join(baseUrl: String, path: String): String {
            val base = baseUrl.trimEnd('/')
            val rel = if (path.startsWith("/")) path else "/$path"
            return base + rel
        }
    }
}

class TokenAuthenticator(
    private val refresher: TokenRefresher,
    private val sessionStore: SessionStore,
    private val logger: Logger,
) : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? {
        if (responseCount(response) >= 2) return null
        val refreshed = runCatching {
            runBlocking(Dispatchers.IO.limitedParallelism(2)) { refresher.refresh() }
        }.getOrNull() ?: return null
        val tokens = when (refreshed) {
            is AppResult.Ok -> refreshed.value
            is AppResult.Err -> {
                logger.w("TokenAuthenticator", "refresh failed")
                runBlocking(Dispatchers.IO) { sessionStore.clear() }
                return null
            }
        }
        return response.request.newBuilder()
            .header("Authorization", "Bearer ${tokens.accessToken}")
            .build()
    }

    private fun responseCount(response: Response): Int {
        var result = 1
        var prior = response.priorResponse
        while (prior != null) {
            result++
            prior = prior.priorResponse
        }
        return result
    }
}
