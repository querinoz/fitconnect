package com.fitconnect.android.capture.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.Uri
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

/**
 * Foreground service for an in-progress indoor TRAIN / Fight Mode session.
 * Not a keep-alive for the whole app. Outdoor GPS still uses [CaptureLocationService].
 */
class TrainSessionService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                val phase = intent?.getStringExtra(EXTRA_PHASE) ?: "ACTIVE"
                val clock = intent?.getStringExtra(EXTRA_CLOCK) ?: "0:00"
                val title = intent?.getStringExtra(EXTRA_TITLE) ?: "TRAIN"
                ensureChannel()
                ServiceCompat.startForeground(
                    this,
                    NOTIFICATION_ID,
                    buildNotification(phase, clock, title),
                    if (Build.VERSION.SDK_INT >= 34) {
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
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
        mgr.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                "Active workout",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Shown only while a FitConnect workout is in progress"
            },
        )
    }

    private fun buildNotification(phase: String, clock: String, title: String): Notification {
        val launch = Intent(Intent.ACTION_VIEW, Uri.parse("fitconnect://app/train")).apply {
            setPackage(packageName)
        }
        val pending = PendingIntent.getActivity(
            this,
            0,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("FitConnect · $phase")
            .setContentText("$title · $clock")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pending)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_WORKOUT)
            .build()
    }

    companion object {
        const val CHANNEL_ID = "fitconnect_train_session"
        const val NOTIFICATION_ID = 4202
        const val ACTION_START = "com.fitconnect.android.train.START"
        const val ACTION_STOP = "com.fitconnect.android.train.STOP"
        const val EXTRA_PHASE = "phase"
        const val EXTRA_CLOCK = "clock"
        const val EXTRA_TITLE = "title"

        fun start(context: Context, phase: String, clock: String, title: String) {
            val intent = Intent(context, TrainSessionService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_PHASE, phase)
                putExtra(EXTRA_CLOCK, clock)
                putExtra(EXTRA_TITLE, title)
            }
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, TrainSessionService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }
}
