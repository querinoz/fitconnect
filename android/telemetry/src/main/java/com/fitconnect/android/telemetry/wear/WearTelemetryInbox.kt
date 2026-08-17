package com.fitconnect.android.telemetry.wear

import com.fitconnect.shared.sync.SequenceDeduper
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.wear.WearPaths
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class WearIngestResult { ACCEPTED, DUPLICATE, REJECTED }

/**
 * Phone-side watch→mobile ingest. Dedupes by [TelemetryEnvelope.sequenceNumber].
 * Does not invent samples.
 */
class WearTelemetryInbox(
    private val deduper: SequenceDeduper = SequenceDeduper(),
) {
    private val _lastEnvelope = MutableStateFlow<TelemetryEnvelope?>(null)
    val lastEnvelope: StateFlow<TelemetryEnvelope?> = _lastEnvelope.asStateFlow()

    @Volatile var acceptedCount: Int = 0
        private set
    @Volatile var duplicateCount: Int = 0
        private set
    @Volatile var rejectedCount: Int = 0
        private set

    fun ingest(wire: String): WearIngestResult {
        val envelope = try {
            TelemetryEnvelope.parse(wire)
        } catch (_: Throwable) {
            rejectedCount += 1
            return WearIngestResult.REJECTED
        }
        if (envelope.schemaVersion != WearPaths.SCHEMA) {
            rejectedCount += 1
            return WearIngestResult.REJECTED
        }
        if (!deduper.accept(envelope.sequenceNumber)) {
            duplicateCount += 1
            return WearIngestResult.DUPLICATE
        }
        _lastEnvelope.value = envelope
        acceptedCount += 1
        return WearIngestResult.ACCEPTED
    }
}
