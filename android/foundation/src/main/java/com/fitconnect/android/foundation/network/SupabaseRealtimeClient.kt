package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.config.AppConfig
import com.fitconnect.android.foundation.session.SessionStore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference

/**
 * Supabase Realtime WebSocket client (Phoenix channels).
 * Requires URL + anon key. Cross-client delivery verification remains BLOCKED without live env + devices.
 */
class SupabaseRealtimeClient(
    private val config: AppConfig,
    private val sessionStore: SessionStore,
    private val logger: Logger,
    private val http: OkHttpClient = OkHttpClient.Builder()
        .pingInterval(20, TimeUnit.SECONDS)
        .build(),
) : RealtimeClient {
    private val mutex = Mutex()
    private val socketRef = AtomicReference<WebSocket?>(null)
    private val ref = AtomicInteger(1)
    private val topicFlows = ConcurrentHashMap<String, CopyOnWriteArrayList<(String) -> Unit>>()

    override suspend fun connect(): AppResult<Unit> = mutex.withLock {
        val root = config.supabaseUrl?.trimEnd('/')
            ?: return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        if (config.supabaseAnonKey.isNullOrBlank()) {
            return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
        if (socketRef.get() != null) return AppResult.Ok(Unit)

        val tokenPresent = !sessionStore.accessToken().isNullOrBlank()
        val wsBase = root
            .replace("https://", "wss://")
            .replace("http://", "ws://")
        val url = "$wsBase/realtime/v1/websocket?apikey=${config.supabaseAnonKey}&vsn=1.0.0"
        val request = Request.Builder().url(url).build()
        val listener = object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                logger.i("SupabaseRealtime", "socket open tokenPresent=$tokenPresent")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                runCatching {
                    val json = JSONObject(text)
                    val topic = json.optString("topic")
                    val event = json.optString("event")
                    val payload = json.opt("payload")?.toString().orEmpty()
                    if (event == "phx_reply" || event.isBlank()) return
                    topicFlows[topic]?.forEach { it("""{"event":${JSONObject.quote(event)},"payload":$payload}""") }
                }.onFailure { logger.w("SupabaseRealtime", "message parse failed", it) }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                logger.w("SupabaseRealtime", "socket failure", t)
                socketRef.set(null)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                logger.i("SupabaseRealtime", "socket closed code=$code")
                socketRef.set(null)
            }
        }
        socketRef.set(http.newWebSocket(request, listener))
        AppResult.Ok(Unit)
    }

    override suspend fun disconnect() = mutex.withLock {
        socketRef.getAndSet(null)?.close(1000, "client_disconnect")
        topicFlows.clear()
    }

    override fun subscribe(topic: String): Flow<String> = callbackFlow {
        val ws = socketRef.get()
        if (ws == null) {
            close(IllegalStateException("realtime_not_connected"))
            return@callbackFlow
        }
        val listeners = topicFlows.getOrPut(topic) { CopyOnWriteArrayList() }
        val listener: (String) -> Unit = { trySend(it) }
        listeners += listener
        val join = JSONObject()
            .put("topic", topic)
            .put("event", "phx_join")
            .put("payload", JSONObject())
            .put("ref", ref.getAndIncrement().toString())
        ws.send(join.toString())
        awaitClose {
            listeners.remove(listener)
            val leave = JSONObject()
                .put("topic", topic)
                .put("event", "phx_leave")
                .put("payload", JSONObject())
                .put("ref", ref.getAndIncrement().toString())
            socketRef.get()?.send(leave.toString())
        }
    }

    override suspend fun publish(topic: String, payload: String): AppResult<Unit> {
        val ws = socketRef.get()
            ?: return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        val body = runCatching { JSONObject(payload) }.getOrElse { JSONObject().put("data", payload) }
        val frame = JSONObject()
            .put("topic", topic)
            .put("event", "broadcast")
            .put(
                "payload",
                JSONObject().put("type", "broadcast").put("event", "message").put("payload", body),
            )
            .put("ref", ref.getAndIncrement().toString())
        return if (ws.send(frame.toString())) AppResult.Ok(Unit)
        else AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
    }
}
