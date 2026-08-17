package com.fitconnect.shared.telemetry

fun interface SensorCapabilityProbe {
    fun heartRate(): MetricAvailability
}

object UnavailableSensorProbe : SensorCapabilityProbe {
    override fun heartRate(): MetricAvailability = MetricAvailability.UNAVAILABLE
}
