package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.map
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

/**
 * DEBUG/TEST ONLY in-process realtime bus.
 * Enables dual-client simulation without network. Never selected in release production path.
 */
class InProcessRealtimeClient(
    private val bus: InProcessRealtimeBus = InProcessRealtimeBus.shared,
    private val logger: Logger? = null,
    private val clientId: String = "client-${System.nanoTime()}",
) : RealtimeClient {
    private val connected = AtomicBoolean(false)

    override suspend fun connect(): AppResult<Unit> {
        connected.set(true)
        logger?.i("InProcessRealtime", "connected id=$clientId")
        return AppResult.Ok(Unit)
    }

    override suspend fun disconnect() {
        connected.set(false)
        logger?.i("InProcessRealtime", "disconnected id=$clientId")
    }

    override fun subscribe(topic: String): Flow<String> =
        bus.events
            .filter { it.topic == topic && it.originClientId != clientId }
            .map { it.payload }

    override suspend fun publish(topic: String, payload: String): AppResult<Unit> {
        if (!connected.get()) {
            return AppResult.Err(
                com.fitconnect.android.foundation.common.AppError.Network(
                    com.fitconnect.android.foundation.common.AppError.NetworkKind.UNKNOWN,
                ),
            )
        }
        bus.emit(InProcessRealtimeBus.Event(topic, payload, clientId))
        return AppResult.Ok(Unit)
    }
}

class InProcessRealtimeBus {
    private val flow = MutableSharedFlow<Event>(extraBufferCapacity = 64)
    val events = flow.asSharedFlow()

    fun emit(event: Event) {
        flow.tryEmit(event)
    }

    data class Event(
        val topic: String,
        val payload: String,
        val originClientId: String,
    )

    companion object {
        val shared = InProcessRealtimeBus()
    }
}
