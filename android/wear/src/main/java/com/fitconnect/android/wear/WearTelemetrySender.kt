package com.fitconnect.android.wear

import android.content.Context
import com.fitconnect.android.capture.LiveActivitySnapshot
import com.fitconnect.android.capture.toTelemetryEnvelope
import com.fitconnect.shared.sync.OutboxQueue
import com.fitconnect.shared.sync.OutboxRecord
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.wear.WearPaths
import com.google.android.gms.wearable.CapabilityClient
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.tasks.await

/**
 * Watch → phone Data Layer sender. Buffers when no reachable phone node.
 * Payload is telemetry.v1; never an untyped string bag.
 */
class WearTelemetrySender(private val context: Context) {
    private val outbox = OutboxQueue()

    val pendingCount: Int get() = outbox.size()

    suspend fun publish(
        snapshot: LiveActivitySnapshot,
        heartRateCapability: MetricAvailability,
        sessionId: String,
        deviceId: String,
        userId: String,
        sequenceNumber: Long,
        timestampEpochMs: Long,
    ) {
        val envelope = snapshot.toTelemetryEnvelope(
            sessionId = sessionId,
            deviceId = deviceId,
            userId = userId,
            sequenceNumber = sequenceNumber,
            timestampEpochMs = timestampEpochMs,
            heartRateCapability = heartRateCapability,
        )
        val record = OutboxRecord(sequenceNumber, timestampEpochMs, envelope.toWire())
        outbox.enqueue(record)
        flush()
    }

    suspend fun flush() {
        val localId = try {
            Wearable.getNodeClient(context).localNode.await().id
        } catch (_: Throwable) {
            null
        }
        val nodes = try {
            Wearable.getCapabilityClient(context)
                .getCapability(WearPaths.CAPABILITY, CapabilityClient.FILTER_REACHABLE)
                .await()
                .nodes
                .filter { it.id != localId }
        } catch (_: Throwable) {
            return
        }
        if (nodes.isEmpty()) return
        outbox.pending().forEach { item ->
            outbox.markInFlight(item.sequenceNumber)
            try {
                nodes.forEach { node ->
                    Wearable.getMessageClient(context)
                        .sendMessage(node.id, WearPaths.TELEMETRY_LIVE, item.payload.toByteArray())
                        .await()
                }
                outbox.ack(item.sequenceNumber)
            } catch (_: Throwable) {
                outbox.fail(item.sequenceNumber)
            }
        }
    }
}
