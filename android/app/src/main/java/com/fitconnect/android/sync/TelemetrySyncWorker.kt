package com.fitconnect.android.sync

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.fitconnect.android.glance.FitConnectGlanceWidget
import com.fitconnect.android.telemetry.sync.BackgroundSyncPolicy
import java.util.concurrent.TimeUnit

/**
 * Deferred sync + widget refresh. Not a keep-alive. Six-hour cadence matches
 * the Health Connect / provider safety net, not live workout telemetry.
 */
class TelemetrySyncWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val last = prefs.getLong(LAST_RUN, 0L).takeIf { it > 0L }
        val now = System.currentTimeMillis()
        if (!BackgroundSyncPolicy().shouldRun(last, now, batteryLow = false, online = true)) {
            return Result.success()
        }
        prefs.edit().putLong(LAST_RUN, now).apply()
        FitConnectGlanceWidget.refreshAll(applicationContext)
        return Result.success()
    }

    companion object {
        const val UNIQUE = "fitconnect.background.sync"
        const val PREFS = "fitconnect.background.sync"
        const val LAST_RUN = "last_run_epoch_ms"
    }
}

object BackgroundWorkScheduler {
    fun register(context: Context) {
        val request = PeriodicWorkRequestBuilder<TelemetrySyncWorker>(6, TimeUnit.HOURS)
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .setRequiresBatteryNotLow(true)
                    .build(),
            )
            .build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            TelemetrySyncWorker.UNIQUE,
            ExistingPeriodicWorkPolicy.KEEP,
            request,
        )
    }
}
