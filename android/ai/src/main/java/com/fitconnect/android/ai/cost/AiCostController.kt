package com.fitconnect.android.ai.cost

import com.fitconnect.android.ai.domain.TokenUsage

data class CostRecord(
    val atEpochMs: Long,
    val userId: String,
    val feature: String,
    val modelId: String,
    val usage: TokenUsage,
    val latencyMs: Long,
    val estimatedMicros: Long,
)

/**
 * Cost / rate / budget controls. Logs never include prompt bodies.
 */
class AiCostController(
    private val nowProvider: () -> Long = System::currentTimeMillis,
    private val maxRequestsPerHour: Int = 60,
    private val budgetMicrosPerDay: Long = 5_000_000, // abstract micro-units
    private val microsPerToken: Long = 2,
) {
    private val records = mutableListOf<CostRecord>()
    private val requestTimes = mutableMapOf<String, ArrayDeque<Long>>()
    private val cache = mutableMapOf<String, Pair<Long, String>>()

    @Synchronized
    fun allowRequest(userId: String): Boolean {
        val now = nowProvider()
        val q = requestTimes.getOrPut(userId) { ArrayDeque() }
        while (q.isNotEmpty() && now - q.first() > 3_600_000) q.removeFirst()
        if (q.size >= maxRequestsPerHour) return false
        val daySpend = records.filter { it.userId == userId && now - it.atEpochMs < 86_400_000 }
            .sumOf { it.estimatedMicros }
        if (daySpend >= budgetMicrosPerDay) return false
        q.addLast(now)
        return true
    }

    @Synchronized
    fun record(userId: String, feature: String, modelId: String, usage: TokenUsage, latencyMs: Long) {
        records += CostRecord(
            atEpochMs = nowProvider(),
            userId = userId,
            feature = feature,
            modelId = modelId,
            usage = usage,
            latencyMs = latencyMs,
            estimatedMicros = usage.total * microsPerToken,
        )
    }

    @Synchronized
    fun cached(key: String, ttlMs: Long = 60_000): String? {
        val hit = cache[key] ?: return null
        return if (nowProvider() - hit.first <= ttlMs) hit.second else null
    }

    @Synchronized
    fun putCache(key: String, value: String) {
        cache[key] = nowProvider() to value
    }

    @Synchronized
    fun snapshot(): List<CostRecord> = records.toList()
}
