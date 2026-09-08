package com.fitconnect.android.geo.booking

import android.content.Context
import java.util.concurrent.ConcurrentHashMap
import org.json.JSONArray
import org.json.JSONObject

/**
 * Durable booking cache. Survives process death when backed by prefs/file.
 * In-memory mirror stays the sync read path for [BookingEngine.list]/[BookingEngine.get].
 */
interface BookingStore {
    fun all(): List<Booking>
    fun get(id: String): Booking?
    fun upsert(booking: Booking)
    fun remove(id: String)
    fun replaceAll(bookings: Collection<Booking>)
    fun clear()
    fun size(): Int
}

/** Process-local only — tests and pure local demo without persistence hooks. */
class InMemoryBookingStore : BookingStore {
    private val map = ConcurrentHashMap<String, Booking>()

    override fun all(): List<Booking> = map.values.toList()

    override fun get(id: String): Booking? = map[id]

    override fun upsert(booking: Booking) {
        map[booking.id] = booking
    }

    override fun remove(id: String) {
        map.remove(id)
    }

    override fun replaceAll(bookings: Collection<Booking>) {
        map.clear()
        bookings.forEach { map[it.id] = it }
    }

    override fun clear() {
        map.clear()
    }

    override fun size(): Int = map.size
}

/** JSON blob backend — SharedPreferences in production, string holder in JVM tests. */
interface BookingBlobBackend {
    fun read(): String?
    fun write(json: String)
}

class PrefsBookingBlobBackend(
    context: Context,
    prefsName: String = PREFS,
    private val key: String = KEY,
) : BookingBlobBackend {
    private val prefs = context.applicationContext.getSharedPreferences(prefsName, Context.MODE_PRIVATE)

    override fun read(): String? = prefs.getString(key, null)

    override fun write(json: String) {
        prefs.edit().putString(key, json).apply()
    }

    companion object {
        const val PREFS = "fitconnect_booking_store"
        const val KEY = "bookings_v1"
    }
}

class MemoryBookingBlobBackend(
    initial: String? = null,
) : BookingBlobBackend {
    @Volatile
    private var blob: String? = initial

    override fun read(): String? = blob

    override fun write(json: String) {
        blob = json
    }

    fun snapshot(): String? = blob
}

class DurableBookingStore(
    private val backend: BookingBlobBackend,
) : BookingStore {
    private val map = ConcurrentHashMap<String, Booking>()

    init {
        hydrate()
    }

    override fun all(): List<Booking> = map.values.toList()

    override fun get(id: String): Booking? = map[id]

    override fun upsert(booking: Booking) {
        map[booking.id] = booking
        persist()
    }

    override fun remove(id: String) {
        map.remove(id)
        persist()
    }

    override fun replaceAll(bookings: Collection<Booking>) {
        map.clear()
        bookings.forEach { map[it.id] = it }
        persist()
    }

    override fun clear() {
        map.clear()
        persist()
    }

    override fun size(): Int = map.size

    private fun hydrate() {
        val raw = backend.read() ?: return
        runCatching {
            val arr = JSONArray(raw)
            for (i in 0 until arr.length()) {
                val booking = BookingCodec.decode(arr.getJSONObject(i))
                map[booking.id] = booking
            }
        }
    }

    private fun persist() {
        val arr = JSONArray()
        map.values.sortedBy { it.createdAtEpochMs }.forEach { arr.put(BookingCodec.encode(it)) }
        backend.write(arr.toString())
    }
}

object BookingCodec {
    fun encode(booking: Booking): JSONObject {
        val req = booking.request
        return JSONObject()
            .put("id", booking.id)
            .put("status", booking.status.name)
            .put("waitlistPosition", booking.waitlistPosition)
            .put("createdAtEpochMs", booking.createdAtEpochMs)
            .put("updatedAtEpochMs", booking.updatedAtEpochMs)
            .put("syncState", booking.syncState.name)
            .put(
                "request",
                JSONObject()
                    .put("targetKind", req.targetKind.name)
                    .put("targetId", req.targetId)
                    .put("clientId", req.clientId)
                    .put("clientName", req.clientName)
                    .put("startEpochMs", req.startEpochMs)
                    .put("durationMin", req.durationMin)
                    .put("mode", req.mode.name)
                    .put("recurringRule", req.recurringRule)
                    .put("notes", req.notes)
                    .put("autoConfirm", req.autoConfirm),
            )
    }

    fun decode(o: JSONObject): Booking {
        val req = o.getJSONObject("request")
        return Booking(
            id = o.getString("id"),
            request = BookingRequest(
                targetKind = com.fitconnect.android.geo.domain.BookingTargetKind.valueOf(
                    req.getString("targetKind"),
                ),
                targetId = req.getString("targetId"),
                clientId = req.getString("clientId"),
                clientName = req.getString("clientName"),
                startEpochMs = req.getLong("startEpochMs"),
                durationMin = req.getInt("durationMin"),
                mode = com.fitconnect.android.geo.domain.SessionMode.valueOf(req.getString("mode")),
                recurringRule = req.optString("recurringRule").takeIf { it.isNotBlank() },
                notes = req.optString("notes").takeIf { it.isNotBlank() },
                autoConfirm = req.optBoolean("autoConfirm", false),
            ),
            status = com.fitconnect.android.geo.domain.BookingLifecycle.valueOf(o.getString("status")),
            waitlistPosition = if (o.isNull("waitlistPosition")) null else o.optInt("waitlistPosition"),
            createdAtEpochMs = o.optLong("createdAtEpochMs", System.currentTimeMillis()),
            updatedAtEpochMs = o.optLong("updatedAtEpochMs", System.currentTimeMillis()),
            syncState = runCatching {
                BookingSyncState.valueOf(o.optString("syncState", BookingSyncState.SYNCED.name))
            }.getOrDefault(BookingSyncState.SYNCED),
        )
    }
}
