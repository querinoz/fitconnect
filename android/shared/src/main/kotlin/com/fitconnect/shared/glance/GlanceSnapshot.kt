package com.fitconnect.shared.glance

import org.json.JSONObject

enum class BackgroundClass {
    CONTINUOUS_SESSION,
    EVENT_DRIVEN,
    PERIODIC_SYNC,
    PUSH_DRIVEN,
    USER_INITIATED,
    NOT_NEEDED,
}

data class BackgroundWorkload(
    val feature: String,
    val classification: BackgroundClass,
    val ios: String,
    val watchOs: String,
    val android: String,
    val web: String,
)

object BackgroundWorkloadCatalog {
    const val KEEP_ENTIRE_APP_ALIVE = false

    val rows: List<BackgroundWorkload> = listOf(
        BackgroundWorkload(
            "TRAIN / Fight Mode",
            BackgroundClass.CONTINUOUS_SESSION,
            "HKWorkoutSession + ActivityKit",
            "HKWorkoutSession",
            "Foreground service + ongoing notification",
            "Foreground tab",
        ),
        BackgroundWorkload(
            "Health sync",
            BackgroundClass.EVENT_DRIVEN,
            "HealthKit observer + background delivery",
            "Session samples",
            "Health Connect + WorkManager",
            "Server webhook",
        ),
        BackgroundWorkload(
            "Widgets",
            BackgroundClass.PERIODIC_SYNC,
            "WidgetKit timeline",
            "Complication timeline",
            "AppWidget updatePeriodMillis",
            "None",
        ),
        BackgroundWorkload(
            "Feed / Zenith / MCP",
            BackgroundClass.NOT_NEEDED,
            "none",
            "none",
            "none",
            "none",
        ),
    )

    fun allowsPermanentProcess(): Boolean = KEEP_ENTIRE_APP_ALIVE
}

data class GlanceSnapshot(
    val sessionId: String = "",
    val kind: String = "idle",
    val phase: String = "IDLE",
    val title: String = "No session",
    val remainingSec: Int = 0,
    val roundLabel: String = "",
    val nextAction: String = "Open TRAIN",
    val heartRateLabel: String = "DATA UNAVAILABLE",
    val sport: String = "Strength",
    val durationMin: Int = 45,
    val syncStatus: String = "IDLE",
    val deviceStatus: String = "NOT CONNECTED",
    val coachNext: String = "No bookings",
    val xp: Int = 0,
    val streak: Int = 0,
    val recoveryHRV: String = "DATA UNAVAILABLE",
    val recoverySleep: String = "DATA UNAVAILABLE",
    val deepLink: String = "fitconnect://app/train",
) {
    val isLive: Boolean
        get() = phase in LIVE_PHASES

    val clock: String
        get() = formatClock(remainingSec)

    fun toJson(): String = JSONObject()
        .put("sessionId", sessionId)
        .put("kind", kind)
        .put("phase", phase)
        .put("title", title)
        .put("remainingSec", remainingSec)
        .put("roundLabel", roundLabel)
        .put("nextAction", nextAction)
        .put("heartRateLabel", heartRateLabel)
        .put("sport", sport)
        .put("durationMin", durationMin)
        .put("syncStatus", syncStatus)
        .put("deviceStatus", deviceStatus)
        .put("coachNext", coachNext)
        .put("xp", xp)
        .put("streak", streak)
        .put("recoveryHRV", recoveryHRV)
        .put("recoverySleep", recoverySleep)
        .put("deepLink", deepLink)
        .toString()

    fun redact(
        showRecovery: Boolean,
        showHeartRate: Boolean,
        showLockDetails: Boolean,
        surface: String,
    ): GlanceSnapshot {
        var next = this
        if (surface == "widget" && !showRecovery) {
            next = next.copy(recoveryHRV = "HIDDEN", recoverySleep = "HIDDEN")
        }
        if ((surface == "live" || surface == "notification") && !showHeartRate) {
            next = next.copy(heartRateLabel = "HIDDEN")
        }
        if (surface == "live" && !showLockDetails) {
            next = next.copy(title = "TRAINING", nextAction = "", roundLabel = "")
        }
        return next
    }

    companion object {
        val IDLE = GlanceSnapshot()
        private val LIVE_PHASES = setOf(
            "ACTIVE", "WARMUP", "WARNING", "REST", "PAUSED", "PREP",
            "ROUND", "WORK", "COUNTDOWN", "RUNNING", "RESUMING",
        )

        fun formatClock(remainingSec: Int): String {
            val safe = remainingSec.coerceAtLeast(0)
            return "${safe / 60}:${(safe % 60).toString().padStart(2, '0')}"
        }

        fun fromJson(raw: String?): GlanceSnapshot {
            if (raw.isNullOrBlank()) return IDLE
            return runCatching {
                val o = JSONObject(raw)
                GlanceSnapshot(
                    sessionId = o.optString("sessionId"),
                    kind = o.optString("kind", "idle"),
                    phase = o.optString("phase", "IDLE"),
                    title = o.optString("title", IDLE.title),
                    remainingSec = o.optInt("remainingSec"),
                    roundLabel = o.optString("roundLabel"),
                    nextAction = o.optString("nextAction", IDLE.nextAction),
                    heartRateLabel = o.optString("heartRateLabel", IDLE.heartRateLabel),
                    sport = o.optString("sport", IDLE.sport),
                    durationMin = o.optInt("durationMin", IDLE.durationMin),
                    syncStatus = o.optString("syncStatus", IDLE.syncStatus),
                    deviceStatus = o.optString("deviceStatus", IDLE.deviceStatus),
                    coachNext = o.optString("coachNext", IDLE.coachNext),
                    xp = o.optInt("xp"),
                    streak = o.optInt("streak"),
                    recoveryHRV = o.optString("recoveryHRV", IDLE.recoveryHRV),
                    recoverySleep = o.optString("recoverySleep", IDLE.recoverySleep),
                    deepLink = o.optString("deepLink", IDLE.deepLink),
                )
            }.getOrDefault(IDLE)
        }
    }
}
