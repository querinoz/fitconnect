package com.fitconnect.android.wear

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.wear.ongoing.OngoingActivity
import androidx.wear.ongoing.Status
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase

object WearOngoingController {
    const val CHANNEL_ID = "elite_session"
    const val NOTIFICATION_ID = 42

    fun sync(context: Context, phase: LiveActivityPhase, elapsedMs: Long) {
        when (phase) {
            LiveActivityPhase.RUNNING, LiveActivityPhase.PAUSED, LiveActivityPhase.COUNTDOWN ->
                start(context, phase, elapsedMs)
            else -> stop(context)
        }
    }

    private fun start(context: Context, phase: LiveActivityPhase, elapsedMs: Long) {
        ensureChannel(context)
        val launch = PendingIntent.getActivity(
            context,
            0,
            Intent(context, WearMainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val title = when (phase) {
            LiveActivityPhase.PAUSED -> "PAUSED"
            LiveActivityPhase.COUNTDOWN -> "COUNTDOWN"
            else -> "ACTIVE"
        }
        val text = LiveActivityEngine.formatElapsed(elapsedMs)
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_wear_session)
            .setContentTitle(title)
            .setContentText(text)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_WORKOUT)
            .setContentIntent(launch)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
        val ongoing = OngoingActivity.Builder(context, NOTIFICATION_ID, builder)
            .setTouchIntent(launch)
            .setStaticIcon(R.drawable.ic_wear_session)
            .setStatus(Status.Builder().addTemplate(text).build())
            .build()
        ongoing.apply(context)
    }

    fun stop(context: Context) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(NOTIFICATION_ID)
    }

    private fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.getNotificationChannel(CHANNEL_ID) != null) return
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Session", NotificationManager.IMPORTANCE_LOW),
        )
    }
}
