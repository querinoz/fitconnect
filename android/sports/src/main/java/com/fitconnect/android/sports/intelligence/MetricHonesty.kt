package com.fitconnect.android.sports.intelligence

/**
 * Honest biometric / readiness availability.
 * Never invent readiness, HR, or calories — only surface values when [AVAILABLE].
 */
enum class HonestyStatus {
    NOT_CONNECTED,
    MISSING,
    UNAVAILABLE,
    LOADING,
    ERROR,
    AVAILABLE,
}

/**
 * Typed metric that cannot silently fabricate a value.
 * [value] is non-null only when [status] is [HonestyStatus.AVAILABLE].
 */
data class HonestMetric<T>(
    val status: HonestyStatus,
    val value: T? = null,
    val reason: String = "",
) {
    init {
        if (status == HonestyStatus.AVAILABLE) {
            require(value != null) { "AVAILABLE metrics require a value" }
        } else {
            require(value == null) { "Non-AVAILABLE metrics must not carry a value" }
        }
    }

    fun displayOrDash(format: (T) -> String = { it.toString() }): String =
        if (status == HonestyStatus.AVAILABLE && value != null) format(value) else "—"

    fun label(): String = when (status) {
        HonestyStatus.NOT_CONNECTED -> "NOT CONNECTED"
        HonestyStatus.MISSING -> "MISSING"
        HonestyStatus.UNAVAILABLE -> "UNAVAILABLE"
        HonestyStatus.LOADING -> "LOADING"
        HonestyStatus.ERROR -> "ERROR"
        HonestyStatus.AVAILABLE -> "AVAILABLE"
    }

    companion object {
        fun <T> available(value: T, reason: String = ""): HonestMetric<T> =
            HonestMetric(HonestyStatus.AVAILABLE, value, reason)

        fun <T> notConnected(reason: String = "Provider not connected"): HonestMetric<T> =
            HonestMetric(HonestyStatus.NOT_CONNECTED, null, reason)

        fun <T> missing(reason: String = "No sample for this window"): HonestMetric<T> =
            HonestMetric(HonestyStatus.MISSING, null, reason)

        fun <T> unavailable(reason: String = "Capability unavailable"): HonestMetric<T> =
            HonestMetric(HonestyStatus.UNAVAILABLE, null, reason)

        fun <T> loading(reason: String = "Loading"): HonestMetric<T> =
            HonestMetric(HonestyStatus.LOADING, null, reason)

        fun <T> error(reason: String = "Read failed"): HonestMetric<T> =
            HonestMetric(HonestyStatus.ERROR, null, reason)

        /** Only promote a raw nullable into AVAILABLE when a real value exists. */
        fun <T> fromNullable(
            value: T?,
            whenNull: HonestyStatus = HonestyStatus.MISSING,
            reasonWhenNull: String = "No value provided",
        ): HonestMetric<T> =
            if (value != null) available(value) else HonestMetric(whenNull, null, reasonWhenNull)
    }
}

data class SessionHonestyBundle(
    val readiness: HonestMetric<Int> = HonestMetric.missing("Readiness not provided"),
    val heartRateBpm: HonestMetric<Int> = HonestMetric.notConnected("Heart rate source not connected"),
    val caloriesKcal: HonestMetric<Int> = HonestMetric.missing("Calories not provided"),
) {
    fun readinessDisplay(): String = readiness.displayOrDash { "$it" }
    fun hrDisplay(): String = heartRateBpm.displayOrDash { "$it bpm" }
    fun caloriesDisplay(): String = caloriesKcal.displayOrDash { "$it kcal" }
}
