package com.fitconnect.android.telemetry.time

/**
 * Centralized temporal model. Telemetry timestamps are epoch-based and carry
 * the zone offset in effect when the measurement was taken, so local wall time
 * (sleep, cross-midnight sessions, DST changes) can always be reconstructed.
 * Comparisons are always epoch-based — never string-based.
 */
data class TelemetryInstant(
    val epochMs: Long,
    val zoneOffsetMinutes: Int = 0,
    val zoneId: String = "UTC",
) : Comparable<TelemetryInstant> {

    val localEpochMs: Long get() = epochMs + zoneOffsetMinutes * 60_000L

    override fun compareTo(other: TelemetryInstant): Int = epochMs.compareTo(other.epochMs)

    fun plusMs(deltaMs: Long): TelemetryInstant = copy(epochMs = epochMs + deltaMs)

    /** Local calendar day bucket (days since epoch in local wall time). */
    fun localDayIndex(): Long = Math.floorDiv(localEpochMs, 86_400_000L)

    /** Local hour bucket. */
    fun localHourIndex(): Long = Math.floorDiv(localEpochMs, 3_600_000L)

    companion object {
        fun utc(epochMs: Long): TelemetryInstant = TelemetryInstant(epochMs)

        fun now(clock: TelemetryClock = SystemTelemetryClock): TelemetryInstant =
            TelemetryInstant(clock.nowEpochMs(), clock.zoneOffsetMinutes(), clock.zoneId())
    }
}

/** Injectable clock — tests never depend on wall time. */
interface TelemetryClock {
    fun nowEpochMs(): Long
    fun zoneOffsetMinutes(): Int
    fun zoneId(): String
}

object SystemTelemetryClock : TelemetryClock {
    override fun nowEpochMs(): Long = System.currentTimeMillis()
    override fun zoneOffsetMinutes(): Int =
        java.util.TimeZone.getDefault().getOffset(System.currentTimeMillis()) / 60_000
    override fun zoneId(): String = java.util.TimeZone.getDefault().id
}

class FixedTelemetryClock(
    private var epochMs: Long,
    private val offsetMinutes: Int = 0,
    private val zone: String = "UTC",
) : TelemetryClock {
    override fun nowEpochMs(): Long = epochMs
    override fun zoneOffsetMinutes(): Int = offsetMinutes
    override fun zoneId(): String = zone
    fun advance(deltaMs: Long) { epochMs += deltaMs }
}

/** Closed time range in epoch ms. */
data class TimeRange(val start: TelemetryInstant, val end: TelemetryInstant) {
    init { require(end.epochMs >= start.epochMs) { "TimeRange end before start" } }
    operator fun contains(instant: TelemetryInstant): Boolean =
        instant.epochMs in start.epochMs..end.epochMs

    fun overlaps(other: TimeRange): Boolean =
        start.epochMs <= other.end.epochMs && other.start.epochMs <= end.epochMs

    fun overlapMs(other: TimeRange): Long {
        val overlapStart = maxOf(start.epochMs, other.start.epochMs)
        val overlapEnd = minOf(end.epochMs, other.end.epochMs)
        return (overlapEnd - overlapStart).coerceAtLeast(0)
    }

    val durationMs: Long get() = end.epochMs - start.epochMs
}
