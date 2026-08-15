package com.fitconnect.android.telemetry.wear

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlin.collections.ArrayDeque

enum class WearLinkEventKind {
    START_SESSION,
    PAUSE_SESSION,
    RESUME_SESSION,
    END_SESSION,
    READINESS_UPDATE,
    HEART_RATE_UPDATE,
}

data class WearLinkEvent(
    val kind: WearLinkEventKind,
    val atEpochMs: Long,
    val payload: String = "",
)

/**
 * Phone ↔ watch session link.
 * [InMemoryWearSessionLink] is LOCAL_DEMO / unit tests.
 * [UnboundDataLayerWearSessionLink] never pretends DataLayer is connected.
 */
interface WearSessionLink {
    val transport: String
    fun events(): Flow<WearLinkEvent>
    suspend fun send(event: WearLinkEvent): AppResult<Unit>
    fun setOffline(offline: Boolean)
    fun pendingCount(): Int
}

class InMemoryWearSessionLink : WearSessionLink {
    override val transport: String = "IN_MEMORY"
    private val _events = MutableSharedFlow<WearLinkEvent>(replay = 8, extraBufferCapacity = 64)
    private val queue = ArrayDeque<WearLinkEvent>()
    private var offline = false

    override fun events(): Flow<WearLinkEvent> = _events.asSharedFlow()

    override suspend fun send(event: WearLinkEvent): AppResult<Unit> {
        if (offline) {
            queue.addLast(event)
            return AppResult.Ok(Unit)
        }
        _events.tryEmit(event)
        return AppResult.Ok(Unit)
    }

    override fun setOffline(offline: Boolean) {
        this.offline = offline
        if (!offline) {
            while (queue.isNotEmpty()) {
                _events.tryEmit(queue.removeFirst())
            }
        }
    }

    override fun pendingCount(): Int = queue.size
}

/** Production DataLayer is not bound — calls fail closed. */
class UnboundDataLayerWearSessionLink : WearSessionLink {
    override val transport: String = "DATALAYER_UNBOUND"
    override fun events(): Flow<WearLinkEvent> = MutableSharedFlow<WearLinkEvent>().asSharedFlow()
    override suspend fun send(event: WearLinkEvent): AppResult<Unit> =
        AppResult.Err(AppError.Unexpected("Wear DataLayer is not bound (PENDING_HUMAN)"))
    override fun setOffline(offline: Boolean) = Unit
    override fun pendingCount(): Int = 0
}
