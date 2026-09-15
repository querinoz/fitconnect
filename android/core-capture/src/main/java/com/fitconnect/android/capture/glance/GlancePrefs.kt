package com.fitconnect.android.capture.glance

import android.content.Context
import com.fitconnect.shared.glance.GlanceSnapshot

object GlancePrefs {
    const val PREFS = "fitconnect.glance"
    const val SNAPSHOT = "snapshot"
    const val SHOW_RECOVERY = "glance.showRecovery"
    const val SHOW_HEART_RATE = "glance.showHeartRate"
    const val SHOW_LOCK_DETAILS = "glance.showLockDetails"

    fun save(context: Context, snapshot: GlanceSnapshot) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(SNAPSHOT, snapshot.toJson())
            .apply()
    }

    fun load(context: Context): GlanceSnapshot {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(SNAPSHOT, null)
        return GlanceSnapshot.fromJson(raw)
    }

    fun showRecovery(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(SHOW_RECOVERY, false)

    fun showHeartRate(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(SHOW_HEART_RATE, false)

    fun showLockDetails(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(SHOW_LOCK_DETAILS, true)
}
