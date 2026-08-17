package com.fitconnect.shared.sync

enum class OutboxSyncStatus { PENDING, IN_FLIGHT, ACKED }

data class OutboxRecord(
    val sequenceNumber: Long,
    val timestampEpochMs: Long,
    val payload: String,
    val retryCount: Int = 0,
    val syncStatus: OutboxSyncStatus = OutboxSyncStatus.PENDING,
)

/**
 * Offline-first queue. ACK removes by [sequenceNumber] (idempotent).
 * Duplicate sequence numbers are ignored on enqueue.
 */
class OutboxQueue {
    private val items = linkedMapOf<Long, OutboxRecord>()

    fun enqueue(record: OutboxRecord): Boolean {
        if (items.containsKey(record.sequenceNumber)) return false
        items[record.sequenceNumber] = record.copy(syncStatus = OutboxSyncStatus.PENDING)
        return true
    }

    fun pending(): List<OutboxRecord> =
        items.values.filter { it.syncStatus != OutboxSyncStatus.ACKED }

    fun markInFlight(sequenceNumber: Long) {
        val current = items[sequenceNumber] ?: return
        items[sequenceNumber] = current.copy(syncStatus = OutboxSyncStatus.IN_FLIGHT)
    }

    fun ack(sequenceNumber: Long) {
        items.remove(sequenceNumber)
    }

    fun fail(sequenceNumber: Long) {
        val current = items[sequenceNumber] ?: return
        items[sequenceNumber] = current.copy(
            retryCount = current.retryCount + 1,
            syncStatus = OutboxSyncStatus.PENDING,
        )
    }

    fun size(): Int = items.size

    fun seen(sequenceNumber: Long): Boolean = items.containsKey(sequenceNumber)
}

/** Monotonic sequence + last-seen window to drop replays after ACK. */
class SequenceDeduper(private val window: Int = 2048) {
    private val seen = LinkedHashSet<Long>()

    fun accept(sequenceNumber: Long): Boolean {
        if (!seen.add(sequenceNumber)) return false
        while (seen.size > window) {
            val first = seen.iterator().next()
            seen.remove(first)
        }
        return true
    }
}
