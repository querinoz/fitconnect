package com.fitconnect.android.capture.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

/**
 * Foreground location service for active outdoor tracking.
 * Does not request ACCESS_BACKGROUND_LOCATION — tracking is user-started
 * foreground workout capture only.
 */
class CaptureLocationService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                val elapsed = intent?.getStringExtra(EXTRA_ELAPSED) ?: "00:00"
                val distance = intent?.getStringExtra(EXTRA_DISTANCE) ?: "—"
                val paused = intent?.getBooleanExtra(EXTRA_PAUSED, false) == true
                ensureChannel()
                val notification = buildNotification(elapsed, distance, paused)
                ServiceCompat.startForeground(
                    this,
                    NOTIFICATION_ID,
                    notification,
                    if (Build.VERSION.SDK_INT >= 29) {
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
                    } else {
                        0
                    },
                )
            }
        }
        return START_STICKY
    }

    private fun ensureChannel() {
        val mgr = getSystemService(NotificationManager::class.java) ?: return
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Outdoor activity",
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Shows while FitConnect is recording an outdoor activity"
        }
        mgr.createNotificationChannel(channel)
    }

    private fun buildNotification(elapsed: String, distance: String, paused: Boolean): Notification {
        val launch = packageManager.getLaunchIntentForPackage(packageName)
        val pending = PendingIntent.getActivity(
            this,
            0,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val title = if (paused) "FitConnect · Paused" else "FitConnect · Recording"
        val text = "Elapsed $elapsed · Distance $distance"
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pending)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_WORKOUT)
            .build()
    }

    companion object {
        const val CHANNEL_ID = "fitconnect_outdoor_tracking"
        const val NOTIFICATION_ID = 4201
        const val ACTION_START = "com.fitconnect.android.capture.START"
        const val ACTION_UPDATE = "com.fitconnect.android.capture.UPDATE"
        const val ACTION_STOP = "com.fitconnect.android.capture.STOP"
        const val EXTRA_ELAPSED = "elapsed"
        const val EXTRA_DISTANCE = "distance"
        const val EXTRA_PAUSED = "paused"

        fun start(context: Context, elapsed: String, distance: String, paused: Boolean = false) {
            val intent = Intent(context, CaptureLocationService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_ELAPSED, elapsed)
                putExtra(EXTRA_DISTANCE, distance)
                putExtra(EXTRA_PAUSED, paused)
            }
            context.startForegroundService(intent)
        }

        fun update(context: Context, elapsed: String, distance: String, paused: Boolean) {
            start(context, elapsed, distance, paused)
        }

        fun stop(context: Context) {
            val intent = Intent(context, CaptureLocationService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }
}
