package com.fitconnect.android.foundation.realtime

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.RealtimeClient
import com.fitconnect.android.foundation.session.SessionStore
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import java.util.concurrent.ConcurrentHashMap

/**
 * Minimal product realtime subscriber: connect → subscribe → receive → dedupe → disconnect.
 * Engineering-complete against RealtimeClient; production delivery needs live Supabase infra.
 */
class ProductRealtimeHub(
    private val realtime: RealtimeClient,
    private val sessionStore: SessionStore,
    private val scope: CoroutineScope,
) {
    private val _link = MutableStateFlow(ProductRealtimeLinkState.DISCONNECTED)
    val linkState: StateFlow<ProductRealtimeLinkState> = _link.asStateFlow()

    private val _lastPayload = MutableStateFlow<String?>(null)
    val lastPayload: StateFlow<String?> = _lastPayload.asStateFlow()

    private val seen = ConcurrentHashMap.newKeySet<String>()
    private var jobs: List<Job> = emptyList()

    suspend fun start(topics: List<String> = listOf(
        ProductRealtimeTopics.SESSION,
        ProductRealtimeTopics.BOOKING,
        ProductRealtimeTopics.MESSAGE,
        ProductRealtimeTopics.ACTIVITY,
    )): AppResult<Unit> {
        stop()
        if (sessionStore.snapshot().userId.isNullOrBlank() && !sessionStore.snapshot().isLocalDemo) {
            _link.value = ProductRealtimeLinkState.UNAUTHORIZED
            return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        _link.value = ProductRealtimeLinkState.CONNECTING
        return when (val c = realtime.connect()) {
            is AppResult.Err -> {
                _link.value = ProductRealtimeLinkState.UNAVAILABLE
                c
            }
            is AppResult.Ok -> {
                val ready = topics.map { CompletableDeferred<Unit>() }
                jobs = topics.mapIndexed { index, topic ->
                    scope.launch {
                        realtime.subscribe(topic)
                            .onStart { ready[index].complete(Unit) }
                            .catch {
                                _link.value = ProductRealtimeLinkState.RECONNECTING
                            }
                            .collect { payload ->
                                val key = "$topic:${payload.hashCode()}"
                                if (seen.add(key)) {
                                    _lastPayload.value = payload
                                    if (seen.size > 512) seen.clear()
                                }
                            }
                    }
                }
                runCatching {
                    withTimeout(3_000) {
                        ready.forEach { it.await() }
                    }
                }
                _link.value = ProductRealtimeLinkState.CONNECTED
                AppResult.Ok(Unit)
            }
        }
    }

    suspend fun stop() {
        jobs.forEach { it.cancel() }
        jobs = emptyList()
        realtime.disconnect()
        _link.value = ProductRealtimeLinkState.DISCONNECTED
    }
}
