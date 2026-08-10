package com.fitconnect.android.foundation.perf

/**
 * Enforced performance budgets. Exceeding a budget must trigger investigation —
 * never silently raise the ceiling without evidence.
 */
object PerformanceBudget {
    /** Mid-range cold start to usable shell (ms). */
    const val COLD_START_SHELL_MS = 2_500L

    /** Warm start target (ms). */
    const val WARM_START_MS = 1_000L

    /** Max navigation commit without jank investigation (ms). */
    const val NAVIGATION_MS = 300L

    /** HTTP response cache entries. */
    const val HTTP_CACHE_ENTRIES = 64

    /** Telemetry samples retained per athlete (soft cap). */
    const val TELEMETRY_SAMPLES_PER_ATHLETE = 50_000

    /** Aggregation values retained per bucket before reservoir downsample. */
    const val AGG_BUCKET_RESERVOIR = 256

    /** Offline queue max pending mutations. */
    const val OFFLINE_QUEUE_MAX = 500

    /** AI audit ring buffer size. */
    const val AI_AUDIT_RING = 200

    /** Max concurrent identical in-flight GET dedupe window (ms). */
    const val REQUEST_DEDUPE_MS = 1_500L
}

data class StartupMark(
    val name: String,
    val elapsedMs: Long,
    val withinBudget: Boolean,
)

class StartupTracer(
    private val nowMs: () -> Long = System::currentTimeMillis,
) {
    private val t0 = nowMs()
    private val marks = mutableListOf<StartupMark>()

    fun mark(name: String, budgetMs: Long = PerformanceBudget.COLD_START_SHELL_MS): StartupMark {
        val elapsed = nowMs() - t0
        val mark = StartupMark(name, elapsed, elapsed <= budgetMs)
        synchronized(marks) { marks += mark }
        return mark
    }

    fun snapshot(): List<StartupMark> = synchronized(marks) { marks.toList() }
}
