package com.fitconnect.android.telemetry.wear

import android.content.Context
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.telemetry.observability.WatchDiagEvent
import com.fitconnect.android.telemetry.observability.WatchDiagnostics
import com.fitconnect.shared.sync.OutboxQueue
import com.fitconnect.shared.sync.OutboxRecord
import com.fitconnect.shared.wear.SessionControlCommand
import com.fitconnect.shared.wear.WearPaths
import com.google.android.gms.wearable.CapabilityClient
import com.google.android.gms.wearable.Node
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.tasks.await

internal suspend fun remoteFitConnectNodes(context: Context, filter: Int): List<Node> {
    val localId = try {
        Wearable.getNodeClient(context).localNode.await().id
    } catch (_: Throwable) {
        null
    }
    return Wearable.getCapabilityClient(context)
        .getCapability(WearPaths.CAPABILITY, filter)
        .await()
        .nodes
        .filter { it.id != localId }
}

/**
 * Play Services Data Layer. FitConnect capability must be advertised by the
 * watch app. A Bluetooth-paired watch without our capability is NOT_PAIRED.
 */
class GmsWearCompanion(
    private val context: Context,
    private val diagnostics: WatchDiagnostics = WatchDiagnostics(),
) : WearableCompanionPort {
    override suspend fun state(): WearCompanionState =
        try {
            val reachable = remoteFitConnectNodes(context, CapabilityClient.FILTER_REACHABLE)
            val all = remoteFitConnectNodes(context, CapabilityClient.FILTER_ALL)
            when {
                reachable.isNotEmpty() -> WearCompanionState.CONNECTED
                all.isNotEmpty() -> WearCompanionState.PAIRED
                else -> WearCompanionState.NOT_PAIRED
            }
        } catch (_: Throwable) {
            WearCompanionState.ERROR
        }

    override suspend fun requestSync(): AppResult<Unit> {
        diagnostics.record(WatchDiagEvent.SYNC_STARTED)
        val nodes = try {
            remoteFitConnectNodes(context, CapabilityClient.FILTER_REACHABLE)
        } catch (t: Throwable) {
            diagnostics.record(WatchDiagEvent.SYNC_FAILED)
            return AppResult.Err(AppError.Unexpected(t.message ?: "Wear capability query failed"))
        }
        if (nodes.isEmpty()) {
            diagnostics.record(WatchDiagEvent.SYNC_FAILED)
            return AppResult.Err(AppError.Unexpected("No FitConnect Wear node reachable"))
        }
        nodes.forEach { node ->
            Wearable.getMessageClient(context)
                .sendMessage(node.id, WearPaths.SYNC_STATUS, ByteArray(0))
                .await()
        }
        diagnostics.record(WatchDiagEvent.SYNC_COMPLETED)
        return AppResult.Ok(Unit)
    }

    override fun liveHeartRate(): Flow<com.fitconnect.android.telemetry.domain.TelemetrySample> =
        MutableSharedFlow<com.fitconnect.android.telemetry.domain.TelemetrySample>().asSharedFlow()
}

class GmsWearSessionLink(private val context: Context) : WearSessionLink {
    override val transport: String = "DATALAYER_GMS"
    private val _events = MutableSharedFlow<WearLinkEvent>(extraBufferCapacity = 64)
    private val outbox = OutboxQueue()
    private var seq = 0L
    private var offline = false

    override fun events(): Flow<WearLinkEvent> = _events.asSharedFlow()

    override suspend fun send(event: WearLinkEvent): AppResult<Unit> {
        seq += 1
        val record = OutboxRecord(seq, event.atEpochMs, "${event.kind}:${event.payload}")
        outbox.enqueue(record)
        if (offline) return AppResult.Ok(Unit)
        return flush()
    }

    override fun setOffline(offline: Boolean) {
        this.offline = offline
    }

    override fun pendingCount(): Int = outbox.size()

    private suspend fun flush(): AppResult<Unit> {
        val nodes = try {
            remoteFitConnectNodes(context, CapabilityClient.FILTER_REACHABLE)
        } catch (t: Throwable) {
            return AppResult.Err(AppError.Unexpected(t.message ?: "Wear capability query failed"))
        }
        if (nodes.isEmpty()) {
            return AppResult.Ok(Unit)
        }
        outbox.pending().forEach { item ->
            outbox.markInFlight(item.sequenceNumber)
            try {
                nodes.forEach { node ->
                    Wearable.getMessageClient(context)
                        .sendMessage(node.id, WearPaths.SESSION_STATE, item.payload.toByteArray())
                        .await()
                }
                outbox.ack(item.sequenceNumber)
            } catch (_: Throwable) {
                outbox.fail(item.sequenceNumber)
            }
        }
        return AppResult.Ok(Unit)
    }
}

class GmsWearWorkoutControl(private val context: Context) : WearWorkoutControlPort {
    override suspend fun startWorkout(sportKey: String): AppResult<Unit> =
        send(SessionControlCommand.START, sportKey)

    override suspend fun pauseWorkout(): AppResult<Unit> =
        send(SessionControlCommand.PAUSE, "Run")

    override suspend fun resumeWorkout(): AppResult<Unit> =
        send(SessionControlCommand.RESUME, "Run")

    override suspend fun endWorkout(): AppResult<Unit> =
        send(SessionControlCommand.END, "Run")

    private suspend fun send(op: String, sportKey: String): AppResult<Unit> {
        val nodes = try {
            remoteFitConnectNodes(context, CapabilityClient.FILTER_REACHABLE)
        } catch (t: Throwable) {
            return AppResult.Err(AppError.Unexpected(t.message ?: "Wear capability query failed"))
        }
        if (nodes.isEmpty()) {
            return AppResult.Err(AppError.Unexpected("No FitConnect Wear node reachable"))
        }
        val payload = SessionControlCommand(op = op, sportKey = sportKey).toWire().toByteArray()
        nodes.forEach { node ->
            Wearable.getMessageClient(context)
                .sendMessage(node.id, WearPaths.SESSION_CONTROL, payload)
                .await()
        }
        return AppResult.Ok(Unit)
    }
}
