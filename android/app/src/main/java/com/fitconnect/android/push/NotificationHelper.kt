package com.fitconnect.android.push

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.fitconnect.android.MainActivity
import com.fitconnect.android.R
import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationCategory

/**
 * System notification channels + local posting. Safe when POST_NOTIFICATIONS is denied
 * (no crash — showLocal becomes a no-op).
 */
class NotificationHelper(
    context: Context,
) {
    private val appContext = context.applicationContext
    private val manager = NotificationManagerCompat.from(appContext)

    init {
        ensureChannels()
    }

    fun showLocal(request: LocalNotificationRequest) {
        if (!canPostNotifications()) return
        if (!manager.areNotificationsEnabled()) return

        val channelId = channelIdFor(request.category)
        val builder = NotificationCompat.Builder(appContext, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(request.title)
            .setContentText(request.body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(request.body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)

        request.deepLink?.takeIf { it.isNotBlank() }?.let { link ->
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link), appContext, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pending = PendingIntent.getActivity(
                appContext,
                request.id,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            builder.setContentIntent(pending)
        }

        // Permission gated above; lint cannot always prove API 33 path.
        @Suppress("MissingPermission")
        runCatching {
            manager.notify(request.id, builder.build())
        }
    }

    fun cancel(id: Int) {
        runCatching { manager.cancel(id) }
    }

    private fun canPostNotifications(): Boolean {
        if (Build.VERSION.SDK_INT < 33) return true
        return ContextCompat.checkSelfPermission(
            appContext,
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun ensureChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val systemManager = appContext.getSystemService(NotificationManager::class.java) ?: return
        NotificationCategory.entries.forEach { category ->
            val channel = NotificationChannel(
                channelIdFor(category),
                channelNameFor(category),
                NotificationManager.IMPORTANCE_DEFAULT,
            )
            systemManager.createNotificationChannel(channel)
        }
    }

    private fun channelIdFor(category: NotificationCategory): String =
        "fitconnect_${category.name.lowercase()}"

    private fun channelNameFor(category: NotificationCategory): String =
        when (category) {
            NotificationCategory.SYSTEM -> appContext.getString(R.string.notification_channel_system)
            NotificationCategory.SESSION -> appContext.getString(R.string.notification_channel_session)
            NotificationCategory.TRAINING -> appContext.getString(R.string.notification_channel_training)
            NotificationCategory.SOCIAL -> appContext.getString(R.string.notification_channel_social)
            NotificationCategory.MARKETING -> appContext.getString(R.string.notification_channel_marketing)
            NotificationCategory.PROGRESSION -> appContext.getString(R.string.notification_channel_progression)
        }
}
