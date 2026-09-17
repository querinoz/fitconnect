package com.fitconnect.android.sports.intelligence

import android.content.Context
import com.fitconnect.android.sports.domain.SportId
import org.json.JSONObject

/** Crash-recovery persistence for [ActiveWorkoutSnapshot]. */
interface ActiveWorkoutStore {
    fun save(snapshot: ActiveWorkoutSnapshot)
    fun load(): ActiveWorkoutSnapshot?
    fun clear()
}

interface ActiveWorkoutBlobBackend {
    fun read(): String?
    fun write(json: String?)
}

class MemoryActiveWorkoutBlobBackend(
    initial: String? = null,
) : ActiveWorkoutBlobBackend {
    @Volatile
    private var blob: String? = initial

    override fun read(): String? = blob

    override fun write(json: String?) {
        blob = json
    }
}

class PrefsActiveWorkoutBlobBackend(
    context: Context,
    prefsName: String = PREFS,
    private val key: String = KEY,
) : ActiveWorkoutBlobBackend {
    private val prefs = context.applicationContext.getSharedPreferences(prefsName, Context.MODE_PRIVATE)

    override fun read(): String? = prefs.getString(key, null)

    override fun write(json: String?) {
        prefs.edit().apply {
            if (json == null) remove(key) else putString(key, json)
        }.apply()
    }

    companion object {
        const val PREFS = "fitconnect_active_workout_v85"
        const val KEY = "snapshot_v1"
    }
}

class BlobActiveWorkoutStore(
    private val backend: ActiveWorkoutBlobBackend,
) : ActiveWorkoutStore {
    override fun save(snapshot: ActiveWorkoutSnapshot) {
        if (snapshot.phase == ActiveWorkoutPhase.IDLE || snapshot.phase == ActiveWorkoutPhase.COMPLETE) {
            // Keep COMPLETE briefly for resume UI; clear IDLE.
            if (snapshot.phase == ActiveWorkoutPhase.IDLE) {
                backend.write(null)
                return
            }
        }
        backend.write(ActiveWorkoutCodec.encode(snapshot))
    }

    override fun load(): ActiveWorkoutSnapshot? {
        val raw = backend.read() ?: return null
        return ActiveWorkoutCodec.decode(raw)
    }

    override fun clear() {
        backend.write(null)
    }
}

object ActiveWorkoutCodec {
    fun encode(snapshot: ActiveWorkoutSnapshot): String {
        val json = JSONObject()
        json.put("phase", snapshot.phase.name)
        json.put("sportId", snapshot.sportId?.value)
        json.put("sessionType", snapshot.sessionType)
        json.put("intent", snapshot.intent)
        json.put("currentAction", snapshot.currentAction)
        json.put("primaryMetricKey", snapshot.primaryMetricKey)
        json.put("primaryMetricLabel", snapshot.primaryMetricLabel)
        json.put("nextAction", snapshot.nextAction)
        json.put("setIndex", snapshot.setIndex)
        json.put("totalSets", snapshot.totalSets)
        json.put("pausedFrom", snapshot.pausedFrom?.name)
        json.put("startedAtWallMs", snapshot.startedAtWallMs)
        json.put("completedAtWallMs", snapshot.completedAtWallMs)
        json.put("sessionId", snapshot.sessionId)
        json.put("lastError", snapshot.lastError)
        snapshot.rest?.let { rest ->
            json.put(
                "rest",
                JSONObject()
                    .put("durationMs", rest.durationMs)
                    .put("startedAtWallMs", rest.startedAtWallMs)
                    .put("endsAtWallMs", rest.endsAtWallMs)
                    .put("frozenRemainingMs", rest.frozenRemainingMs),
            )
        }
        json.put("honesty", encodeHonesty(snapshot.honesty))
        return json.toString()
    }

