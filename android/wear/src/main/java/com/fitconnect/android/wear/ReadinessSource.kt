package com.fitconnect.android.wear

/**
 * Production readiness provenance for Wear surfaces.
 *
 * Never silently invent a score. [LocalDemo] is test/debug only and must not be
 * selected unless the caller passes an explicit allow flag (gated to
 * [com.fitconnect.android.wear.BuildConfig.DEBUG] +
 * [com.fitconnect.android.wear.BuildConfig.ALLOW_LOCAL_DEMO_READINESS]).
 */
sealed class ReadinessSource {
    data object Unavailable : ReadinessSource()

    data class SyncedFromPhone(
        val score: Int,
        val syncedAtEpochMs: Long,
    ) : ReadinessSource()

    /**
     * Health Services–derived readiness. [score] is null when the capability path
     * exists in architecture but no measured/computed value has been produced yet —
     * never fabricate a BPM or readiness integer.
     */
    data class HealthServices(
        val score: Int?,
        val measuredAtEpochMs: Long?,
    ) : ReadinessSource()

    /** Explicit debug/test fixture. Not a sensor reading. */
    data class LocalDemo(
        val score: Int,
    ) : ReadinessSource()
}

data class ReadinessPresentation(
    val value: String,
    val footnote: String,
    val shortLabel: String,
    val contentDescription: String,
    val rangedValue: Float?,
)

fun ReadinessSource.toPresentation(): ReadinessPresentation = when (this) {
    ReadinessSource.Unavailable -> ReadinessPresentation(
        value = "—",
        footnote = "NO SOURCE · AWAIT PHONE SYNC",
        shortLabel = "WAIT",
        contentDescription = "FitConnect readiness unavailable — no phone sync or Health Services value",
        rangedValue = null,
    )
    is ReadinessSource.SyncedFromPhone -> ReadinessPresentation(
        value = score.coerceIn(0, 100).toString(),
        footnote = "SYNCED · PHONE",
        shortLabel = "SYNC",
        contentDescription = "FitConnect readiness $score synced from phone",
        rangedValue = score.coerceIn(0, 100).toFloat(),
    )
    is ReadinessSource.HealthServices -> {
        val display = score?.coerceIn(0, 100)?.toString() ?: "—"
        ReadinessPresentation(
            value = display,
            footnote = if (score != null) "HEALTH SERVICES" else "HEALTH SERVICES · PENDING",
            shortLabel = "HS",
            contentDescription = if (score != null) {
                "FitConnect readiness $score from Health Services"
            } else {
                "FitConnect Health Services readiness pending — no fabricated value"
            },
            rangedValue = score?.coerceIn(0, 100)?.toFloat(),
        )
    }
    is ReadinessSource.LocalDemo -> ReadinessPresentation(
        value = score.coerceIn(0, 100).toString(),
        footnote = "LOCAL_DEMO · TEST ONLY",
        shortLabel = "DEMO",
        contentDescription = "FitConnect readiness $score LOCAL_DEMO test fixture — not measured",
        rangedValue = score.coerceIn(0, 100).toFloat(),
    )
}

/**
 * Pure selection policy for Wear readiness. Prefer phone sync, then a real Health
 * Services score, then optional LocalDemo, else Unavailable.
 */
object WearReadinessSelector {
    const val LOCAL_DEMO_SCORE = 88

    fun select(
        phoneSynced: ReadinessSource.SyncedFromPhone?,
        healthServices: ReadinessSource.HealthServices?,
        allowLocalDemo: Boolean,
        localDemoScore: Int = LOCAL_DEMO_SCORE,
    ): ReadinessSource {
        if (phoneSynced != null) return phoneSynced
        val hsScore = healthServices?.score
        if (healthServices != null && hsScore != null) return healthServices
        if (allowLocalDemo) return ReadinessSource.LocalDemo(localDemoScore)
        return ReadinessSource.Unavailable
    }

    fun allowLocalDemo(debugBuild: Boolean, explicitFlag: Boolean): Boolean =
        debugBuild && explicitFlag
}
