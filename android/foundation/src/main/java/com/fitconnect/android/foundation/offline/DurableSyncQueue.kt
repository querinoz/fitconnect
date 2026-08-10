package com.fitconnect.android.foundation.offline

import android.content.Context
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.perf.PerformanceBudget
import org.json.JSONArray
import org.json.JSONObject

/**
 * Durable outbox backed by SharedPreferences JSON.
 * Survives process death. Room remains the scale-up path when volume warrants
 * (see STORAGE_ARCHITECTURE_DECISION.md) — this unblocks correctness now.
 */
class DurableSyncQueue(
    context: Context,
    private val maxSize: Int = PerformanceBudget.OFFLINE_QUEUE_MAX,
) : SyncQueue {
    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private val lock = Any()

    override suspend fun enqueue(work: SyncWork): AppResult<Unit> = synchronized(lock) {
        val items = load()
        if (items.any { it.idempotencyKey == work.idempotencyKey }) {
            return@synchronized AppResult.Ok(Unit)
        }
        if (items.size >= maxSize) {
            return@synchronized AppResult.Err(AppError.Storage("Offline queue full ($maxSize)"))
        }
        items += work
        persist(items)
        AppResult.Ok(Unit)
    }

    override suspend fun peek(limit: Int): List<SyncWork> = synchronized(lock) {
        load().take(limit)
    }

    override suspend fun acknowledge(id: String): AppResult<Unit> = synchronized(lock) {
        val items = load().filterNot { it.id == id }
        persist(items)
        AppResult.Ok(Unit)
    }

    override suspend fun size(): Int = synchronized(lock) { load().size }

    override suspend fun clear(): AppResult<Unit> = synchronized(lock) {
        prefs.edit().remove(KEY).apply()
        AppResult.Ok(Unit)
    }

    private fun load(): MutableList<SyncWork> {
        val raw = prefs.getString(KEY, "[]") ?: "[]"
        val arr = JSONArray(raw)
        val out = mutableListOf<SyncWork>()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            out += SyncWork(
                id = o.getString("id"),
                type = o.getString("type"),
                payloadJson = o.getString("payload"),
                createdAtEpochMs = o.optLong("createdAt", System.currentTimeMillis()),
                attempts = o.optInt("attempts", 0),
                idempotencyKey = o.optString("idempotencyKey", o.getString("id")),
                conflictStrategy = runCatching {
                    ConflictStrategy.valueOf(o.optString("conflict", ConflictStrategy.SERVER_AUTHORITATIVE.name))
                }.getOrDefault(ConflictStrategy.SERVER_AUTHORITATIVE),
            )
        }
        return out
    }

    private fun persist(items: List<SyncWork>) {
        val arr = JSONArray()
        items.forEach { w ->
            arr.put(
                JSONObject()
                    .put("id", w.id)
                    .put("type", w.type)
                    .put("payload", w.payloadJson)
                    .put("createdAt", w.createdAtEpochMs)
                    .put("attempts", w.attempts)
                    .put("idempotencyKey", w.idempotencyKey)
                    .put("conflict", w.conflictStrategy.name),
            )
        }
        prefs.edit().putString(KEY, arr.toString()).apply()
    }

    private companion object {
        const val PREFS = "fitconnect_offline_queue"
        const val KEY = "items"
    }
}