    fun decode(raw: String): ActiveWorkoutSnapshot? = runCatching {
        val json = JSONObject(raw)
        val phase = ActiveWorkoutPhase.valueOf(json.getString("phase"))
        val sportRaw = json.optString("sportId", "").ifBlank { null }
        ActiveWorkoutSnapshot(
            phase = phase,
            sportId = sportRaw?.let { SportId.of(it) },
            sessionType = json.optString("sessionType", ""),
            intent = json.optString("intent", ""),
            currentAction = json.optString("currentAction", ""),
            primaryMetricKey = json.optString("primaryMetricKey", ""),
            primaryMetricLabel = json.optString("primaryMetricLabel", ""),
            nextAction = json.optString("nextAction", ""),
            setIndex = json.optInt("setIndex", 0),
            totalSets = json.optInt("totalSets", 0),
            rest = json.optJSONObject("rest")?.let { rest ->
                WallClockRestTimer(
                    durationMs = rest.getLong("durationMs"),
                    startedAtWallMs = rest.getLong("startedAtWallMs"),
                    endsAtWallMs = rest.getLong("endsAtWallMs"),
                    frozenRemainingMs = if (rest.isNull("frozenRemainingMs")) null else rest.getLong("frozenRemainingMs"),
                )
            },
            pausedFrom = json.optString("pausedFrom", "").ifBlank { null }?.let { ActiveWorkoutPhase.valueOf(it) },
            startedAtWallMs = json.optLongOrNull("startedAtWallMs"),
            completedAtWallMs = json.optLongOrNull("completedAtWallMs"),
            honesty = decodeHonesty(json.optJSONObject("honesty")),
            lastError = json.optString("lastError", "").ifBlank { null },
            sessionId = json.optString("sessionId", ""),
        )
    }.getOrNull()

    private fun encodeHonesty(bundle: SessionHonestyBundle): JSONObject =
        JSONObject()
            .put("readiness", encodeMetric(bundle.readiness))
            .put("heartRateBpm", encodeMetric(bundle.heartRateBpm))
            .put("caloriesKcal", encodeMetric(bundle.caloriesKcal))

    private fun <T> encodeMetric(metric: HonestMetric<T>): JSONObject =
        JSONObject()
            .put("status", metric.status.name)
            .put("value", metric.value)
            .put("reason", metric.reason)

    private fun decodeHonesty(json: JSONObject?): SessionHonestyBundle {
        if (json == null) return SessionHonestyBundle()
        return SessionHonestyBundle(
            readiness = decodeIntMetric(json.optJSONObject("readiness")),
            heartRateBpm = decodeIntMetric(json.optJSONObject("heartRateBpm")),
            caloriesKcal = decodeIntMetric(json.optJSONObject("caloriesKcal")),
        )
    }

    private fun decodeIntMetric(json: JSONObject?): HonestMetric<Int> {
        if (json == null) return HonestMetric.missing()
        val status = HonestyStatus.valueOf(json.getString("status"))
        val value = if (json.isNull("value")) null else json.getInt("value")
        val reason = json.optString("reason", "")
        return if (status == HonestyStatus.AVAILABLE && value != null) {
            HonestMetric.available(value, reason)
        } else {
            HonestMetric(status, null, reason)
        }
    }

    private fun JSONObject.optLongOrNull(key: String): Long? =
        if (!has(key) || isNull(key)) null else getLong(key)
}

/**
 * Controller that reduces + persists for crash recovery.
 */
class ActiveWorkoutController(
    private val store: ActiveWorkoutStore,
    private val clock: WorkoutWallClock = SystemWorkoutWallClock,
) {
    @Volatile
    private var state: ActiveWorkoutSnapshot = store.load()?.takeIf { it.isInProgress() }
        ?: ActiveWorkoutSnapshot.idle()

    fun snapshot(): ActiveWorkoutSnapshot = state

    fun dispatch(command: ActiveWorkoutCommand): ActiveWorkoutReduceResult {
        val result = ActiveWorkoutMachine.reduce(state, command, clock)
        if (result.rejected == null) {
            state = result.state
            store.save(state)
        }
        return result
    }

    fun recoverFromStore(): ActiveWorkoutReduceResult {
        val loaded = store.load() ?: return ActiveWorkoutReduceResult(
            ActiveWorkoutSnapshot.idle(),
            rejected = "Nothing to recover.",
        )
        return dispatch(ActiveWorkoutCommand.Recover(loaded))
    }
}
