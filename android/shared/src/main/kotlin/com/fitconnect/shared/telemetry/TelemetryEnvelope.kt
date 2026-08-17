package com.fitconnect.shared.telemetry

import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.wear.WearPaths

data class TelemetryEnvelopeSample(
    val metric: String,
    val value: Double?,
    val unit: String,
    val availability: MetricAvailability,
    val timestampEpochMs: Long,
)

/**
 * Versioned watch→mobile payload. [sequenceNumber] is monotonic per [deviceId]+[sessionId].
 */
data class TelemetryEnvelope(
    val schemaVersion: String = WearPaths.SCHEMA,
    val sessionId: String,
    val deviceId: String,
    val userId: String,
    val timestampEpochMs: Long,
    val sequenceNumber: Long,
    val source: DataSourceKind,
    val samples: List<TelemetryEnvelopeSample>,
) {
    fun toWire(): String = buildString {
        append("v=").append(schemaVersion)
        append(";sid=").append(sessionId)
        append(";did=").append(deviceId)
        append(";uid=").append(userId)
        append(";t=").append(timestampEpochMs)
        append(";seq=").append(sequenceNumber)
        append(";src=").append(source.name)
        append(";n=").append(samples.size)
        samples.forEachIndexed { i, s ->
            append("|").append(i).append(':')
            append(s.metric).append(',')
            append(s.value?.toString() ?: "").append(',')
            append(s.unit).append(',')
            append(s.availability.name).append(',')
            append(s.timestampEpochMs)
        }
    }

    companion object {
        fun parse(wire: String): TelemetryEnvelope {
            val parts = wire.split('|')
            val header = parts.first().split(';').associate { token ->
                val eq = token.indexOf('=')
                require(eq > 0) { "Malformed envelope header" }
                token.substring(0, eq) to token.substring(eq + 1)
            }
            val samples = parts.drop(1).map { raw ->
                val body = raw.substringAfter(':')
                val f = body.split(',')
                require(f.size == 5) { "Malformed sample" }
                TelemetryEnvelopeSample(
                    metric = f[0],
                    value = f[1].ifEmpty { null }?.toDouble(),
                    unit = f[2],
                    availability = MetricAvailability.valueOf(f[3]),
                    timestampEpochMs = f[4].toLong(),
                )
            }
            return TelemetryEnvelope(
                schemaVersion = header.getValue("v"),
                sessionId = header.getValue("sid"),
                deviceId = header.getValue("did"),
                userId = header.getValue("uid"),
                timestampEpochMs = header.getValue("t").toLong(),
                sequenceNumber = header.getValue("seq").toLong(),
                source = DataSourceKind.valueOf(header.getValue("src")),
                samples = samples,
            )
        }
    }
}
